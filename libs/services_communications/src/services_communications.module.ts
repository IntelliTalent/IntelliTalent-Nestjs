import { Module } from '@nestjs/common';
import { ServicesCommunicationsService } from './services_communications.service';

@Module({
  providers: [ServicesCommunicationsService],
  exports: [ServicesCommunicationsService],
})
export class ServicesCommunicationsModule {}
