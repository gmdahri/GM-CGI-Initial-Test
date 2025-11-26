import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SubscriptionsRepository } from '../../infrastructure/repositories/subscriptions.repository';
import { SubscriptionBundle } from '../../domain/entities/subscription-bundle.entity';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';
import { BillingCycle, TIER_CONFIG } from '../../domain/enums/subscription-tier.enum';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly subscriptionsRepository: SubscriptionsRepository) {}

  async create(userId: string, dto: CreateSubscriptionDto): Promise<SubscriptionBundle> {
    const tierConfig = TIER_CONFIG[dto.tier];
    const now = new Date();

    // Calculate end date based on billing cycle
    const endDate = new Date(now);
    if (dto.billingCycle === BillingCycle.MONTHLY) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Calculate price based on billing cycle
    const price =
      dto.billingCycle === BillingCycle.YEARLY
        ? tierConfig.monthlyPrice * 12 * 0.8 // 20% discount for yearly
        : tierConfig.monthlyPrice;

    const bundle = await this.subscriptionsRepository.create({
      userId,
      tier: dto.tier,
      billingCycle: dto.billingCycle,
      maxMessages: tierConfig.maxMessages,
      remainingMessages: tierConfig.maxMessages,
      price,
      startDate: now,
      endDate,
      renewalDate: endDate,
      autoRenew: dto.autoRenew ?? true,
      isActive: true,
      isCancelled: false,
    });

    return bundle;
  }

  async findAllByUser(userId: string): Promise<SubscriptionBundle[]> {
    return this.subscriptionsRepository.findByUserId(userId);
  }

  async findActiveByUser(userId: string): Promise<SubscriptionBundle[]> {
    return this.subscriptionsRepository.findActiveByUserId(userId);
  }

  async findById(id: string, userId: string): Promise<SubscriptionBundle> {
    const bundle = await this.subscriptionsRepository.findById(id);
    if (!bundle || bundle.userId !== userId) {
      throw new NotFoundException('Subscription bundle not found');
    }
    return bundle;
  }

  async toggleAutoRenew(
    id: string,
    userId: string,
    dto: UpdateSubscriptionDto,
  ): Promise<SubscriptionBundle> {
    const bundle = await this.findById(id, userId);

    if (bundle.isCancelled) {
      throw new BadRequestException('Cannot modify cancelled subscription');
    }

    const updated = await this.subscriptionsRepository.update(id, {
      autoRenew: dto.autoRenew,
    });

    return updated!;
  }

  async cancel(id: string, userId: string): Promise<SubscriptionBundle> {
    const bundle = await this.findById(id, userId);

    if (bundle.isCancelled) {
      throw new BadRequestException('Subscription already cancelled');
    }

    const updated = await this.subscriptionsRepository.update(id, {
      isCancelled: true,
      autoRenew: false,
      // Keep active until end of current billing cycle
    });

    return updated!;
  }

  async findBundleWithQuota(userId: string): Promise<SubscriptionBundle | null> {
    return this.subscriptionsRepository.findBundleWithQuota(userId);
  }

  async deductFromBundle(bundleId: string): Promise<void> {
    await this.subscriptionsRepository.deductMessage(bundleId);
  }

  async processRenewals(): Promise<{ renewed: number; failed: number }> {
    const subscriptions = await this.subscriptionsRepository.findSubscriptionsDueForRenewal();
    let renewed = 0;
    let failed = 0;

    for (const subscription of subscriptions) {
      // Simulate payment - 10% chance of failure
      const paymentSuccess = Math.random() > 0.1;

      if (paymentSuccess) {
        const now = new Date();
        const newEndDate = new Date(now);

        if (subscription.billingCycle === BillingCycle.MONTHLY) {
          newEndDate.setMonth(newEndDate.getMonth() + 1);
        } else {
          newEndDate.setFullYear(newEndDate.getFullYear() + 1);
        }

        await this.subscriptionsRepository.update(subscription.id, {
          startDate: now,
          endDate: newEndDate,
          renewalDate: newEndDate,
          remainingMessages: subscription.maxMessages,
        });
        renewed++;
      } else {
        // Payment failed - mark subscription inactive
        await this.subscriptionsRepository.update(subscription.id, {
          isActive: false,
          autoRenew: false,
        });
        failed++;
      }
    }

    return { renewed, failed };
  }
}
