import { Module } from '@nestjs/common';
import { NotifierController } from './notifier.controller';
import { NotifierService } from './notifier.service';
import { RedisDBName, SharedModule } from '@app/shared';

@Module({
  imports: [SharedModule.registerRedis(RedisDBName.mailingDB)],
  controllers: [NotifierController],
  providers: [NotifierService],
})
export class NotifierModule {}
