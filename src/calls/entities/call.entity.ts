import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('calls')
export class Call {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  key_id: number;

  @ManyToOne(() => User, (user) => user.callerCalls, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caller_id' })
  caller: User;

  @ManyToOne(() => User, (user) => user.calleeCalls, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'callee_id' })
  callee: User;

  @Column({ type: 'tinyint', comment: '通话类型: 1-语音, 2-视频' })
  call_type: number;

  @CreateDateColumn()
  start_time: Date;

  @Column({ type: 'datetime', nullable: true, comment: '通话结束时间' })
  end_time: Date | null;

  @Column({
    type: 'tinyint',
    default: 0,
    comment: '通话状态: 0-正在呼叫,1-已接通,2-已挂断,3-拒接等',
  })
  status: number;

  @Column({ nullable: true, comment: '通话令牌，用于身份验证' })
  call_token: string;

  @CreateDateColumn({ nullable: true })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @Column({ default: 0, nullable: true })
  is_delete: number;

  @Column({ nullable: true })
  delete_at: Date;
}
