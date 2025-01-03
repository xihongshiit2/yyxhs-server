import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { LoggerModule } from './common/logger/logger.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ProtectedController } from './protected/protected.controller';
import { FriendsModule } from './friends/friends.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { MessageStatusModule } from './message-status/message-status.module';
import { CallsModule } from './calls/calls.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 全局使用
      envFilePath: '.env', // 环境变量文件
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 1000 * 60, // 时间窗口
        limit: 20, // 时间窗口内的最大请求次数
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // 开发时开启，生产时关闭
        logging: true, // 开启日志
        logger: 'advanced-console', // 使用 TypeORM 内置高级控制台日志
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    LoggerModule,
    AuthModule,
    FriendsModule,
    ConversationsModule,
    forwardRef(() => MessagesModule), // 使用 forwardRef
    forwardRef(() => MessageStatusModule),
    CallsModule, // 使用 forwardRef
  ],
  controllers: [ProtectedController],
  providers: [],
})
export class AppModule {}
