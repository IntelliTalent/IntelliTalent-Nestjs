import {
  CreateProfileDto,
  DeleteProfileDto,
  UpdateProfileDto,
} from '@app/services_communications';
import {
  AuthFormFieldsDto,
  AutofillServicePattern,
} from '@app/services_communications/autofill';
import { PaginatedProfilesDto } from '@app/services_communications/profile/dtos/paginated-profiles.deo';
import { Profile, ServiceName } from '@app/shared';
import { applyQueryOptions } from '@app/shared/api-features/apply_query_options';
import { PageDto } from '@app/shared/api-features/dtos/page.dto';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @Inject(ServiceName.AUTOFILL_SERVICE) private autoFillService: ClientProxy,
    @Inject(ServiceName.FILTERATION_SERVICE) private filtrationService: ClientProxy
  ) {}

  async create(createProfileDto: CreateProfileDto): Promise<Profile> {
    // Create the new profile
    const profile = this.profileRepository.create({
      ...createProfileDto,
    });

    // Save the new profile
    const savedProfile = await this.profileRepository.save(profile);

    this.updateFormFields(savedProfile);

    return savedProfile;
  }

  async updateFormFields(profile: Profile) {
    const { userId, createdAt, deletedAt, updatedAt, id, ...requiredData } =
      profile;

    const payload: AuthFormFieldsDto = {
      userId: userId,
      data: {
        ...requiredData,
      },
    };

    await firstValueFrom(
      this.autoFillService.send(
        {
          cmd: AutofillServicePattern.patchFields,
        },
        payload,
      ),
    );
  }

  async update(updateProfileDto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: {
        userId: updateProfileDto.userId,
        id: updateProfileDto.profileId,
      },
    });

    delete updateProfileDto.userId;
    delete updateProfileDto.profileId;

    if (!profile) {
      throw new NotFoundException('You Dont Profile With this Id');
    }

    Object.assign(profile, updateProfileDto);

    this.updateFormFields(profile);

    return this.profileRepository.save(profile);
  }

  async delete(DeleteProfileDto: DeleteProfileDto): Promise<string> {
    const profile = await this.profileRepository.findOne({
      where: {
        userId: DeleteProfileDto.userId,
        id: DeleteProfileDto.profileId,
      },
    });

    if (!profile) {
      throw new NotFoundException("You Don't have Profile With this Id");
    }

    this.profileRepository.softDelete(DeleteProfileDto.profileId);


    // TODO: should uncomment this line after implementing the filtration service
    // this.filtrationService.emit('deleteProfile', DeleteProfileDto.profileId);

    return 'Profile Deleted Successfully';
  }

  async findProfiles(options: FindManyOptions<Profile>): Promise<Profile[]> {
    options.relations = {
      projects: true,
      experiences: true,
      educations: true,
      certificates: true,
    };
    const profile = await this.profileRepository.find(options);

    if (!profile) {
      throw new NotFoundException('Profile Not Found');
    }

    return profile;
  }

  async findOneProfile(options: FindOneOptions<Profile>): Promise<Profile> {
    options.relations = {
      projects: true,
      experiences: true,
      educations: true,
      certificates: true,
    };
    const profile = await this.profileRepository.findOne(options);

    if (!profile) {
      throw new NotFoundException('Profile Not Found');
    }

    return profile;
  }

  getUserProfileCard(dtoData: PaginatedProfilesDto): Promise<PageDto<Profile>> {
    const { id, pageOptionsDto } = dtoData;
    const profilesCards = this.profileRepository
      .createQueryBuilder('profile')
      .where('profile.userId = :id', { id })
      .select([
        'profile.id',
        'profile.jobTitle',
        'profile.yearsOfExperience',
        'profile.skills',
        'profile.linkedIn',
        'profile.gitHub',
        'profile.cv',
        'profile.graduatedFromCS',
        'profile.summary',
      ]);

    return applyQueryOptions(profilesCards, pageOptionsDto);
  }

  getUserProfiles(payload: PaginatedProfilesDto): Promise<PageDto<Profile>> {
    const { id, pageOptionsDto } = payload;
    const profiles = this.profileRepository
      .createQueryBuilder('profile')
      .where('profile.userId = :id', { id })
      .leftJoinAndSelect('profile.projects', 'projects')
      .leftJoinAndSelect('profile.experiences', 'experiences')
      .leftJoinAndSelect('profile.educations', 'educations')
      .leftJoinAndSelect('profile.certificates', 'certificates');

    return applyQueryOptions(profiles, pageOptionsDto);
  }

  getProfileById(profileId: string): Promise<Profile> {
    return this.findOneProfile({
      where: { id: profileId },
    });
  }

  getProfilesByUsersIds(userIds: string[]) {
    return this.profileRepository.find({
      where: {
        userId: In(userIds),
      },
      relations: ['projects', 'experiences', 'educations', 'certificates'],
    });
  }
}
