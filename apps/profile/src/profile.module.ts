import { Module } from '@nestjs/common';
import {
  Certificate,
  Education,
  Experience,
  FormField,
  FormFieldSchema,
  Profile,
  Project,
  ServiceName,
  SharedModule,
} from '@app/shared';
import { GithubScrapperModule } from './github-scrapper/github-scrapper.module';
import { RedisDBName } from '@app/shared/config/redis.config';
import { ScheduleModule } from '@nestjs/schedule';
import { LinkedinScrapperModule } from './linkedin-scrapper/linkedin-scrapper.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongoDBName } from '@app/shared/config/mongodb.config';

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
    SharedModule.registerRmq(ServiceName.AUTOFILL_SERVICE),
    SharedModule.registerRmq(ServiceName.FILTERATION_SERVICE),
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      Profile,
      Certificate,
      Project,
      Education,
      Experience,
    ]),
    GithubScrapperModule,
    LinkedinScrapperModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
