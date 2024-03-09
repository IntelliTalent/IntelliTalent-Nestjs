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
  async getProfileCards() {
    throw new NotImplementedException();
  }

  @Get('names')
  @ApiOperation({ summary: 'Get profile names' })
  @ApiResponse({ status: 200, description: 'Returns profile names' })
  async getProfileNames() {
    throw new NotImplementedException();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get profile by ID' })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  async getProfileById(@Param('id') id: string) {
    throw new NotFoundException();
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new profile' })
  @ApiResponse({ status: 201, description: 'Profile created successfully' })
  async createProfile(@Body() profileData: any) {
    throw new NotImplementedException();
  }

  @Put(':id/update-personal-info')
  @ApiOperation({ summary: 'Update personal information of a profile' })
  async updatePersonalInfo(@Param('id') id: string, @Body() personalInfo: any) {
    throw new NotImplementedException();
  }

  @Put(':id/update-experience')
  @ApiOperation({ summary: 'Update experience of a profile' })
  async updateExperience(@Param('id') id: string, @Body() experience: any) {
    throw new NotImplementedException();
  }

  @Put(':id/update-education')
  @ApiOperation({ summary: 'Update education of a profile' })
  async updateEducation(@Param('id') id: string, @Body() education: any) {
    throw new NotImplementedException();
  }

  @Put(':id/update-projects')
  @ApiOperation({ summary: 'Update projects of a profile' })
  async updateProjects(@Param('id') id: string, @Body() projects: any) {
    throw new NotImplementedException();
  }

  @Put(':id/update-skills')
  @ApiOperation({ summary: 'Update skills of a profile' })
  async updateSkills(@Param('id') id: string, @Body() skills: any) {
    throw new NotImplementedException();
  }

  @Put(':id/update-certificates')
  @ApiOperation({ summary: 'Update certificates of a profile' })
  async updateCertificates(@Param('id') id: string, @Body() certificates: any) {
    throw new NotImplementedException();
  }
}
