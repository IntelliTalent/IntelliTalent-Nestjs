import { Module } from '@nestjs/common';
import { ApiUploaderController } from './uploader.controller';
import { ConfigModule } from '@nestjs/config';
import { UploaderService } from './uploader.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
  ],
  controllers: [ApiUploaderController],
  providers: [UploaderService],
})
export class ApiUploaderModule {}
