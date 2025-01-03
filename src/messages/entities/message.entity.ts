import { Conversation } from 'src/conversations/entities/conversation.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MessageAttachment } from './message-attachment.entity';
import { MessageStatus } from '../../message-status/entities/message-status.entity';

export enum MessageType {
  TEXT = 1,
  IMAGE = 2,
  FILE = 3,
  AUDIO = 4,
  VIDEO = 5,
  // 其他类型可扩展
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  key_id: number;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => User, (user) => user.sentMessages, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({
    type: 'tinyint',
    comment: '1-文本, 2-图片, 3-文件, 4-音频, 5-视频',
  })
  message_type: number;

  @Column({ type: 'text', nullable: true, comment: '文本内容或文件描述' })
  content: string | null;

  @OneToMany(() => MessageAttachment, (attachment) => attachment.message, {
    cascade: true,
  })
  attachments: MessageAttachment[];

  @OneToMany(() => MessageStatus, (status) => status.message, { cascade: true })
  statuses: MessageStatus[];

  @CreateDateColumn({ nullable: true })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @Column({ default: 0, nullable: true })
  is_delete: number;

  @Column({ nullable: true })
  delete_at: Date;
}
