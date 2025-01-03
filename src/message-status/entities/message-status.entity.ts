import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from '../../messages/entities/message.entity';
import { User } from 'src/users/entities/user.entity';

export enum MessageStatusEnum {
  UNREAD = 0,
  READ = 1,
  REVOKED = 2,
}

@Entity('message_status')
@Unique(['message', 'user'])
export class MessageStatus {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  key_id: number;

  @ManyToOne(() => Message, (message) => message.statuses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @ManyToOne(() => User, (user) => user.messageStatuses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'tinyint',
    default: MessageStatusEnum.UNREAD,
    comment: '消息状态: 0-未读, 1-已读, 2-撤回,3-删除 等...',
  })
  status: number;

  @CreateDateColumn({ nullable: true })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @Column({ default: 0, nullable: true })
  is_delete: number;

  @Column({ nullable: true })
  delete_at: Date;
}
