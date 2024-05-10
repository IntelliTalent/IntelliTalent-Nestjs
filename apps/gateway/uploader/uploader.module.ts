import { Module } from '@nestjs/common';
import { Constants } from '@app/shared';
import { ApiUploaderController } from './uploader.controller';
import { AzureStorageModule } from '@nestjs/azure-storage';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    AzureStorageModule.withConfig({
      // the module doesn't have async configuration function, so we need to use the config variables directly
      sasKey: process.env[Constants.AZURE.AZURE_STORAGE_SAS_KEY],
      accountName: process.env[Constants.AZURE.AZURE_STORAGE_ACCOUNT],
      containerName: process.env[Constants.AZURE.AZURE_STORAGE_CONTAINER],
    }),
  ],
  controllers: [ApiUploaderController],
  providers: [],
})
export class ApiUploaderModule {}
