import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ConversationType } from '../entities/conversation.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({
    description: '会话类型',
    enum: ConversationType,
    example: ConversationType.PRIVATE,
  })
  @IsEnum(ConversationType)
  conversationType: ConversationType;

  @ApiPropertyOptional({
    description: '会话标题，仅群聊时必填',
    example: '开发团队',
  })
  @ValidateIf((o) => o.conversationType === 2)
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: '会话头像，仅群聊时可选',
    example: 'http://example.com/avatar.png',
  })
  @ValidateIf((o) => o.conversationType === 2)
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({ description: '会话成员ID数组', example: [2], type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  members: number[];
}
