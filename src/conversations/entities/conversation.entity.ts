import { ConversationMember } from 'src/conversation-members/entities/conversation-member.entity';
import { Message } from 'src/messages/entities/message.entity';
// import { Message } from 'src/messages/entities/message.entity';
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

export enum ConversationType {
  PRIVATE = 1,
  GROUP = 2,
}

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  key_id: number;

  @Column({
    type: 'tinyint',
    default: 1,
  })
  conversation_type: ConversationType;

  @ManyToOne(() => User, (user) => user.createdConversations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar_url: string;

  @Column({ type: 'bigint', default: 0 })
  message_count: number;

  @OneToMany(() => Message, (message) => message.conversation, {
    cascade: true,
  })
  messages: Message[];

  @OneToMany(() => ConversationMember, (member) => member.conversation, {
    cascade: true,
  })
  members: ConversationMember[];

  @CreateDateColumn({ nullable: true })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @Column({ default: 0, nullable: true })
  is_delete: number;

  @Column({ nullable: true })
  delete_at: Date;
}
