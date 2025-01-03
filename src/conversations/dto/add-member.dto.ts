import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({ description: '被添加的用户ID', example: 4 })
  @IsNumber()
  userId: number;
}
