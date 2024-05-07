import { Module } from '@nestjs/common';
import { AtsController } from './ats.controller';
import { AtsService } from './ats.service';
import { Education, Experience, Certificate, Filteration, Profile, Project, ServiceName, SharedModule } from '@app/shared';
import { RedisDBName } from '@app/shared/config/redis.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Redis } from 'ioredis';

@Module({
  imports: [
    SharedModule.registerRmq(ServiceName.ATS_SERVICE), 
    SharedModule.registerRmq(ServiceName.USER_SERVICE),
    SharedModule.registerRmq(ServiceName.PROFILE_SERVICE),
    SharedModule.registerRmq(ServiceName.JOB_SERVICE),
    SharedModule.registerPostgres(ServiceName.ATS_SERVICE, [Filteration]),
    TypeOrmModule.forFeature([Filteration]),
  ],
  controllers: [AtsController],
  providers: [
    AtsService,
    {
      provide: 'JobsRedisDB', // Provide a token for the jobsRedisDB dependency
      useFactory: async () => {
        const redisUrl = await SharedModule.getRedisDBURL(RedisDBName.jobsDB);
        return new Redis(redisUrl);
      },
    },
    {
      provide: 'MailingRedisDB', // Provide a token for the mailingRedisDB dependency
      useFactory: async () => {
        const redisUrl = await SharedModule.getRedisDBURL(RedisDBName.mailingDB);
        return new Redis(redisUrl);
      },
    },
  ],
})
export class AtsModule {}
