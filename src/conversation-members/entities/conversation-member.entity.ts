import { Conversation } from 'src/conversations/entities/conversation.entity';
import { User } from 'src/users/entities/user.entity';
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

export enum ConversationMemberRole {
  DEFAULT,
  ADMIN,
  GROUPLEADER,
}

@Entity('conversation_members')
@Unique(['conversation', 'user'])
export class ConversationMember {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  key_id: number;

  @ManyToOne(() => Conversation, (conversation) => conversation.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => User, (user) => user.conversationMemberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'tinyint',
    default: 0,
  })
  role: ConversationMemberRole;

  @CreateDateColumn()
  joined_at: Date;

  @CreateDateColumn({ nullable: true })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @Column({ default: 0, nullable: true })
  is_delete: number;

  @Column({ nullable: true })
  delete_at: Date;
}
