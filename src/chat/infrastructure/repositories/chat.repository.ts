import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ChatMessage } from '../../domain/entities/chat-message.entity';

@Injectable()
export class ChatRepository {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly repository: Repository<ChatMessage>,
  ) {}

  async create(messageData: Partial<ChatMessage>): Promise<ChatMessage> {
    const message = this.repository.create(messageData);
    return this.repository.save(message);
  }

  async findByUserId(userId: string): Promise<ChatMessage[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<ChatMessage | null> {
    return this.repository.findOne({ where: { id } });
  }

  async getMonthlyUsage(userId: string): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const count = await this.repository.count({
      where: {
        userId,
        createdAt: Between(startOfMonth, endOfMonth),
      },
    });

    return count;
  }

  async getTotalTokensUsed(userId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('message')
      .select('SUM(message.tokensUsed)', 'total')
      .where('message.userId = :userId', { userId })
      .getRawOne();

    return parseInt(result?.total || '0', 10);
  }
}
