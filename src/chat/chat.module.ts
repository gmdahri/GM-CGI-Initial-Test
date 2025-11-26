import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './domain/entities/chat-message.entity';
import { ChatRepository } from './infrastructure/repositories/chat.repository';
import { ChatService } from './application/services/chat.service';
import { OpenAIMockService } from './application/services/openai-mock.service';
import { UsageService } from './application/services/usage.service';
import { ChatController } from './presentation/controllers/chat.controller';
import { UsersModule } from '../users/users.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage]), UsersModule, SubscriptionsModule],
  controllers: [ChatController],
  providers: [ChatRepository, ChatService, OpenAIMockService, UsageService],
  exports: [ChatService],
})
export class ChatModule {}
