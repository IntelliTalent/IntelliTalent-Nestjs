import { Module } from '@nestjs/common';
import { ServiceName, SharedModule } from '@app/shared';
import { ApiATSController } from './ats.controller';

@Module({
  // assign the RabbitMQ queues (ATS) to the ATSController
  imports: [
    SharedModule.registerRmq(ServiceName.ATS_SERVICE),
  ],
  controllers: [ApiATSController],
  providers: [],
})
export class ApiATSModule {}
