import { Module } from '@nestjs/common';
import { ServiceName, SharedModule } from '@app/shared';
import { ApiCoverLetterGeneratorController } from './cover-letter-generator.controller';
import { CoverLetterGeneratorService } from './cover-letter-generator.service';

@Module({
  // assign the RabbitMQ queues (CoverLetterGenerator) to the CoverLetterGeneratorController
  imports: [
    SharedModule.registerRmq(ServiceName.COVER_LETTER_GENERATOR_SERVICE),
    SharedModule.registerRmq(ServiceName.PROFILE_SERVICE),
  ],
  controllers: [ApiCoverLetterGeneratorController],
  providers: [CoverLetterGeneratorService],
})
export class ApiCoverLetterGeneratorModule {}
