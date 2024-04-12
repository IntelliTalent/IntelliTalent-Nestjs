import { Module } from '@nestjs/common';
import { AtsController } from './ats.controller';
import { AtsService } from './ats.service';
import { Profile, ServiceName, SharedModule } from '@app/shared';
import { RedisDBName } from '@app/shared/config/redis.config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    SharedModule.registerRmq(ServiceName.ATS_SERVICE), 
    SharedModule.registerRmq(ServiceName.USER_SERVICE),
    SharedModule.registerRedis(RedisDBName.jobsDB),
    //SharedModule.registerPostgres(ServiceName.ATS_SERVICE, [Profile]),
    //TypeOrmModule.forFeature([Profile]),
  ],
  controllers: [AtsController],
  providers: [AtsService],
})
export class AtsModule {}
