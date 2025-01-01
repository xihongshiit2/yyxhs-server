import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
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

  @CreateDateColumn({ nullable: true })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @Column({ default: 0, nullable: true })
  is_delete: number;

  @Column({ nullable: true })
  delete_at: Date;
}
