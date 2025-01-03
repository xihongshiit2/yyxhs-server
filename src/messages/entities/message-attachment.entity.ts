import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from './message.entity';

export enum AttachmentType {
  IMAGE = 2,
  FILE = 3,
  AUDIO = 4,
  VIDEO = 5,
  // 其他类型可扩展
}

@Entity('message_attachments')
export class MessageAttachment {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  key_id: number;

  @ManyToOne(() => Message, (message) => message.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @Column({
    type: 'tinyint',
    comment: '2-图片, 3-文件, 4-音频, 5-视频',
  })
  attachment_type: AttachmentType;

  @Column({ type: 'varchar', length: 255 })
  file_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  file_name: string;

  @Column({ type: 'bigint', default: 0 })
  file_size: number;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn({ nullable: true })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @Column({ default: 0, nullable: true })
  is_delete: number;

  @Column({ nullable: true })
  delete_at: Date;
}
