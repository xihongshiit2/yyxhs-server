import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { MessageAttachment } from './entities/message-attachment.entity';
import { ConversationsService } from 'src/conversations/conversations.service';
import { InjectRepository } from '@nestjs/typeorm';
import { GetMessagesDto } from './dto/get-messages.dto';
import { User } from 'src/users/entities/user.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageStatusService } from 'src/message-status/message-status.service';
import { Conversation } from 'src/conversations/entities/conversation.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private messagesRepository: Repository<Message>,
    @InjectRepository(MessageAttachment)
    private attachmentsRepository: Repository<MessageAttachment>,
    private conversationsService: ConversationsService,
    @Inject(forwardRef(() => MessageStatusService))
    private messageStatusService: MessageStatusService,
  ) {}

  /**
   * 发送消息
   * @param currentUser 当前登录用户
   * @param sendMessageDto 发送消息的DTO
   * @param attachments 上传的文件
   */
  async sendMessage(
    currentUser: User,
    sendMessageDto: SendMessageDto,
    attachments?: Express.Multer.File[],
  ): Promise<Message> {
    const { conversationId, messageType, content } = sendMessageDto;
    // 获取会话
    const conversation =
      await this.conversationsService.getConversationById(conversationId);
    if (!conversation) {
      throw new NotFoundException('会话不存在');
    }
    // 检查用户是否是会话成员
    const isMember = conversation.members.some(
      (member) => member.user.key_id === currentUser.key_id,
    );
    if (!isMember) {
      throw new ForbiddenException('你不是该会话的成员');
    }
    // 创建消息
    const message = this.messagesRepository.create({
      conversation,
      sender: currentUser,
      message_type: messageType,
      content: messageType === 1 ? content : null, // 仅文本消息有内容
      attachments: [],
    });

    // 处理附件
    if (attachments && attachments.length > 0) {
      for (const file of attachments) {
        const attachmentType = this.getAttachmentType(
          messageType,
          file.mimetype,
        );
        if (!attachmentType) {
          throw new BadRequestException('不支持的文件类型');
        }
        const attachment = this.attachmentsRepository.create({
          message,
          attachment_type: attachmentType,
          file_url: file.path, // 根据存储策略调整路径
          file_name: file.originalname,
          file_size: file.size,
          metadata: this.extractMetadata(attachmentType, file),
        });
        message.attachments.push(attachment);
      }
    }

    // 保存消息和附件
    await this.messagesRepository.save(message);

    // 更新会话的消息数量
    conversation.message_count += 1;
    await this.conversationsService.updateMessageCount(
      conversation.key_id,
      conversation.message_count,
    );

    // 获取会话成员作为消息接收者（排除发送者）
    const recipients = conversation.members
      .map((member) => member.user)
      .filter((user) => user.key_id !== currentUser.key_id);

    // 创建消息状态
    await this.messageStatusService.createMessageStatuses(message, recipients);
    return message;
  }

  /**
   * 获取会话中的消息列表
   * @param currentUser 当前登录用户
   * @param getMessagesDto 获取消息的DTO
   */
  async getMessages(
    currentUser: User,
    getMessagesDto: GetMessagesDto,
  ): Promise<{
    messages: Message[];
    conversation: Conversation;
    total: number;
  }> {
    const { conversationId, page = 1, limit = 20 } = getMessagesDto;

    // 获取会话
    const conversation =
      await this.conversationsService.getConversationById(conversationId);
    if (!conversation) {
      throw new NotFoundException('会话不存在');
    }
    // 检查用户是否是会话成员
    const isMember = conversation.members.some(
      (member) => member.user.key_id === currentUser.key_id,
    );
    if (!isMember) {
      throw new ForbiddenException('你不是该会话的成员');
    }
    // 获取消息
    const [messages, total] = await this.messagesRepository.findAndCount({
      where: { conversation: { key_id: conversationId } },
      relations: ['sender', 'attachments'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 标记已读
    const messageIds = messages.map((msg) => msg.key_id);
    await this.markManyAsRead(messageIds, currentUser.key_id);

    return { messages: messages.reverse(), conversation, total }; // 将消息按时间正序排列
  }

  /**
   * 标记多条消息为已读
   * @param messageIds 消息ID数组
   * @param userId 用户ID
   */
  async markManyAsRead(messageIds: number[], userId: number): Promise<void> {
    for (const messageId of messageIds) {
      await this.messageStatusService.markAsRead(messageId, userId);
    }
  }

  /**
   * 根据 MIME 类型确定附件类型
   * @param messageType 消息类型
   * @param mimetype 文件 MIME 类型
   */
  private getAttachmentType(
    messageType: number,
    mimetype: string,
  ): number | null {
    switch (messageType) {
      case 2:
        if (mimetype.startsWith('image/')) {
          return 2;
        }
        return 2;
      case 3: // 文件
        return 3;
      case 4: // 音频
        if (mimetype.startsWith('audio/')) {
          return 4;
        }
        return 4;
      case 5: // 视频
        if (mimetype.startsWith('video/')) {
          return 5;
        }
        break;
      default:
        break;
    }
    return null;
  }

  /**
   * 根据附件类型提取元数据
   * @param attachmentType 附件类型
   * @param file 上传的文件
   */
  private extractMetadata(
    attachmentType: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _file: Express.Multer.File,
  ): Record<string, any> | null {
    // 根据不同的附件类型提取元数据
    switch (attachmentType) {
      case 2:
        // 可以集成图片处理库，如 sharp，提取宽高等
        // 这里使用伪代码
        return { width: 800, height: 600 };
      case 4: // 音频
        // 可以集成音频处理库，提取时长等
        return { duration: 120 }; // 120秒
      case 5: // 视频
        // 可以集成视频处理库，提取时长和分辨率等
        return { duration: 300, resolution: '1280x720' };
      default:
        return null;
    }
  }
}
