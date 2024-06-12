import { Module } from '@nestjs/common';
import { ServiceName, SharedModule } from '@app/shared';
import { CustomJobController } from './custom-job.controller';

@Module({
  imports: [SharedModule.registerRmq(ServiceName.CUSTOM_JOB_SERVICE)],
  controllers: [CustomJobController],
  
})
export class ApiCustomJobModule {}
