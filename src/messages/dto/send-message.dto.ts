import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { MessageType } from '../entities/message.entity';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ description: '会话ID' })
  @IsNumber()
  conversationId: number;

  @ApiProperty({ description: '消息类型', enum: MessageType })
  @IsEnum(MessageType)
  messageType: MessageType;

  @IsOptional()
  @IsString()
  content?: string;
}
