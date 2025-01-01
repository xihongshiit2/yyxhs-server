import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { LoggerModule } from './common/logger/logger.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ProtectedController } from './protected/protected.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 全局使用
      envFilePath: '.env', // 环境变量文件
    }),
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
  ],
  controllers: [ProtectedController],
  providers: [],
})
export class AppModule {}
