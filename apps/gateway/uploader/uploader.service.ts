import { UploadResponseDto } from '@app/services_communications/uploader-service/uploader-response.dto';
import { Constants } from '@app/shared';
import getConfigVariables from '@app/shared/config/configVariables.config';
import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';
import { MulterFile } from 'multer';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploaderService {
  constructor() {
    this._getBlobServiceInstance();
  }
  private blobClientService: BlobServiceClient;

  private _getBlobServiceInstance() {
    const connectionString = getConfigVariables(
      Constants.AZURE.AZURE_STORAGE_CONNECTION,
    );
    this.blobClientService =
      BlobServiceClient.fromConnectionString(connectionString);
  }

  private async _getBlobClient(fileName: string): Promise<BlockBlobClient> {
    const containerName = getConfigVariables(
      Constants.AZURE.AZURE_STORAGE_CONTAINER,
    );
    const containerClient =
      this.blobClientService.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    return blockBlobClient;
  }
  public async uploadFile(file: MulterFile): Promise<UploadResponseDto> {
    // generate uuid string
    const generatedUuid = uuidv4();
    const file_name = generatedUuid + '-' + file.originalname;
    const blockBlobClient = await this._getBlobClient(file_name);
    const link = blockBlobClient.url;
    await blockBlobClient.uploadData(file.buffer);

    return {
      link,
    };
  }
}
