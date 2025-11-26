import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../../users/domain/entities/user.entity';
import { SubscriptionTier, BillingCycle } from '../enums/subscription-tier.enum';

@Entity('subscription_bundles')
export class SubscriptionBundle {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'enum', enum: SubscriptionTier })
  tier!: SubscriptionTier;

  @Column({ type: 'enum', enum: BillingCycle })
  billingCycle!: BillingCycle;

  @Column()
  maxMessages!: number;

  @Column()
  remainingMessages!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'timestamp' })
  startDate!: Date;

  @Column({ type: 'timestamp' })
  endDate!: Date;

  @Column({ type: 'timestamp', nullable: true })
  renewalDate!: Date | null;

  @Column({ default: true })
  autoRenew!: boolean;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isCancelled!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  isUnlimited(): boolean {
    return this.maxMessages === -1;
  }

  hasRemainingQuota(): boolean {
    return this.isUnlimited() || this.remainingMessages > 0;
  }
}
