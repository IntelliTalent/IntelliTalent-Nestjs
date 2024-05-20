import { ICvInfo } from '@app/services_communications/cv-extractor-service';
import { CurrentUser, Roles, User, UserType } from '@app/shared';
import { Controller, Post, Get, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TriggerExtractInfoDto } from '@app/services_communications/cv-extractor-service/dtos/trigger-extract-info.dto';
import { AUTH_HEADER } from '@app/services_communications';
import { CvExtractorService } from './cv-extractor.service';
import { Public } from '@app/shared/decorators/ispublic-decorator.decorator';

@ApiTags('CV Extractor')
@Controller('cv')
export class CvExtractorController {
  constructor(private readonly cvExtractorService: CvExtractorService) {}

  @Post('/info')
  @Roles([UserType.jobSeeker])
  @ApiOperation({ summary: 'Trigger the info extraction process' })
  @ApiResponse({
    status: 200,
    description: 'Data is currently being processed.',
  })
  @ApiBearerAuth(AUTH_HEADER)
  async triggerExtractInfo(
    @CurrentUser() user: User,
    @Body() payload: TriggerExtractInfoDto,
  ) {
    return this.cvExtractorService.trigger(user.id, payload.cvLink);
  }

  @Get('/extract')
  @Public()
  @Roles([UserType.jobSeeker])
  @ApiOperation({ summary: 'Extract the info from a given cv' })
  @ApiResponse({
    status: 200,
    type: ICvInfo,
    description: 'Info extracted successfully',
  })
  @ApiBearerAuth(AUTH_HEADER)
  async extractInfo(@CurrentUser() user: User) {
    return this.cvExtractorService.extractInfo(user.id);
  }
}
