import { Injectable } from '@nestjs/common';
import { UsersService } from '../../../users/application/services/users.service';
import { SubscriptionsService } from '../../../subscriptions/application/services/subscriptions.service';
import { QuotaExceededException } from '../../../common/exceptions/quota-exceeded.exception';
import { User } from '../../../users/domain/entities/user.entity';

const FREE_MESSAGES_PER_MONTH = 3;

export interface QuotaCheckResult {
  canProceed: boolean;
  useFreeQuota: boolean;
  bundleId: string | null;
}

@Injectable()
export class UsageService {
  constructor(
    private readonly usersService: UsersService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async checkAndDeductQuota(user: User): Promise<QuotaCheckResult> {
    // First, check and reset monthly quota if needed
    const updatedUser = await this.usersService.checkAndResetMonthlyQuota(user);

    // Check if free quota is available
    if (updatedUser.freeMessagesUsed < FREE_MESSAGES_PER_MONTH) {
      return {
        canProceed: true,
        useFreeQuota: true,
        bundleId: null,
      };
    }

    // Check for active subscription bundles
    const bundle = await this.subscriptionsService.findBundleWithQuota(user.id);

    if (bundle && bundle.hasRemainingQuota()) {
      return {
        canProceed: true,
        useFreeQuota: false,
        bundleId: bundle.id,
      };
    }

    // No quota available
    throw new QuotaExceededException();
  }

  async deductQuota(userId: string, useFreeQuota: boolean, bundleId: string | null): Promise<void> {
    if (useFreeQuota) {
      await this.usersService.incrementFreeMessagesUsed(userId);
    } else if (bundleId) {
      await this.subscriptionsService.deductFromBundle(bundleId);
    }
  }
}
