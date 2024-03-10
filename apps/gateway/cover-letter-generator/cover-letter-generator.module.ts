import { Module } from '@nestjs/common';
import { ServiceName, SharedModule } from '@app/shared';
import { ApiCoverLetterGeneratorController } from './cover-letter-generator.controller';

@Module({
  // assign the RabbitMQ queues (CoverLetterGenerator) to the CoverLetterGeneratorController
  imports: [
    SharedModule.registerRmq(ServiceName.COVER_LETTER_GENERATOR_SERVICE),
  ],
  controllers: [ApiCoverLetterGeneratorController],
  providers: [],
})
export class ApiCoverLetterGeneratorModule {}
