import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { CreateConversationResponseDto } from './dto/create-conversation-response.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { AddMemberDto } from './dto/add-member.dto';

@ApiTags('Conversations')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationService: ConversationsService) {}

  @Post('create')
  async createConversation(
    @GetUser() currentUser: User,
    @Body() createConversationDto: CreateConversationDto,
  ): Promise<ApiResponse<CreateConversationResponseDto>> {
    const conversation = await this.conversationService.createConversation(
      currentUser,
      createConversationDto,
    );

    const response: CreateConversationResponseDto = {
      id: conversation.key_id,
      conversationType: conversation.conversation_type,
      title: conversation.title,
      avatarUrl: conversation.avatar_url,
      creatorId: conversation.creator.key_id,
      members: conversation.members.map((m) => m.user.key_id),
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
    };

    return {
      statusCode: 201,
      message: '会话创建成功',
      data: response,
    };
  }

  /**
   * 获取当前用户参与的会话列表
   * @param currentUser 当前登录用户
   */
  @Post()
  @ApiOperation({ summary: '获取用户参与的会话列表' })
  @SwaggerApiResponse({
    status: 200,
    description: '获取成功',
    type: [CreateConversationResponseDto], // 可创建专门的会话列表DTO
  })
  async listConversations(
    @GetUser() currentUser: User,
  ): Promise<ApiResponse<CreateConversationResponseDto[]>> {
    const conversations =
      await this.conversationService.listUserConversations(currentUser);

    const response = conversations.map((conversation) => ({
      id: conversation.key_id,
      conversationType: conversation.conversation_type,
      title: conversation.title,
      avatarUrl: conversation.avatar_url,
      creatorId: conversation.creator.key_id,
      members: conversation.members.map((m) => m.user.key_id),
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
    }));
    return {
      statusCode: 200,
      message: '获取会话列表成功',
      data: response,
    };
  }

  /**
   * 添加成员到群聊
   * @param currentUser 当前用户
   * @param conversationId 会话ID
   * @param addMemberDto 被添加的用户ID
   */
  @Post(':id/members')
  @ApiOperation({ summary: '添加成员到群聊' })
  @SwaggerApiResponse({
    status: 200,
    description: '成员已添加',
    type: Object, // 可定义具体的响应 DTO
  })
  async addMember(
    @GetUser() currentUser: User,
    @Param('id') conversationId: number,
    @Body() addMemberDto: AddMemberDto,
  ): Promise<ApiResponse<null>> {
    await this.conversationService.addMember(
      currentUser,
      conversationId,
      addMemberDto,
    );
    return {
      statusCode: 200,
      message: '成员已添加',
      data: null,
    };
  }

  /**
   * 移除成员从群聊
   * @param currentUser 当前用户
   * @param conversationId 会话ID
   * @param memberId 被移除的成员ID
   */
  @Post(':id/members/:memberId')
  @ApiOperation({ summary: '移除成员从群聊' })
  @SwaggerApiResponse({
    status: 200,
    description: '成员已移除',
    type: Object, // 可定义具体的响应 DTO
  })
  async removeMember(
    @GetUser() currentUser: User,
    @Param('id') conversationId: number,
    @Param('memberId') memberId: number,
  ): Promise<ApiResponse<null>> {
    await this.conversationService.removeMember(
      currentUser,
      conversationId,
      memberId,
    );
    return {
      statusCode: 200,
      message: '成员已移除',
      data: null,
    };
  }
}
