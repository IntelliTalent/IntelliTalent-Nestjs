import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MonogoDBName } from '@app/shared/config/mongodb.config';
import { UnstructuredJobsSchema, SharedModule, UnstructuredJobs } from '@app/shared';

@Module({
  imports: [
    SharedModule.registerMongoDB(MonogoDBName.ScrappedJobsDB),
    MongooseModule.forFeature([
      { name: UnstructuredJobs.name, schema: UnstructuredJobsSchema },
    ]),
  ],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
