import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { UsersModule } from 'src/users/users.module';
import { ConversationMember } from 'src/conversation-members/entities/conversation-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, ConversationMember]),
    UsersModule,
  ],
  providers: [ConversationsService],
  controllers: [ConversationsController],
  exports: [ConversationsService],
})
export class ConversationsModule {}
