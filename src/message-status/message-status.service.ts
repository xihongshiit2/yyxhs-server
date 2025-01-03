import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  MessageStatus,
  MessageStatusEnum,
} from './entities/message-status.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from 'src/messages/entities/message.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class MessageStatusService {
  constructor(
    @InjectRepository(MessageStatus)
    private messageStatusRepository: Repository<MessageStatus>,
  ) {}

  /**
   * 创建消息状态记录
   * @param message 消息
   * @param recipients 接收消息的用户
   */
  async createMessageStatuses(
    message: Message,
    recipients: User[],
  ): Promise<void> {
    const statuses = recipients.map((user) => {
      const status = this.messageStatusRepository.create({
        message,
        user,
        status: MessageStatusEnum.UNREAD,
      });
      return status;
    });
    await this.messageStatusRepository.save(statuses);
  }

  /**
   * 更新消息状态为已读
   * @param messageId 消息ID
   * @param userId 用户ID
   */
  async markAsRead(messageId: number, userId: number): Promise<void> {
    const status = await this.messageStatusRepository.findOne({
      where: { message: { key_id: messageId }, user: { key_id: userId } },
    });
    if (status && status.status === MessageStatusEnum.UNREAD) {
      status.status = MessageStatusEnum.READ;
      await this.messageStatusRepository.save(status);
    }
  }

  /**
   * 获取用户未读消息数量
   * @param userId 用户ID
   */
  async getUnreadCount(userId: number): Promise<number> {
    return await this.messageStatusRepository.count({
      where: { user: { key_id: userId }, status: MessageStatusEnum.UNREAD },
    });
  }
}
