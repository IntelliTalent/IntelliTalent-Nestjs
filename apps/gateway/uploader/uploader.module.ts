import { Module } from '@nestjs/common';
import { ApiUploaderController } from './uploader.controller';
import { UploaderService } from './uploader.service';

@Module({
  controllers: [ApiUploaderController],
  providers: [UploaderService],
})
export class ApiUploaderModule {}
