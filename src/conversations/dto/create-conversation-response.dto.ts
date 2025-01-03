import { ApiProperty } from '@nestjs/swagger';
import { ConversationType } from '../entities/conversation.entity';

export class CreateConversationResponseDto {
  @ApiProperty({ description: '会话ID', example: 1 })
  id: number;

  @ApiProperty({
    description: '会话类型',
    enum: ConversationType,
    example: ConversationType.PRIVATE,
  })
  conversationType: ConversationType;

  @ApiProperty({ description: '会话标题', example: '开发团队', nullable: true })
  title: string | null;

  @ApiProperty({
    description: '会话头像',
    example: 'http://example.com/avatar.png',
    nullable: true,
  })
  avatarUrl: string | null;

  @ApiProperty({ description: '创建者用户ID', example: 1 })
  creatorId: number;

  @ApiProperty({ description: '成员列表', type: [Number], example: [1, 2] })
  members: number[];

  @ApiProperty({ description: '创建时间', example: '2023-09-15T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2023-09-15T10:00:00Z' })
  updatedAt: Date;
}
