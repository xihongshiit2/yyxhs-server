import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber } from 'class-validator';

export class RespondFriendRequestDto {
  @ApiProperty({ description: '好友请求ID' })
  @IsNumber()
  requestId: number;

  @ApiProperty({ description: '是否接受请求' })
  @IsBoolean()
  accept: boolean;
}
