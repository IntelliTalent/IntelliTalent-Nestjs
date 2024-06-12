import { Module } from '@nestjs/common';
import { AtsController } from './ats.controller';
import { AtsService } from './ats.service';
import { Filteration, ServiceName, SharedModule } from '@app/shared';
import { RedisDBName } from '@app/shared/config/redis.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Redis } from 'ioredis';
import { ATS_JOBS_REDIS_DB_PROVIDER, ATS_MAILING_REDIS_DB_PROVIDER } from '@app/services_communications/ats-service';

@Module({
  imports: [
    SharedModule.registerRmq(ServiceName.ATS_SERVICE), 
    SharedModule.registerRmq(ServiceName.USER_SERVICE),
    SharedModule.registerRmq(ServiceName.PROFILE_SERVICE),
    SharedModule.registerRmq(ServiceName.JOB_SERVICE),
    SharedModule.registerRmq(ServiceName.NOTIFIER_SERVICE),
    SharedModule.registerPostgres(ServiceName.ATS_SERVICE, [Filteration]),
    TypeOrmModule.forFeature([Filteration]),
  ],
  controllers: [AtsController],
  providers: [
    AtsService,
    {
      provide: ATS_JOBS_REDIS_DB_PROVIDER, // provide a token for the jobsRedisDB dependency
      useFactory: async () => {
        const redisUrl = await SharedModule.getRedisDBURL(RedisDBName.jobsDB);
        return new Redis(redisUrl);
      },
    },
    {
      provide: ATS_MAILING_REDIS_DB_PROVIDER, // provide a token for the mailingRedisDB dependency
      useFactory: async () => {
        const redisUrl = await SharedModule.getRedisDBURL(RedisDBName.mailingDB);
        return new Redis(redisUrl);
      },
    },
  ],
})
export class AtsModule {}
