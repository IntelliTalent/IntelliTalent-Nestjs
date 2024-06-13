import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoDBName } from '@app/shared/config/mongodb.config';
import {
  UnstructuredJobsSchema,
  SharedModule,
  UnstructuredJobs,
  ServiceName,
  StructuredJob,
  CustomJobsStages,
  Interview,
} from '@app/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisDBName } from '@app/shared/config/redis.config';

@Module({
  imports: [
    SharedModule.registerRmq(ServiceName.SCRAPPER_SERVICE),
    SharedModule.registerRmq(ServiceName.JOB_EXTRACTOR_SERVICE),
    SharedModule.registerRmq(ServiceName.ATS_SERVICE),
    SharedModule.registerRmq(ServiceName.FILTRATION_SERVICE),
    SharedModule.registerMongoDB(MongoDBName.ScrappedJobsDB),
    MongooseModule.forFeature([
      { name: UnstructuredJobs.name, schema: UnstructuredJobsSchema },
    ]),
    SharedModule.registerPostgres(ServiceName.JOB_SERVICE, [
      StructuredJob,
      Interview,
      CustomJobsStages,
    ]),
    TypeOrmModule.forFeature([StructuredJob, Interview, CustomJobsStages]),
    SharedModule.registerRedis(RedisDBName.jobsDB),
    ScheduleModule.forRoot(),
  ],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
