import { Call } from 'src/calls/entities/call.entity';
import { ConversationMember } from 'src/conversation-members/entities/conversation-member.entity';
import { Conversation } from 'src/conversations/entities/conversation.entity';
import { Friend } from 'src/friends/entities/friend.entity';
import { MessageStatus } from 'src/message-status/entities/message-status.entity';
import { Message } from 'src/messages/entities/message.entity';
// import { Message } from 'src/messages/entities/message.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  key_id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ length: 100, nullable: true })
  displayName: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ unique: true, length: 20, nullable: true })
  phone: string;

  @Column({ unique: true, length: 100, nullable: true })
  email: string;

  @Column()
  password: string; // 存储加密后的密码

  @Column({ nullable: true })
  salt: string; // 存储盐

  @Column({ nullable: true })
  currentTokenId: string; // 新增字段，用于存储当前有效的 Token ID (jti)

  // 发送的好友请求
  @OneToMany(() => Friend, (friend) => friend.user)
  friendsSent: Friend[];

  // 接收的好友请求
  @OneToMany(() => Friend, (friend) => friend.friend)
  friendsReceived: Friend[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Conversation, (conversation) => conversation.creator)
  createdConversations: Conversation[];

  @OneToMany(() => ConversationMember, (member) => member.user)
  conversationMemberships: ConversationMember[];

  @OneToMany(() => MessageStatus, (status) => status.user)
  messageStatuses: MessageStatus[];

  @OneToMany(() => Call, (call) => call.caller)
  callerCalls: Call[];

  @OneToMany(() => Call, (call) => call.callee)
  calleeCalls: Call[];

  @CreateDateColumn({ nullable: true })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @Column({ default: 0, nullable: true })
  is_delete: number;

  @Column({ nullable: true })
  delete_at: Date;
}
