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

@Entity('friends')
@Unique(['user', 'friend']) // 确保每对用户之间只有一个好友关系记录
export class Friend {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  key_id: number;

  // 发起好友请求的用户
  @ManyToOne(() => User, (user) => user.friendsSent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 被请求的用户
  @ManyToOne(() => User, (user) => user.friendsReceived, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'friend_id' })
  friend: User;

  @Column({ type: 'tinyint', default: 0 })
  status: number; // 0-请求中, 1-已成为好友, 2-已拒绝

  @CreateDateColumn({ nullable: true })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @Column({ default: 0, nullable: true })
  is_delete: number;

  @Column({ nullable: true })
  delete_at: Date;
}
