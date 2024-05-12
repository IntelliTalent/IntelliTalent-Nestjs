import { Module } from '@nestjs/common';
import { ServiceName, SharedModule } from '@app/shared';
import { ApiCVGeneratorController } from './cv-generator.controller';
import { CVGeneratorService } from './cv-generator.service';

@Module({
  // assign the RabbitMQ queues (CVGenerator) to the CVGeneratorController
  imports: [
    SharedModule.registerRmq(ServiceName.CV_GENERATOR_SERVICE),
    SharedModule.registerRmq(ServiceName.PROFILE_SERVICE),
    SharedModule.registerRmq(ServiceName.USER_SERVICE),
  ],
  controllers: [ApiCVGeneratorController],
  providers: [CVGeneratorService],
})
export class ApiCVGeneratorModule {}
