import { Module } from '@nestjs/common';
import { NotifierController } from './notifier.controller';
import { NotifierService } from './notifier.service';
import { SharedModule } from '@app/shared';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisDBName } from '@app/shared/config/redis.config';

@Module({
  imports: [
    SharedModule.registerRedis(RedisDBName.mailingDB),
    ScheduleModule.forRoot(),
  ],
  controllers: [NotifierController],
  providers: [NotifierService],
})
export class NotifierModule {}
