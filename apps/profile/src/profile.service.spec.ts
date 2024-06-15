import { Test, TestingModule } from '@nestjs/testing';
import {
  Certificate,
  Education,
  Experience,
  Profile,
  Project,
  ServiceName,
  SharedModule,
  Token,
} from '@app/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { RedisDBName } from '@app/shared/config/redis.config';
import { of } from 'rxjs';
import { CreateProfileDto } from '@app/services_communications';
import { v4 as uuidv4 } from 'uuid';
import e from 'express';

describe('ProfileService', () => {
  let profileService: ProfileService;
  let mockAutofillService: any;

  const profileTemp: CreateProfileDto = {
    userId: uuidv4(),
    jobTitle: "Software Engineer",
    skills: [
      "JavaScript",
      "Node.js"
    ],
    yearsOfExperience: 3,
    graduatedFromCS: true,
    languages: [
      "English",
      "Spanish"
    ],
    summary: "Experienced software engineer with expertise in web development.",
    cv: "https://example.com/cv.pdf",
    linkedIn: "https://linkedin.com/your-profile",
    gitHub: "https://github.com/your-profile",
    experiences: [
      {
        jobTitle: "Senior Software Engineer",
        companyName: "Example Company",
        startDate: new Date( "2022-01-01"),
        endDate: new Date("2023-12-31"),
        description: "Developed web applications using Angular and Node.js."
      },
      {
        jobTitle: "Software Engineer",
        companyName: "Example Company",
        startDate: new Date( "2022-01-01"),
        endDate: new Date("2023-12-31"),
        description: "Developed web applications using React and Node.js."
      }
    ],
    educations: [
      {
        degree: "Bachelor of Science in Computer Science",
        schoolName: "University of Example",
        startDate: new Date("2018-09-01"),
        endDate: new Date("2022-06-30"),
        description: "Studied various computer science topics including algorithms and databases."
      },
      {
        degree: "Master of Science in Software Engineering",
        schoolName: "University of Example",
        startDate: new Date("2022-09-01"),
        endDate: new Date("2024-06-30"),
        description: "Studied advanced software engineering topics."
      }
    ],
    projects: [
      {
        name: "Online Shopping Platform",
        description: "Developed an e-commerce platform using React and Node.js.",
        skills: [
          "React",
          "Node.js"
        ],
        size: 5
      },
      {
        name: "Social Media App",
        description: "Developed a social media application using Angular and NestJS.",
        skills: [
          "Angular",
          "NestJS"
        ],
        size: 3
      }
    ],
    certificates: [
      {
        title: "Certificate in Web Development",
        authority: "Example Authority",
        issuedAt: new Date("2021-01-01"),
        validUntil: new Date("2021-12-31"),
        url: "https://example.com/certificate.pdf"
      },
      {
        title: "Certificate in Software Engineering",
        authority: "Example Authority",
        issuedAt: new Date("2022-01-01"),
        validUntil: new Date("2022-12-31"),
        url: "https://example.com/certificate.pdf"
      }
    ]
  }


  beforeEach(async () => {
    mockAutofillService = {
      send: jest.fn().mockImplementation(() => of({})),
      emit: jest.fn(),
      connect: jest.fn(() => Promise.resolve()),
      close: jest.fn(() => Promise.resolve()),
      subscribe: jest.fn(() => Promise.resolve()),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SharedModule.registerPostgres(
          ServiceName.PROFILE_SERVICE,
          [Profile, Certificate, Project, Education, Experience],
          true,
        ),
        TypeOrmModule.forFeature([
          Certificate,
          Profile,
          Project,
          Education,
          Experience,
        ]),
      ],
      providers: [
        ProfileService,
        {
          provide: ServiceName.AUTOFILL_SERVICE,
          useValue: mockAutofillService,
        },
      ],
    }).compile();

    profileService = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(profileService).toBeDefined();
  });

  it('should create a profile', async () => {
    const profile = await profileService.create(profileTemp);
    expect(profile).toBeDefined();
  });

  it("should call the autofill service", async () => {
    await profileService.create(profileTemp);
    expect(mockAutofillService.send).toHaveBeenCalled();
  });

  it("should update a profile", async () => {
    const profile = await profileService.create(profileTemp);
    const updatedProfile = await profileService.update({
      userId: profile.userId,
      profileId: profile.id,
      jobTitle: "waer",
      skills: ["wae"],
    });
    expect(updatedProfile).toBeDefined();
    expect(updatedProfile.jobTitle).toBe("waer");
    expect(updatedProfile.skills).toEqual(["wae"]);
  });

  it("should throw an error when updating a non-existing profile", async () => {
    try {
      await profileService.update({
        userId: uuidv4(),
        profileId: uuidv4(),
        jobTitle: "waer",
        skills: ["wae"],
      });
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }
  });

  it("should throw an error when updating a profile with not the same userId", async () => {
    const profile = await profileService.create(profileTemp);
    try {
      await profileService.update({
        userId: uuidv4(),
        profileId: profile.id,
        jobTitle: "waer",
        skills: ["wae"],
      });
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }
  })

  it("should delete a profile", async () => {
    const profile = await profileService.create(profileTemp);
    const result = await profileService.delete({
      userId: profile.userId,
      profileId: profile.id,
    });
    expect(result).toBe("Profile Deleted Successfully");
  });

  it("should throw an error when deleting a non-existing profile", async () => {
    try {
      await profileService.delete({
        userId: uuidv4(),
        profileId: uuidv4(),
      });
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }
  });

  it("should throw an error when deleting a profile with not the same userId", async () => {
    const profile = await profileService.create(profileTemp);
    try {
      await profileService.delete({
        userId: uuidv4(),
        profileId: profile.id,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }
  });


  it("should get a profile", async () => {
    const profile = await profileService.create(profileTemp);
    const result = await profileService.findOneProfile({
      where: { id: profile.id },
    });
    expect(result).toBeDefined();
    expect(result.id).toBe(profile.id);
  })

  it("should throw an error when getting a non-existing profile", async () => {
    try {
      await profileService.findOneProfile({
        where: { id: uuidv4() },
      });
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }
  });

  it("should get all profiles", async () => {
    const profile = await profileService.create(profileTemp);
    const result = await profileService.findProfiles({});
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it("should throw an error when getting all profiles with no profiles", async () => {
    try {
      await profileService.findProfiles({});
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }
  });

  it("should get a user profile card", async () => {
    const profile = await profileService.create(profileTemp);
    await profileService.create(profileTemp);
    await profileService.create(profileTemp);
    await profileService.create(profileTemp);
    const result = await profileService.getUserProfileCard(profile.userId);
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].id).not.toBe(profile.id);
      expect(result[i].jobTitle).toBe(profile.jobTitle);
      expect(result[i].skills).toEqual(profile.skills);
      expect(result[i].linkedIn).toBe(profile.linkedIn);
    }
  });

  it("should get profile by id", async () => {
    const profile = await profileService.create(profileTemp);
    const result = await profileService.getProfileById(profile.id);
    expect(result).toBeDefined();
    expect(result.id).toBe(profile.id);
  });

  it("should throw an error when getting a profile by non-existing id", async () => {
    try {
      await profileService.getProfileById(uuidv4());
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }
  });

  it("should get user profiles", async () => {
    const profile = await profileService.create(profileTemp);
    await profileService.create(profileTemp);
    await profileService.create(profileTemp);
    const result = await profileService.getUserProfiles(profile.userId);
    expect(result).toBeDefined();
    expect(result.length).toBe(3);
  });


});
