import { IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { SubscriptionTier, BillingCycle } from '../../domain/enums/subscription-tier.enum';

export class CreateSubscriptionDto {
  @IsEnum(SubscriptionTier)
  tier!: SubscriptionTier;

  @IsEnum(BillingCycle)
  billingCycle!: BillingCycle;

  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean = true;
}
