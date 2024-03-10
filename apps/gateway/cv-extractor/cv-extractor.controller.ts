import {
  CvExtractInfoDto,
  cvExtractorPattern,
  ICvInfo,
} from '@app/services_communications/cv-extractor-service';
import { ServiceName } from '@app/shared';
import { Controller, Post, Inject, Body } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('CV Extractor')
@Controller('cv')
export class CvExtractorController {
  constructor(
    @Inject(ServiceName.CV_EXTRACTOR_SERVICE)
    private cvExtractorService: ClientProxy,
  ) {}

  @Post('/info')
  @ApiOperation({ summary: 'Extract the info from a given cv' })
  @ApiResponse({
    status: 200,
    type: ICvInfo,
    description: 'Info extracted successfully',
  })
  async extractInfo(@Body() cv: CvExtractInfoDto) {
    // throw new NotImplementedException();
    return this.cvExtractorService.send(
      { cmd: cvExtractorPattern.extractInfo },
      cv,
    );
  }
}
