import { ApiProperty } from '@nestjs/swagger';
import { MessageAttachment } from '../entities/message-attachment.entity';

export class SendMessageResponseDto {
  @ApiProperty({ description: '消息ID', example: 1 })
  id: number;

  @ApiProperty({ description: '会话ID', example: 1 })
  conversationId: number;

  @ApiProperty({ description: '发送者用户ID', example: 1 })
  senderId: number;

  @ApiProperty({ description: '消息类型', example: 1 })
  messageType: number;

  @ApiProperty({
    description: '内容',
    example: 'Hello, World!',
    nullable: true,
  })
  content: string | null;

  @ApiProperty({
    description: '附件',
    type: [MessageAttachment],
    nullable: true,
  })
  attachments: MessageAttachment[] | null;

  @ApiProperty({ description: '创建时间', example: '2023-09-15T10:00:00Z' })
  createdAt: Date;
}
