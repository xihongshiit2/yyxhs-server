import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { Friend } from './entities/friend.entity';
import { UsersService } from 'src/users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { SendFriendRequestDto } from './dto/send-friend-request.dto';
import { RespondFriendRequestDto } from './dto/respond-friend-request.dto';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friend) private friendsRepository: Repository<Friend>,
    private userService: UsersService,
  ) {}

  /**
   * 发送好友请求
   * @param currentUser
   * @param sendFriendRequestDto
   */
  async sendFriendRequest(
    currentUser: User,
    sendFriendRequestDto: SendFriendRequestDto,
  ): Promise<void> {
    const { friendId } = sendFriendRequestDto;

    if (currentUser.key_id == friendId) {
      throw new BadRequestException('不能添加自己为好友');
    }

    const friend = await this.userService.findById(friendId);
    if (!friend) {
      throw new NotFoundException('被请求的用户不存在');
    }

    // 检查是否已经有一个未处理的请求或已经是好友
    const existingFriend = await this.friendsRepository.findOne({
      where: [
        {
          user: { key_id: currentUser.key_id },
          friend: { key_id: friend.key_id },
        },
        {
          user: { key_id: friend.key_id },
          friend: { key_id: currentUser.key_id },
        },
      ],
      relations: ['user', 'friend'],
    });

    if (existingFriend) {
      if (existingFriend.status === 0) {
        throw new ConflictException('已有一个未处理的好友请求');
      } else if (existingFriend.status === 1) {
        throw new ConflictException('你们已经是好友了');
      } else if (existingFriend.status === 2) {
        existingFriend.status = 0; // 重置为请求中
        await this.friendsRepository.save(existingFriend);
        return;
        // throw new ConflictException('该好友请求已被拒绝');
      }
    }

    // 创建新的好友请求
    const newFriendRequest = this.friendsRepository.create({
      user: currentUser,
      friend,
      status: 0,
    });

    try {
      await this.friendsRepository.save(newFriendRequest);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if ((error as any).code === 'ER_DUP_ENTRY') {
          throw new ConflictException('好友请求已存在');
        }
      }
      throw error;
    }
  }

  /**
   * 响应好友请求
   * @param currentUser
   * @param respondFriendRequestDto
   */
  async respondFriendRequest(
    currentUser: User,
    respondFriendRequestDto: RespondFriendRequestDto,
  ): Promise<void> {
    const { requestId, accept } = respondFriendRequestDto;

    const friendRequest = await this.friendsRepository.findOne({
      where: [
        {
          key_id: requestId,
          friend: { key_id: currentUser.key_id },
          status: 0,
        },
      ],
    });

    if (!friendRequest) {
      throw new NotFoundException('好友请求不存在或已被处理');
    }

    if (accept) {
      friendRequest.status = 1; // 已成为好友
      await this.friendsRepository.save(friendRequest);
    } else {
      friendRequest.status = 2; // 已拒绝
      await this.friendsRepository.save(friendRequest);
    }
  }

  /**
   * 获取当前用户的好友列表
   * @param currentUser
   * @returns
   */
  async listFriends(currentUser: User): Promise<User[]> {
    const friends = await this.friendsRepository.find({
      where: [
        { user: { key_id: currentUser.key_id }, status: 1 },
        { friend: { key_id: currentUser.key_id }, status: 1 },
      ],
      relations: ['user', 'friend'],
    });

    return friends.map((f) =>
      f.user.key_id === currentUser.key_id ? f.user : f.friend,
    );
  }

  /**
   * 获取当前用户收到的好友请求
   * @param currentUser
   * @returns
   */
  async listFriendRequests(currentUser: User): Promise<Friend[]> {
    const requests = await this.friendsRepository.find({
      where: [{ friend: { key_id: currentUser.key_id }, status: 0 }],
      relations: ['user', 'friend'],
      order: { created_at: 'DESC' },
    });
    return requests;
  }

  /**
   * 删除好友
   * @param currentUser
   * @param friend
   */
  async removeFriend(currentUser: User, friendId: number): Promise<void> {
    const friend = await this.userService.findById(friendId);

    if (!friend) {
      throw new NotFoundException('好友不存在');
    }

    const existingFriend = await this.friendsRepository.findOne({
      where: [
        {
          user: { key_id: currentUser.key_id },
          friend: { key_id: friend.key_id },
          status: 1,
        },
        {
          user: { key_id: friend.key_id },
          friend: { key_id: currentUser.key_id },
          status: 1,
        },
      ],
    });

    if (!existingFriend) {
      throw new NotFoundException('好友关系不存在');
    }

    await this.friendsRepository.remove(existingFriend);
  }
}
