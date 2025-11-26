import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async create(userData: Partial<User>): Promise<User> {
    return this.usersRepository.create(userData);
  }

  async incrementFreeMessagesUsed(userId: string): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (user) {
      await this.usersRepository.update(userId, {
        freeMessagesUsed: user.freeMessagesUsed + 1,
      });
    }
  }

  async resetFreeQuota(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      freeMessagesUsed: 0,
      freeQuotaResetDate: new Date(),
    });
  }

  async checkAndResetMonthlyQuota(user: User): Promise<User> {
    const now = new Date();
    const resetDate = user.freeQuotaResetDate;

    // If no reset date or reset date is in a previous month, reset quota
    if (
      !resetDate ||
      resetDate.getMonth() !== now.getMonth() ||
      resetDate.getFullYear() !== now.getFullYear()
    ) {
      await this.resetFreeQuota(user.id);
      const updatedUser = await this.findById(user.id);
      return updatedUser || user;
    }

    return user;
  }
}
