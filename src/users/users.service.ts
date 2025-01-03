import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { In, QueryFailedError, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  /**
   * 注册
   * @param createUserDto
   * @returns 用户
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, password, email, phone } = createUserDto;

    // 检查是否存在相同的用户名、邮箱或电话
    const existingUser = await this.usersRepository.findOne({
      where: [{ username }, { email }, { phone }],
    });

    if (existingUser) {
      throw new ConflictException('用户名、邮箱或电话已存在');
    }

    // 生成盐
    const salt = ''; //await argon2.generateSalt();

    try {
      // 哈希密码
      const hashedPassword = await argon2.hash(password, { hashLength: 128 });

      const user = this.usersRepository.create({
        username,
        password: hashedPassword,
        email,
        salt,
        phone,
      });

      return this.usersRepository.save(user);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        // 唯一约束违反（根据具体数据库错误码判断）
        throw new ConflictException('用户名、邮箱或电话已存在');
      }
      // 捕获并重新抛出错误，确保异常过滤器能够处理
      throw error;
    }
  }

  /**
   * 查找用户通过用户名
   * @param username
   * @returns
   */
  async findByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: [{ username }] });
  }

  /**
   * 验证用户
   * @param username
   * @param password
   */
  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('密码不正确');
    }

    return user;
  }

  /**
   * 根据 ID 查找用户
   * @param id
   * @returns
   */
  async findById(key_id: number): Promise<User> {
    return this.usersRepository.findOne({ where: { key_id } });
  }

  /**
   * 更新用户的当前TokenId
   * @param userId
   * @param tokenId
   */
  async updateTokenId(userId: number, tokenId: string | null): Promise<void> {
    await this.usersRepository.update(userId, { currentTokenId: tokenId });
  }

  /**
   * 根据用户ID数组获取用户列表
   * @param userIds 用户ID数组
   */
  async findUsersByIds(userIds: number[]): Promise<User[]> {
    return this.usersRepository.findBy({ key_id: In(userIds) });
  }
}
