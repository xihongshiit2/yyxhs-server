import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class SendFriendRequestDto {
  @ApiProperty({ description: '被请求的用户ID' })
  @IsNumber()
  friendId: number;
}
