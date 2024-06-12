import { Public } from "@app/shared/decorators/ispublic-decorator.decorator";
import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
// import { MulterFile } from 'multer';
import { UploaderService } from "./uploader.service";
import { UploadResponseDto } from "@app/services_communications/uploader-service/uploader-response.dto";

@ApiTags('Uploader')
@Controller('uploader')
export class ApiUploaderController {
  constructor(
    private readonly uploaderService: UploaderService,
  ) {}

  /**
   * This method uploades a new file to Azure storage account.
   *
   * @returns An string of the file link.
   */
  @ApiOperation({ summary: 'For uploading a new file to Azure storage account.' })
  @Public()
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file'),
  )
  async upload(
    @UploadedFile() file,
  ): Promise<UploadResponseDto> {
    return await this.uploaderService.uploadFile(file);
  }
}
