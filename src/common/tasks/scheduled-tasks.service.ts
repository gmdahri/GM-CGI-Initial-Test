import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UsersRepository } from '../../users/infrastructure/repositories/users.repository';

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  // Reset free quota on the 1st of each month at midnight
  @Cron('0 0 1 * *')
  async handleMonthlyQuotaReset() {
    this.logger.log('Starting monthly free quota reset...');
    try {
      await this.usersRepository.resetFreeQuotaForAllUsers();
      this.logger.log('Monthly free quota reset completed successfully');
    } catch (error) {
      this.logger.error('Failed to reset monthly free quota', error);
    }
  }
}
