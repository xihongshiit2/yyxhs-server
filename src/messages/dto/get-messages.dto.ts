import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetMessagesDto {
  @ApiPropertyOptional({ description: '会话ID', example: 1 })
  @IsNumber()
  conversationId: number;

  @ApiPropertyOptional({ description: '页码 (默认: 1)', example: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: '每页数量 (默认: 20)', example: 20 })
  @IsNumber()
  @IsOptional()
  @IsPositive()
  limit?: number;
}
