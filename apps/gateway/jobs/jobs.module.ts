import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { ServiceName, SharedModule } from '@app/shared';

@Module({
  imports: [SharedModule.registerRmq(ServiceName.JOB_SERVICE)],
  controllers: [JobsController],
})
export class ApiJobsModule {}
