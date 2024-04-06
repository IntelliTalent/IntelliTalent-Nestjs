import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import {
  Certificate,
  Education,
  Experience,
  Profile,
  Project,
  ServiceName,
  SharedModule,
} from '@app/shared';
import { GithubScrapperModule } from './github-scrapper/github-scrapper.module';
import { RedisDBName } from '@app/shared/config/redis.config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    SharedModule.registerPostgres(ServiceName.PROFILE_SERVICE, [
      Profile,
      Certificate,
      Project,
      Education,
      Experience,
    ]),
    SharedModule.registerRedis(RedisDBName.profiles_DB),
    ScheduleModule.forRoot(),
    GithubScrapperModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
