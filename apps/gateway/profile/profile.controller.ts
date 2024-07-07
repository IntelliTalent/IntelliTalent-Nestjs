import {
  CreateProfileDto,
  profileServicePattern,
  ResponseScrapGithubRepoSto,
  ScrapeProfile,
  getUserRepos,
  AUTH_HEADER,
  DeleteProfileDto,
  UpdateProfileDto,
  ResponseProfileCardsDto,
} from '@app/services_communications';
import { PaginatedProfilesDto } from '@app/services_communications/profile/dtos/paginated-profiles.deo';
import { ResponseScrapeProfileDto } from '@app/services_communications/profile/dtos/response-scrape-profile.dto';
import {
  ApiPaginatedResponse,
  CurrentUser,
  Profile,
  Roles,
  ServiceName,
  User,
  UserType,
} from '@app/shared';
import { PageOptionsDto } from '@app/shared/api-features/dtos/page-options.dto';
import { Public } from '@app/shared/decorators/ispublic-decorator.decorator';
import { IsUUIDDto } from '@app/shared/dtos/uuid.dto';
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Inject,
  Query,
  Patch,
  Delete,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('Profiles')
@Controller('profiles')
@UseInterceptors(ClassSerializerInterceptor)
export class ProfileController {
  constructor(
    @Inject(ServiceName.PROFILE_SERVICE) private profileService: ClientProxy,
  ) {}

  //  TODO: we need to apply rate limit here for profile
  @Post('scrape')
  @ApiOperation({ summary: 'Scrape profile' })
  @ApiResponse({
    status: 200,
    description: 'Scraped profile',
    type: ResponseScrapeProfileDto,
  })
  @Public()
  async scrapeProfile(
    @Body() scrapeProfileDto: ScrapeProfile,
  ): Promise<ResponseScrapeProfileDto> {
    return firstValueFrom(
      this.profileService.send(
        { cmd: profileServicePattern.scrapeProfile },
        scrapeProfileDto,
      ),
    );
  }

  @Post('create')
  @ApiBearerAuth(AUTH_HEADER)
  @ApiOperation({ summary: 'Create a new profile' })
  @ApiResponse({
    status: 201,
    description: 'Profile created successfully',
    type: Profile,
  })
  @Roles([UserType.jobSeeker])
  createProfile(
    @CurrentUser() user: User,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    createProfileDto.userId = user.id;
    return this.profileService.send(
      { cmd: profileServicePattern.createProfile },
      createProfileDto,
    );
  }

  @ApiBearerAuth(AUTH_HEADER)
  @Get('repos/:username')
  @ApiOperation({ summary: 'Get user repos' })
  @ApiResponse({
    status: 200,
    isArray: true,
    type: ResponseScrapGithubRepoSto,
  })
  async getUserRepos(
    @Query() pageOptionsDto: PageOptionsDto,
    @Param('username') userName: string,
  ) {
    const payload: getUserRepos = {
      username: userName,
      pageOptionsDto: pageOptionsDto,
    };
    return this.profileService.send(
      { cmd: profileServicePattern.getUserRepos },
      payload,
    );
  }

  @Get('cards')
  @ApiBearerAuth(AUTH_HEADER)
  @ApiOperation({ summary: 'Get profile cards' })
  @ApiPaginatedResponse(ResponseProfileCardsDto)
  @Roles([UserType.jobSeeker])
  getProfileCards(
    @CurrentUser() user: User,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    const payload: PaginatedProfilesDto = {
      id: user.id,
      pageOptionsDto,
    };
    return this.profileService.send(
      { cmd: profileServicePattern.getUserProfileCard },
      payload,
    );
  }

  @Get('all')
  @ApiBearerAuth(AUTH_HEADER)
  @ApiOperation({ summary: 'Get user profiles' })
  @ApiPaginatedResponse(Profile)
  @Roles([UserType.jobSeeker])
  getUserProfiles(
    @CurrentUser() user: User,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    const payload: PaginatedProfilesDto = {
      id: user.id,
      pageOptionsDto,
    };
    return this.profileService.send(
      { cmd: profileServicePattern.getUserProfile },
      payload,
    );
  }

  @Get(':id')
  @ApiBearerAuth(AUTH_HEADER)
  @ApiOperation({ summary: 'Get profile by ID' })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  @ApiResponse({
    type: Profile,
  })
  @Public()
  getProfileById(@Param() dto: IsUUIDDto) {
    return this.profileService.send(
      { cmd: profileServicePattern.getProfileById },
      dto.id,
    );
  }

  @Patch(':id')
  @ApiBearerAuth(AUTH_HEADER)
  @ApiOperation({ summary: 'Update a profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: Profile,
  })
  async updateProfile(
    @CurrentUser() user: User,
    @Param() dto: IsUUIDDto,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    updateProfileDto.userId = user.id;
    updateProfileDto.profileId = dto.id;
    return this.profileService.send(
      { cmd: profileServicePattern.updateProfile },
      updateProfileDto,
    );
  }

  @Delete(':id')
  @ApiBearerAuth(AUTH_HEADER)
  @ApiOperation({ summary: 'Delete a profile' })
  @ApiResponse({ status: 200, description: 'Profile deleted successfully' })
  deleteProfile(@CurrentUser() user: User, @Param() dto: IsUUIDDto) {
    const deleteProfileDto: DeleteProfileDto = {
      userId: user.id,
      profileId: dto.id,
    };
    return this.profileService.send(
      { cmd: profileServicePattern.deleteProfile },
      deleteProfileDto,
    );
  }
}
