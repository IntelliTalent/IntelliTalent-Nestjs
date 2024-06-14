import {
  CreateProfileDto,
  DeleteProfileDto,
  UpdateProfileDto,
} from '@app/services_communications';
import {
  AuthFormFieldsDto,
  AutofillServicePattern,
} from '@app/services_communications/autofill';
import { Profile, ServiceName } from '@app/shared';
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

    return 'Profile Deleted Successfully';
  }

  private async findProfiles(
    options: FindManyOptions<Profile>,
  ): Promise<Profile[]> {
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

  private async findOneProfile(
    options: FindOneOptions<Profile>,
  ): Promise<Profile> {
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

  getUserProfileCard(userId: string): Promise<Profile[]> {
    return this.profileRepository.find({
      where: { userId },
      select: [
        'id',
        'jobTitle',
        'yearsOfExperience',
        'skills',
        'linkedIn',
        'gitHub',
        'cv',
        'graduatedFromCS',
        'summary'
      ],
    });
  }

  getUserProfiles(userId: string): Promise<Profile[]> {
    return this.findProfiles({
      where: { userId },
    });
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
