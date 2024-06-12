import { Constants, User, convertExpireInToMilliseconds } from '@app/shared';
import getConfigVariables from '@app/shared/config/configVariables.config';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class DeletePendingUsersService implements OnModuleInit {
  private DeletePendingUserAfter;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    this.DeletePendingUserAfter = convertExpireInToMilliseconds(
      await getConfigVariables(Constants.JWT.verifyEmailExpiresIn),
    );
  }

  async deletePendingUsersCreatedBefore24Hours(): Promise<void> {
    const twentyFourHoursAgo = new Date(
      Date.now() - this.DeletePendingUserAfter,
    );

    const pendingUsers = await this.userRepository.find({
      where: {
        isVerified: false,
        createdAt: LessThan(twentyFourHoursAgo),
      },
    });

    // Delete these users from the database
    await this.userRepository.remove(pendingUsers);
  }

  // need to be used with redis tp prevent race condition over the database
  @Cron('0 2 * * *', { timeZone: 'America/New_York' })
  async handleCron() {
    try {
      console.log('Running cron job to delete pending users...');
      await this.deletePendingUsersCreatedBefore24Hours();
    } catch (error) {
      console.error(`Error in deleting pending users: ${error}`);
    }
  }
}
