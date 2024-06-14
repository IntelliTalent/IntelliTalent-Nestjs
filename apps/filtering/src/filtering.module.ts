import { Module } from '@nestjs/common';
import { FilteringController } from './filtering.controller';
import { FilteringService } from './filtering.service';
import { Filteration, ServiceName, SharedModule } from '@app/shared';
import { MongoDBName } from '@app/shared/config/mongodb.config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    SharedModule.registerMongoDB(MongoDBName.FilterationDB),
    SharedModule.registerRmq(ServiceName.ATS_SERVICE),
    SharedModule.registerRmq(ServiceName.JOB_SERVICE),
    SharedModule.registerRmq(ServiceName.NOTIFIER_SERVICE),
    SharedModule.registerRmq(ServiceName.PROFILE_SERVICE),
    SharedModule.registerRmq(ServiceName.USER_SERVICE),
    SharedModule.registerRmq(ServiceName.QUIZ_SERVICE),
    SharedModule.registerPostgres(ServiceName.FILTERATION_SERVICE, [Filteration]),
    TypeOrmModule.forFeature([Filteration]),
  ],
  controllers: [FilteringController],
  providers: [FilteringService],
})
export class FilteringModule {}
