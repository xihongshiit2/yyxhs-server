import { forwardRef, Module } from '@nestjs/common';
import { MessageStatusService } from './message-status.service';
import { MessageStatusController } from './message-status.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageStatus } from './entities/message-status.entity';
import { UsersModule } from 'src/users/users.module';
import { MessagesModule } from 'src/messages/messages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageStatus]),
    UsersModule,
    forwardRef(() => MessagesModule),
  ],
  providers: [MessageStatusService],
  controllers: [MessageStatusController],
  exports: [MessageStatusService],
})
export class MessageStatusModule {}
