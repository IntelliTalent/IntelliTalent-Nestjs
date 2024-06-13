import { Module } from '@nestjs/common';
import { CvExtractorController } from './cv-extractor.controller';
import { ServiceName, SharedModule } from '@app/shared';
import { CvExtractorService } from './cv-extractor.service';
import { RedisDBName } from '@app/shared/config/redis.config';

@Module({
  imports: [
    SharedModule.registerRmq(ServiceName.CV_EXTRACTOR_SERVICE),
    SharedModule.registerRedis(RedisDBName.profiles_DB),
  ],
  controllers: [CvExtractorController],
  providers: [CvExtractorService],
})
export class ApiCvExtractorModule {}
