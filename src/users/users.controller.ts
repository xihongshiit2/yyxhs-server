import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import {
  ApiOperation,
  ApiTags,
  ApiResponse as sw_apiResponse,
} from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  /**
   * 注册
   * @param createUserDto
   * @returns
   */
  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiResponse<{ userId: number }>> {
    const user = await this.usersService.create(createUserDto);
    return {
      statusCode: 201,
      message: '注册成功',
      data: { userId: user.key_id },
      serCode: 1001, // 示例服务状态码
    };
  }

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @sw_apiResponse({ status: 201, description: '登录成功，返回 JWT Token' })
  @sw_apiResponse({ status: 401, description: '认证失败' })
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<ApiResponse<{ access_token: string }>> {
    const user = await this.authService.validateUser(
      loginUserDto.username,
      loginUserDto.password,
    );
    const token = await this.authService.generateJwt(user);
    return {
      statusCode: 200,
      message: '登录成功',
      data: { access_token: token },
      serCode: null, // 示例服务状态码
    };
  }

  // 刷新 Token
  @UseGuards(AuthGuard('jwt'))
  @Post('refresh-token')
  async refreshToken(
    @Request() req,
  ): Promise<ApiResponse<{ access_token: string }>> {
    const token = await this.authService.generateJwt(req.user);
    return {
      statusCode: 200,
      message: '刷新成功',
      data: { access_token: token },
      serCode: null, // 示例服务状态码
    };
  }

  /**
   * 登出
   * @param req
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Request() req): Promise<ApiResponse<null>> {
    const user = req.user;
    await this.usersService.updateTokenId(user.id, null); // 清除 currentTokenId
    return {
      statusCode: 200,
      message: '登出成功',
      data: null,
      serCode: 1004,
    };
  }
}
