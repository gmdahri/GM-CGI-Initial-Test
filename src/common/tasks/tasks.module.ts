import { Module } from '@nestjs/common';
import { ScheduledTasksService } from './scheduled-tasks.service';
import { UsersModule } from '../../users/users.module';
import { SubscriptionsModule } from '../../subscriptions/subscriptions.module';

@Module({
  imports: [UsersModule, SubscriptionsModule],
  providers: [ScheduledTasksService],
})
export class TasksModule {}
