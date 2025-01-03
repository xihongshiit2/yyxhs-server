/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CallsService } from './calls.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*', // 根据需求调整
  },
})
export class CallsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly callsService: CallsService,
    private jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    console.log('呼叫网关已初始化', server);
  }
  async handleConnection(client: Socket, ..._args: any[]) {
    console.log(`客户端已连接: ${client.id}`);
    // 可以在这里验证JWT并关联用户ID
    const token = client.handshake.auth.token;
    if (token) {
      const payload = await this.jwtService.verify(token);
      client.data.user = payload;
      // 将用户ID与Socket ID关联，例如存储在内存或用Redis
      // await this.callsService.addUserSocket(payload.userId, client.id);
      console.log(`User ${payload.userId} connected with socket ${client.id}`);
      try {
      } catch (error) {
        console.log('无效的Token', error);
        client.disconnect();
      }
    } else {
      console.log('未提供Token');
      client.disconnect();
    }
  }
  handleDisconnect(client: Socket) {
    console.log(`客户端已断开连接: ${client.id}`);
    const userId = client.data.user?.userId;
    if (userId) {
      // this.callsService.removeUserSocket(userId, client.id);
      console.log(`User ${userId} disconnected from socket ${client.id}`);
    }
  }

  @SubscribeMessage('callInitiate')
  async handleCallInitiate(
    @MessageBody() data: { calleeId: number; callType: number },
    @ConnectedSocket() client: Socket,
  ) {
    const callerId = client.data.user.userId;
    const { calleeId, callType } = data;

    // 检查caller和callee是否为好友
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
