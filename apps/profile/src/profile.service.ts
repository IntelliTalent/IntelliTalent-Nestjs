import {
  CreateProfileDto,
  DeleteProfileDto,
  UpdateProfileDto,
} from '@app/services_communications';
import { FormField, Profile } from '@app/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectModel(FormField.name)
    private readonly formFieldModel: Model<FormField>,
  ) {}

  async create(createProfileDto: CreateProfileDto): Promise<Profile> {
    // Create the new profile
    const profile = this.profileRepository.create({
      ...createProfileDto,
    });

    // Save the new profile
    const savedProfile = await this.profileRepository.save(profile);

    // Update the FormField entry with the new profile data
    await this.formFieldModel.updateOne(
      { userId: createProfileDto.userId },
      {
        cvLink: savedProfile.cv,
        linkedIn: savedProfile.linkedIn,
        github: savedProfile.gitHub,
        skills: savedProfile.skills,
      },
    );

    return savedProfile;
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

    return this.profileRepository.save({
      ...profile,
      ...updateProfileDto,
    });
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
    });
  }
}
