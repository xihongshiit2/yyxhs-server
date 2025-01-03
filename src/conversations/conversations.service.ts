import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Conversation, ConversationType } from './entities/conversation.entity';
import { ConversationMember } from 'src/conversation-members/entities/conversation-member.entity';
import { UsersService } from 'src/users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
    @InjectRepository(ConversationMember)
    private conversationMembersRepository: Repository<ConversationMember>,
    private userService: UsersService,
  ) {}

  /**
   * 创建会话（私聊或群聊）
   * @param currentUser 当前登录用户
   * @param createConversationDto 创建会话的DTO
   */
  async createConversation(
    currentUser: User,
    createConversationDto: CreateConversationDto,
  ): Promise<Conversation> {
    const { conversationType, title, avatarUrl, members } =
      createConversationDto;

    // 确保成员数组包含当前用户的ID
    if (!members.includes(currentUser.key_id)) {
      members.push(currentUser.key_id);
    }

    // 获取需要添加到会话中的用户
    const users = await this.userService.findUsersByIds(members);
    if (users.length !== members.length) {
      throw new NotFoundException('部分用户不存在');
    }

    if (conversationType === ConversationType.PRIVATE) {
      // 私聊
      if (members.length !== 2) {
        throw new BadRequestException('私聊会话只能是两名成员');
      }
      // 检查是否已存在相同的私聊会话
      const existingConversation = await this.conversationsRepository.findOne({
        where: { conversation_type: 1 },
        relations: ['members', 'members.user'],
      });
      if (existingConversation) {
        const memberIds = existingConversation.members
          .map((m) => m.user.key_id)
          .sort();
        const sortedNewMemberIds = members.sort();
        if (
          memberIds[0] === sortedNewMemberIds[0] &&
          memberIds[1] === sortedNewMemberIds[1]
        ) {
          throw new ConflictException('相同的私聊会话已存在');
        }
      }
    }

    // 创建会话
    const conversation = this.conversationsRepository.create({
      conversation_type: conversationType,
      title: conversationType === 2 ? title : null,
      avatar_url: conversationType === 2 ? avatarUrl : null,
      creator: currentUser,
      members: [], // 通过 ConversationMember 创建关系
    });

    await this.conversationsRepository.save(conversation);

    // 创建会话成员
    const conversationMembers: ConversationMember[] = users.map((user) => {
      const member = new ConversationMember();
      member.conversation = conversation;
      member.user = user;
      member.role =
        user.key_id === currentUser.key_id && conversationType === 2 ? 2 : 0; // 群主或普通成员
      return member;
    });

    await this.conversationMembersRepository.save(conversationMembers);
    // 更新 conversation 中的 members
    conversation.members = conversationMembers;
    await this.conversationsRepository.save(conversation);
    return conversation;
  }
  /**
   * 添加成员到群聊
   * @param currentUser 当前登录用户
   * @param conversationId 会话ID
   * @param addMemberDto 被添加的用户ID
   */
  async addMember(
    currentUser: User,
    conversationId: number,
    addMemberDto: AddMemberDto,
  ): Promise<void> {
    const { userId } = addMemberDto;
    const conversation = await this.conversationsRepository.findOne({
      where: { key_id: conversationId },
      relations: ['members', 'members.user'],
    });
    if (!conversation) {
      throw new NotFoundException('会话不存在');
    }

    if (conversation.conversation_type !== ConversationType.GROUP) {
      // 仅群聊支持添加成员
      throw new BadRequestException('只能在群聊中添加成员');
    }

    // 检查当前用户是否是群主或管理员
    const currentMember = conversation.members.find(
      (m) => m.user.key_id === currentUser.key_id,
    );
    if (
      !currentMember ||
      (currentMember.role !== 1 && currentMember.role !== 2)
    ) {
      throw new ForbiddenException('只有群主或管理员可以添加成员');
    }

    const userToAdd = await this.userService.findById(userId);
    if (!userToAdd) {
      throw new NotFoundException('被添加的用户不存在');
    }
    // 检查用户是否已在会话中
    const existingMember = conversation.members.find(
      (m) => m.user.key_id == userId,
    );
    if (existingMember) {
      throw new ConflictException('用户已在会话中');
    }
    // 添加新成员
    const newMember = this.conversationMembersRepository.create({
      conversation,
      user: userToAdd,
      role: 0, // 普通成员
    });
    await this.conversationMembersRepository.save(newMember);
  }

  /**
   * 移除成员从群聊
   * @param currentUser 当前登录用户
   * @param conversationId 会话ID
   * @param memberId 被移除的成员ID
   */
  async removeMember(
    currentUser: User,
    conversationId: number,
    memberId: number,
  ): Promise<void> {
    const conversation = await this.conversationsRepository.findOne({
      where: { key_id: conversationId },
      relations: ['members', 'members.user'],
    });

    if (!conversation) {
      throw new NotFoundException('会话不存在');
    }

    if (conversation.conversation_type !== ConversationType.GROUP) {
      throw new BadRequestException('只能在群聊中移除成员');
    }

    // 检查当前用户是否是群主或管理员
    const currentMember = conversation.members.find(
      (m) => m.user.key_id === currentUser.key_id,
    );
    if (
      !currentMember ||
      (currentMember.role !== 1 && currentMember.role !== 2)
    ) {
      throw new ForbiddenException('只有群主或管理员可以移除成员');
    }
    const member = conversation.members.find((m) => m.user.key_id == memberId);
    if (!member) {
      throw new NotFoundException('成员不存在于会话中');
    }
    if (member.role === 2) {
      // 不能移除群主
      throw new ForbiddenException('不能移除群主');
    }
    await this.conversationMembersRepository.remove(member);
  }

  /**
   * 根据用户ID数组获取用户列表
   * @param userIds 用户ID数组
   */
  async findConversationMembersByIds(userIds: number[]): Promise<User[]> {
    return await this.userService.findUsersByIds(userIds);
  }

  /**
   * 获取用户参与的会话列表
   * @param currentUser 当前用户
   */
  async listUserConversations(currentUser: User): Promise<Conversation[]> {
    const conversations = await this.conversationsRepository.find({
      where: { members: { user: { key_id: currentUser.key_id } } },
      relations: ['members', 'members.user', 'creator'],
      order: { updated_at: 'DESC' },
    });
    return conversations;
  }

  /**
   * 根据会话ID获取会话
   * @param conversationId 会话ID
   */
  async getConversationById(
    conversationId: number,
  ): Promise<Conversation | null> {
    return this.conversationsRepository.findOne({
      where: { key_id: conversationId },
      relations: ['members', 'members.user', 'creator'],
    });
  }

  /**
   * 更新会话的消息数量
   * @param conversationId 会话ID
   * @param messageCount 消息数量
   */
  async updateMessageCount(
    conversationId: number,
    messageCount: number,
  ): Promise<void> {
    await this.conversationsRepository.update(conversationId, {
      message_count: messageCount,
    });
  }
}
