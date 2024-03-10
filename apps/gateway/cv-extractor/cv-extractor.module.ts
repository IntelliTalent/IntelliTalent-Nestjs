import { Module } from '@nestjs/common';
import { CvExtractorController } from './cv-extractor.controller';
import { ServiceName, SharedModule } from '@app/shared';

@Module({
  imports: [SharedModule.registerRmq(ServiceName.CV_EXTRACTOR_SERVICE)],
  controllers: [CvExtractorController],
})
export class ApiCvExtractorModule {}
