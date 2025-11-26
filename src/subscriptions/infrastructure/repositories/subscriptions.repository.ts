import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { SubscriptionBundle } from '../../domain/entities/subscription-bundle.entity';

@Injectable()
export class SubscriptionsRepository {
  constructor(
    @InjectRepository(SubscriptionBundle)
    private readonly repository: Repository<SubscriptionBundle>,
  ) {}

  async findById(id: string): Promise<SubscriptionBundle | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUserId(userId: string): Promise<SubscriptionBundle[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveByUserId(userId: string): Promise<SubscriptionBundle[]> {
    const now = new Date();
    return this.repository.find({
      where: {
        userId,
        isActive: true,
        isCancelled: false,
        endDate: MoreThan(now),
      },
      order: { remainingMessages: 'DESC' },
    });
  }

  async findBundleWithQuota(userId: string): Promise<SubscriptionBundle | null> {
    const now = new Date();

    // First try to find unlimited bundle
    const unlimited = await this.repository.findOne({
      where: {
        userId,
        isActive: true,
        isCancelled: false,
        maxMessages: -1,
        endDate: MoreThan(now),
      },
    });

    if (unlimited) return unlimited;

    // Otherwise find bundle with remaining quota
    return this.repository.findOne({
      where: {
        userId,
        isActive: true,
        isCancelled: false,
        endDate: MoreThan(now),
      },
      order: { remainingMessages: 'DESC' },
    });
  }

  async create(bundleData: Partial<SubscriptionBundle>): Promise<SubscriptionBundle> {
    const bundle = this.repository.create(bundleData);
    return this.repository.save(bundle);
  }

  async update(
    id: string,
    bundleData: Partial<SubscriptionBundle>,
  ): Promise<SubscriptionBundle | null> {
    await this.repository.update(id, bundleData);
    return this.findById(id);
  }

  async deductMessage(bundleId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(SubscriptionBundle)
      .set({ remainingMessages: () => 'remainingMessages - 1' })
      .where('id = :id AND maxMessages != -1', { id: bundleId })
      .execute();
  }
}
