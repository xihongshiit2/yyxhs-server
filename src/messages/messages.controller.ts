import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SendMessageResponseDto } from './dto/send-message-response.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { GetMessagesDto } from './dto/get-messages.dto';

@ApiTags('Messages')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * 发送消息
   * @param currentUser 当前用户
   * @param sendMessageDto 发送消息的DTO
   * @param files 上传的文件
   */
  @Post()
  @ApiOperation({ summary: '发送消息' })
  @ApiConsumes('multipart/form-data')
  @SwaggerApiResponse({
    status: 201,
    description: '消息已发送',
    type: SendMessageResponseDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachments', maxCount: 10 }]),
  )
  async sendMessage(
    @GetUser() currentUser: User,
    @Body() sendMessageDto: SendMessageDto,
    @UploadedFiles() files: { attachments?: Express.Multer.File[] },
  ): Promise<ApiResponse<SendMessageResponseDto>> {
    const attachments: Express.Multer.File[] = [];
    if (files) {
      attachments.concat(files.attachments);
    }
    if (
      (sendMessageDto.messageType === 1 && !sendMessageDto.content) ||
      (sendMessageDto.messageType !== 1 &&
        (!attachments || attachments.length === 0))
    ) {
      throw new BadRequestException('消息内容或附件不能为空');
    }
    const message = await this.messagesService.sendMessage(
      currentUser,
      sendMessageDto,
      attachments,
    );
    const response = {
      id: message.key_id,
      conversationId: message.conversation.key_id,
      senderId: message.sender.key_id,
      messageType: message.message_type,
      content: message.content,
      attachments: message.attachments,
      createdAt: message.created_at,
    };
    return {
      statusCode: 200,
      message: '发送消息成功',
      data: response,
    };
  }

  /**
   * 获取会话中的消息
   * @param currentUser 当前用户
   * @param getMessagesDto 获取消息的DTO
   */
  @Post('find')
  @ApiOperation({ summary: '获取会话中的消息' })
  @SwaggerApiResponse({
    status: 200,
    description: '消息列表',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取消息列表成功' },
        data: {
          type: 'object',
          properties: {
            messages: {
              type: 'array',
              items: { $ref: '#/components/schemas/SendMessageResponseDto' },
            },
            total: { type: 'number', example: 100 },
          },
        },
        serCode: { type: 'number', example: 1000 },
      },
    },
  })
  async getMessages(
    @GetUser() currentUser: User,
    @Body() getMessageDto: GetMessagesDto,
  ): Promise<
    ApiResponse<{ messages: SendMessageResponseDto[]; total: number }>
  > {
    const { messages, conversation, total } =
      await this.messagesService.getMessages(currentUser, getMessageDto);
    const response: SendMessageResponseDto[] = messages.map((msg) => {
      return {
        id: msg.key_id,
        conversationId: conversation.key_id,
        senderId: msg.sender.key_id,
        messageType: msg.message_type,
        content: msg.content,
        attachments: msg.attachments,
        createdAt: msg.created_at,
      };
    });
    return {
      statusCode: 200,
      message: '获取消息列表成功',
      data: { messages: response, total },
    };
  }
}
