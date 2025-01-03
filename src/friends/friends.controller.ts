import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBasicAuth,
  ApiOperation,
  ApiTags,
  ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';
import { FriendsService } from './friends.service';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { Friend } from './entities/friend.entity';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { SendFriendRequestDto } from './dto/send-friend-request.dto';
import { RespondFriendRequestDto } from './dto/respond-friend-request.dto';
import { SerCode } from 'src/common/enums/ser-code.enum';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Friends')
@ApiBasicAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  /**
   * 发送好友请求
   * @param currentUser
   * @param sendFriendRequestDto
   * @returns
   */
  @Post('request')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: '发送好友请求' })
  @SwaggerApiResponse({
    status: 201,
    description: '好友请求已发送',
    type: Object, // 可定义具体的响应 DTO
  })
  async sendFriendRequest(
    @GetUser() currentUser: User,
    @Body() sendFriendRequestDto: SendFriendRequestDto,
  ): Promise<ApiResponse<null>> {
    await this.friendsService.sendFriendRequest(
      currentUser,
      sendFriendRequestDto,
    );
    return {
      statusCode: 201,
      message: '好友请求已发送',
      data: null,
      serCode: SerCode.FRIEND_REQUEST_SENT,
    };
  }

  /**
   * 响应好友请求
   * @param currentUser
   * @param respondFriendRequestDto
   * @returns
   */
  @Post('respond')
  @ApiOperation({ summary: '响应好友请求' })
  @SwaggerApiResponse({
    status: 200,
    description: '好友请求已处理',
    type: Object, // 可定义具体的响应 DTO
  })
  async respondFriendRequest(
    @GetUser() currentUser: User,
    @Body() respondFriendRequestDto: RespondFriendRequestDto,
  ): Promise<ApiResponse<null>> {
    await this.friendsService.respondFriendRequest(
      currentUser,
      respondFriendRequestDto,
    );
    return {
      statusCode: 200,
      message: respondFriendRequestDto.accept
        ? '好友请求已接受'
        : '好友请求已拒绝',
      data: null,
      serCode: respondFriendRequestDto.accept
        ? SerCode.FRIEND_REQUEST_ACCEPTED
        : SerCode.FRIEND_REQUEST_REJECTED,
    };
  }

  /**
   * 获取收到的好友请求
   * @param currentUser
   * @returns
   */
  @Post('requests')
  @ApiOperation({ summary: '获取收到的好友请求' })
  @SwaggerApiResponse({
    status: 200,
    description: '好友请求列表',
    type: [Friend],
  })
  async getFriendRequests(
    @GetUser() currentUser: User,
  ): Promise<ApiResponse<Friend[]>> {
    const requests = await this.friendsService.listFriendRequests(currentUser);
    return {
      statusCode: 200,
      message: '获取好友请求成功',
      data: requests,
    };
  }

  /**
   * 获取好友列表
   * @param currentUser
   * @returns
   */
  @Post()
  @ApiOperation({ summary: '获取好友列表' })
  @SwaggerApiResponse({
    status: 200,
    description: '好友列表',
    type: [User],
  })
  async getFriends(@GetUser() currentUser: User): Promise<ApiResponse<User[]>> {
    const friends = await this.friendsService.listFriends(currentUser);
    return {
      statusCode: 200,
      message: '获取好友列表成功',
      data: friends,
    };
  }

  /**
   * 删除好友
   * @param currentUser
   * @param friendId
   * @returns
   */
  @Post(':friendId')
  @ApiOperation({ summary: '删除好友' })
  @SwaggerApiResponse({
    status: 200,
    description: '好友已删除',
    type: Object,
  })
  async removeFriend(
    @GetUser() currentUser: User,
    @Param('friendId') friendId: number,
  ): Promise<ApiResponse<null>> {
    await this.friendsService.removeFriend(currentUser, friendId);
    return {
      statusCode: 200,
      message: '好友已删除',
      data: null,
    };
  }
}
