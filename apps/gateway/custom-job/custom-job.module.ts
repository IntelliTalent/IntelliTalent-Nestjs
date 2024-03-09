import { Module } from '@nestjs/common';
import { ServiceName, SharedModule } from '@app/shared';
import { ApiCustomJobController } from './custom-job.controller';

@Module({
  imports: [
    SharedModule.registerRmq(ServiceName.CUSTOM_JOB_SERVICE),
  ],
  controllers: [ApiCustomJobController],
  providers: [],
})
export class ApiCustomJobModule {}
