import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { v4 as uuidv4 } from 'uuid'; // 生成唯一的 jti

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * 验证用户
   * @param username
   * @param password
   * @returns
   */
  async validateUser(username: string, password: string): Promise<User> {
    const user = this.usersService.validateUser(username, password);
    return user;
  }

  /**
   * 生成 JWT 包含 jti
   * @param user
   * @returns
   */
  async generateJwt(user: User): Promise<string> {
    const jti = uuidv4(); // 生成唯一的 jti
    // 更新用户的 currentTokenId
    await this.usersService.updateTokenId(user.key_id, jti);

    const payload = { username: user.username, sub: user.key_id, jti };
    return this.jwtService.signAsync(payload);
  }

  /**
   * 验证 JWT token 并返回用户
   * @param token
   */
  async verifyToken(token: string): Promise<User> {
    try {
      const decoded = await this.jwtService.verifyAsync(token);
      return this.usersService.findById(decoded.sub);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('无效的 token');
    }
  }

  // 刷新 JWT
  async refreshJwt(user: User): Promise<string> {
    const payload = { username: user.username, sub: user.key_id };
    return this.jwtService.signAsync(payload);
  }
}
