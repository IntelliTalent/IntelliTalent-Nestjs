import {
  cvExtractorPattern,
  ICvInfo,
} from '@app/services_communications/cv-extractor-service';
import { ServiceName } from '@app/shared';
import {
  Controller,
  Post,
  Inject,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { join } from 'path';
import { diskStorage } from 'multer';
import { Public } from '@app/shared/decorators/ispublic-decorator.decorator';
import { createReadStream } from 'fs';

@ApiTags('CV Extractor')
@Controller('cv')
export class CvExtractorController {
  constructor(
    @Inject(ServiceName.CV_EXTRACTOR_SERVICE)
    private cvExtractorService: ClientProxy,
  ) {}

  // TODO: Remove public
  @Public()
  @Post('/info')
  @ApiOperation({ summary: 'Extract the info from a given cv' })
  @ApiResponse({
    status: 200,
    type: ICvInfo,
    description: 'Info extracted successfully',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, __, callback) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');

          return callback(null, `${randomName}.pdf`);
        },
      }),
    }),
  )
  async extractInfo(@UploadedFile() file) {
    // TODO: Save the cv link to the user's profile
    return this.cvExtractorService.send(
      { cmd: cvExtractorPattern.extractInfo },
      { fileId: file.filename.split('.')[0] },
    );
  }

  // TODO: Remove public
  @Public()
  @Get('/:fileId')
  getFile(@Param('fileId') fileId: string, @Res() res) {
    const filePath = join(process.cwd(), `/uploads/${fileId}.pdf`);

    // Set Content-Type header
    res.set('Content-Type', 'application/pdf');

    // Set Content-Disposition header to force download
    // TODO: Change the file name to user's name
    res.set('Content-Disposition', `attachment; filename="${fileId}.pdf"`);

    const fileStream = createReadStream(filePath);

    fileStream.pipe(res);
  }
}
