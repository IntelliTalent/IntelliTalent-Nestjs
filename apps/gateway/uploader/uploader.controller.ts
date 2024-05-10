import { AzureStorageFileInterceptor, UploadedFileMetadata } from "@nestjs/azure-storage";
import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags('Uploader')
@Controller('uploader')
export class ApiUploaderController {
  constructor() {}

  /**
   * This method uploades a new file to Azure storage account.
   *
   * @returns An string of the file link.
   */
  @ApiOperation({ summary: 'For uploading a new file to Azure storage account.' })
  @Post('upload')
  @UseInterceptors(
    AzureStorageFileInterceptor('file'),
  )
  async upload(
    @UploadedFile() file: UploadedFileMetadata,
  ) {
    return {
      link: file.storageUrl,
    }
  }
}
