import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MonogoDBName } from '@app/shared/config/mongodb.config';
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

@Module({
  imports: [
    SharedModule.registerRmq(ServiceName.SCRAPPER_SERVICE),
    SharedModule.registerMongoDB(MonogoDBName.ScrappedJobsDB),
    MongooseModule.forFeature([
      { name: UnstructuredJobs.name, schema: UnstructuredJobsSchema },
    ]),
    SharedModule.registerPostgres(ServiceName.JOB_SERVICE, [
      StructuredJob,
      Interview,
      CustomJobsStages,
    ]),
    TypeOrmModule.forFeature([StructuredJob, Interview, CustomJobsStages]),
    ScheduleModule.forRoot(),
  ],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
