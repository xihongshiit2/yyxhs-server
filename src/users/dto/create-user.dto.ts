import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'john_doe' })
  @IsString()
  @Matches(/^[A-Za-z0-9_]+$/, { message: '用户名只能包含字母、数字和下划线' })
  username: string;

  @ApiProperty({ description: '密码', example: 'strongpassword123' })
  @IsString()
  @MinLength(6, { message: '密码长度至少为6位' })
  password: string;

  @ApiProperty({ description: '邮箱地址', example: 'john@example.com' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({ description: '电话号码', example: '+1234567890' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: '电话号码格式不正确' })
  phone: string;
}
