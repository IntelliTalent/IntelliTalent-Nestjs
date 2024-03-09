import {
  CreateProfileDto,
  UpdateCertificationsDto,
  UpdateEducationsDto,
  UpdateExperienceDto,
  UpdatePersonalInfoDto,
  UpdateProjectsDto,
  UpdateSkillsDto,
} from '@app/services_communications';
import { CurrentUser, User } from '@app/shared';
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  NotFoundException,
  Body,
  NotImplementedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfileController {
  @Get('cards')
  @ApiOperation({ summary: 'Get profile cards' })
  @ApiResponse({ status: 200, description: 'Returns profile cards' })
  async getProfileCards(@CurrentUser() user: User) {
    throw new NotImplementedException();
  }

  @Get('names')
  @ApiOperation({ summary: 'Get profile names' })
  @ApiResponse({ status: 200, description: 'Returns profile names' })
  async getProfileNames(@CurrentUser() user: User) {
    throw new NotImplementedException();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get profile by ID' })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  async getProfileById(@CurrentUser() user: User, @Param('id') id: string) {
    throw new NotFoundException();
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new profile' })
  @ApiResponse({ status: 201, description: 'Profile created successfully' })
  async createProfile(
    @CurrentUser() user: User,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    throw new NotImplementedException();
  }

  @Put(':id/update-personal-info')
  @ApiOperation({ summary: 'Update personal information of a profile' })
  async updatePersonalInfo(
    @Param('id') id: string,
    @Body() personalInfo: UpdatePersonalInfoDto,
  ) {
    throw new NotImplementedException();
  }

  @Put(':id/update-experience')
  @ApiOperation({ summary: 'Update experience of a profile' })
  async updateExperience(
    @Param('id') id: string,
    @Body() updateExperienceDto: UpdateExperienceDto,
  ) {
    throw new NotImplementedException();
  }

  @Put(':id/update-education')
  @ApiOperation({ summary: 'Update education of a profile' })
  async updateEducation(
    @Param('id') id: string,
    @Body() updateEducation: UpdateEducationsDto,
  ) {
    throw new NotImplementedException();
  }

  @Put(':id/update-projects')
  @ApiOperation({ summary: 'Update projects of a profile' })
  async updateProjects(
    @Param('id') id: string,
    @Body() updateProjectsdto: UpdateProjectsDto,
  ) {
    throw new NotImplementedException();
  }

  @Put(':id/update-skills')
  @ApiOperation({ summary: 'Update skills of a profile' })
  async updateSkills(
    @Param('id') id: string,
    @Body() updateskills: UpdateSkillsDto,
  ) {
    throw new NotImplementedException();
  }

  @Put(':id/update-certificates')
  @ApiOperation({ summary: 'Update certificates of a profile' })
  async updateCertificates(
    @Param('id') id: string,
    @Body() certificates: UpdateCertificationsDto,
  ) {
    throw new NotImplementedException();
  }
}
