import { Injectable } from '@nestjs/common';
import { ChatRepository } from '../../infrastructure/repositories/chat.repository';
import { OpenAIMockService } from './openai-mock.service';
import { UsageService } from './usage.service';
import { ChatMessage } from '../../domain/entities/chat-message.entity';
import { ChatRequestDto } from '../dto/chat-request.dto';
import { User } from '../../../users/domain/entities/user.entity';

export interface ChatResponse {
  message: ChatMessage;
  quotaInfo: {
    usedFreeQuota: boolean;
    bundleId: string | null;
  };
}

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly openAIMockService: OpenAIMockService,
    private readonly usageService: UsageService,
  ) {}

  async processChat(user: User, dto: ChatRequestDto): Promise<ChatResponse> {
    // Check quota before processing
    const quotaCheck = await this.usageService.checkAndDeductQuota(user);

    // Generate mocked OpenAI response
    const aiResponse = await this.openAIMockService.generateResponse(dto.question);

    // Store the message
    const message = await this.chatRepository.create({
      userId: user.id,
      question: dto.question,
      answer: aiResponse.answer,
      tokensUsed: aiResponse.tokens,
      bundleId: quotaCheck.bundleId,
      usedFreeQuota: quotaCheck.useFreeQuota,
    });

    // Deduct quota after successful response
    await this.usageService.deductQuota(user.id, quotaCheck.useFreeQuota, quotaCheck.bundleId);

    return {
      message,
      quotaInfo: {
        usedFreeQuota: quotaCheck.useFreeQuota,
        bundleId: quotaCheck.bundleId,
      },
    };
  }

  async getHistory(userId: string): Promise<ChatMessage[]> {
    return this.chatRepository.findByUserId(userId);
  }

  async getUsageStats(userId: string): Promise<{ monthlyMessages: number; totalTokens: number }> {
    const [monthlyMessages, totalTokens] = await Promise.all([
      this.chatRepository.getMonthlyUsage(userId),
      this.chatRepository.getTotalTokensUsed(userId),
    ]);

    return { monthlyMessages, totalTokens };
  }
}
