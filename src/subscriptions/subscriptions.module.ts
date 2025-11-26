import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionBundle } from './domain/entities/subscription-bundle.entity';
import { SubscriptionsRepository } from './infrastructure/repositories/subscriptions.repository';
import { SubscriptionsService } from './application/services/subscriptions.service';
import { SubscriptionsController } from './presentation/controllers/subscriptions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionBundle])],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsRepository, SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
