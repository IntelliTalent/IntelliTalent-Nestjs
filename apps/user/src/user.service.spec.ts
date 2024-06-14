import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import {
  ServiceName,
  SharedModule,
  TypeOrmSQLITETestingModule,
  User,
  UserType,
} from '@app/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllowedUserTypes, CreateUserDto } from '@app/services_communications';
import { getConnection } from 'typeorm';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { subscribe } from 'diagnostics_channel';
import { of } from 'rxjs';

describe('UserService', () => {
  let service: UserService;
  let mockNotifierService: any;
  let mockAutofillService: any;

  const tempCreateUser: CreateUserDto = {
    email: 'waer@waer.com',
    password: 'Password123+',
    firstName: 'waer',
    lastName: 'alwaer',
    phoneNumber: '01557752400',
    country: 'Egypt',
    city: 'Cairo',
    address: 'giza tawabik',
    dateOfBirth: new Date('1998-12-12'),
    photo: 'https://avatars.githubusercontent.com/u/70758177?v=4',
    type: AllowedUserTypes.jobSeeker,
  };

  beforeEach(async () => {
    mockNotifierService = {
      send: jest.fn().mockImplementation(() => of({})),
      emit: jest.fn(),
      connect: jest.fn(() => Promise.resolve()),
      close: jest.fn(() => Promise.resolve()),
      subscribe: jest.fn(() => Promise.resolve()),
    };

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
          ServiceName.TESTING_DATABASE,
          [User],
          true,
        ),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [
        UserService,
        {
          provide: ServiceName.NOTIFIER_SERVICE,
          useValue: mockNotifierService,
        },
        {
          provide: ServiceName.AUTOFILL_SERVICE,
          useValue: mockAutofillService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return true if user exists', async () => {
    const user = await service.createUser(tempCreateUser);
    const exists = await service.doesUserExist({
      email: user.email
    });
    expect(exists).toBe(true);
  });

  it('should return false if user does not exist', async () => {
    const exists = await service.doesUserExist({
      email: "weera"
    });
    expect(exists).toBe(false);
  })

  it('should create a user', async () => {
    const user = await service.createUser(tempCreateUser);
    expect(user).toBeDefined();
    expect(user).toHaveProperty('id');
  });

  it('should create a job seeker user', async () => {
    const user = await service.createUser(tempCreateUser);
    expect(user.type).toBe(UserType.jobSeeker);
  })

  it('should create a recruiter user', async () => {
    const user = await service.createUser({ ...tempCreateUser, type: AllowedUserTypes.recruiter });
    expect(user.type).toBe(UserType.recruiter);
  })

  it('should throw an error if user already exists', async () => {
    await service.createUser(tempCreateUser);

    try {
      await service.createUser(tempCreateUser);
    }
    catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
    }

  })

  it('should hash the password', async () => {
    const passwordBeforeHash = tempCreateUser.password;
    const user = await service.createUser(tempCreateUser);
    expect(passwordBeforeHash).not.toBe(user);
  })

  it('should init form fields', async () => {
    const user = await service.createUser(tempCreateUser);
    await service.initFormFields(user, true);
    expect(mockAutofillService.send).toHaveBeenCalled();
  });

  it("SHOULD find a user by email", async () => {
    const user = await service.createUser(tempCreateUser);
    const foundUser = await service.findUser({
      where: {
        email: user.email
      }
    });
    expect(foundUser).toBeDefined();
    expect(foundUser).toHaveProperty('id');
    expect(foundUser.email).toBe(user.email);
  })

  it("SHOULD find a user by id", async () => {
    const user = await service.createUser(tempCreateUser);
    const foundUser = await service.findUser({
      where: {
        id: user.id
      }
    });
    expect(foundUser).toBeDefined();
    expect(foundUser).toHaveProperty('id');
    expect(foundUser.id).toBe(user.id);
  })

  it("Should throw an error if user does not exist", async () => {
    try {
      await service.findUser({
        where: {
          email: "weera"
        }
      });
    }
    catch (e) {
      expect(e).toBeInstanceOf(NotFoundException);
    }
  })

  it("should find users by there ids", async () => {
    const user1 = await service.createUser(tempCreateUser);
    const user2 = await service.createUser({ ...tempCreateUser, email: "w2@mail.com" });
    const user3 = await service.createUser({ ...tempCreateUser, email: "w3@gas.com" });

    const users = await service.getUsersByIds([user1.id, user2.id, user3.id]);
    expect(users).toHaveLength(3);
    expect(users[0].email).toBe(user1.email);
    expect(users[1].email).toBe(user2.email);
    expect(users[2].email).toBe(user3.email);
  })

  it("should patch user", async () => {
    const user = await service.createUser(tempCreateUser);
    const updatedUser = await service.updateUser({
      id: user.id,
      firstName: "newName"
    })
    expect(updatedUser).toBeDefined();
    expect(updatedUser.firstName).toBe("newName");
  })

  it("should call initFormFields when patching user", async () => {
    const user = await service.createUser(tempCreateUser);
    await service.updateUser({
      id: user.id,
      firstName: "newName"
    })
    expect(mockAutofillService.send).toHaveBeenCalled();
  });

  it("should not update email, password, type", async () => {
    const user = await service.createUser(tempCreateUser);
    const updatedUser = await service.updateUser({
      id: user.id,
      email: "newEmail",
      type: AllowedUserTypes.recruiter
    })
    expect(updatedUser.email).toBe(user.email);
    expect(updatedUser.type).toBe(user.type);
  })

  it("should delete user", async () => {
    const user = await service.createUser(tempCreateUser);
    await service.deleteUser("takenActionId", user.id);
    try {
      await service.findUser({
        where: {
          id: user.id
        }
      });
    }
    catch (e) {
      expect(e).toBeInstanceOf(NotFoundException);
    }
  })

  it("should throw an error if user does not exist", async () => {
    const uuid = "f8b3b3b3-0b3b-4b3b-8b3b-3b3b3b3b3b3b";
    try {
      await service.deleteUser("takenActionId", uuid);
    }
    catch (e) {
      expect(e).toBeInstanceOf(NotFoundException);
    }
  })

  it("should get all users", async () => {
    const user1 = await service.createUser(tempCreateUser);
    const user2 = await service.createUser({ ...tempCreateUser, email: "w@w.com"});
    const users = await service.getAllUsers();
    expect(users).toHaveLength(2);
    expect(users[0].email).toBe(user1.email);
    expect(users[1].email).toBe(user2.email);
  });

  it("should validate user", async () => {
    const userPassword = tempCreateUser.password;
    const user = await service.createUser(tempCreateUser);

    // verify user
    await service.verifyUser(user.id);

    const validatedUser = await service.validateUser(
      user.email,
      userPassword
    );
    expect(validatedUser).toBeDefined();
    expect(validatedUser).toHaveProperty('id');
    expect(validatedUser.email).toBe(user.email);
  })

  it("should throw an error if user does not exist", async () => {
    try {
      await service.validateUser("weera", "password");
    }
    catch (e) {
      expect(e).toBeInstanceOf(UnauthorizedException);
    }
  })

  it("should throw an error if password is invalid", async () => {
    const user = await service.createUser(tempCreateUser);
    try {
      await service.validateUser(user.email, "invalidPassword");
    }
    catch (e) {
      expect(e).toBeInstanceOf(UnauthorizedException);
    }
  });

  it("should throw an error if user is not verified", async () => {
    const userPassword = tempCreateUser.password;
    const user = await service.createUser(tempCreateUser);
    try {
      await service.validateUser(user.email, userPassword);
    }
    catch (e) {
      console.log(e);
      expect(e).toBeInstanceOf(BadRequestException);
    }
  });

  it("should change password using token", async () => {
    const user = await service.createUser(tempCreateUser);
    await service.verifyUser(user.id);
    const newPassword = "newPassword";
    const message = await service.changePasswordUsingToken(
      user.id,
      newPassword
    );
    expect(message).toBeDefined();
    expect(message.message).toBe("Password changed successfully");

    // validate new password
    const validatedUser = await service.validateUser(
      user.email,
      newPassword
    );
  });

  it("should change password", async () => {
    const userPassword = tempCreateUser.password;
    const user = await service.createUser(tempCreateUser);
    await service.verifyUser(user.id);
    const newPassword = "newPassword";
    const message = await service.changePassword({
      userId: user.id,
      currentPassword: userPassword,
      confirmPassword: newPassword,
      newPassword: newPassword
    });
    expect(message).toBeDefined();
    expect(message.message).toBe("Password changed successfully");

    // validate new password
    const validatedUser = await service.validateUser(
      user.email,
      newPassword
    );

    expect(validatedUser).toBeDefined();
    expect(validatedUser).toHaveProperty('id');
    expect(validatedUser.email).toBe(user.email);
  });

  it("should throw an error if current password is invalid", async () => {
    const user = await service.createUser(tempCreateUser);
    await service.verifyUser(user.id);
    try {
      await service.changePassword({
        userId: user.id,
        currentPassword: "invalidPassword",
        confirmPassword: "newPassword",
        newPassword: "newPassword"
      });
    }
    catch (e) {
      expect(e).toBeInstanceOf(UnauthorizedException);
    }
  });

  it('should throw an error if user does not exist', async () => {
    try {
      await service.changePassword({
        userId: 'f8b3b3b3-0b3b-4b3b-8b3b-3b3b3b3b3b3b',
        currentPassword: 'password',
        confirmPassword: 'newPassword',
        newPassword: 'newPassword',
      });
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundException);
    }
  });

  it('should verify user', async () => {
    const userPassword = tempCreateUser.password;
    const user = await service.createUser(tempCreateUser);
    await service.verifyUser(user.id);
    await service.validateUser(user.email, userPassword);
  });

  it('should throw an error if user does not exist', async () => {
    try {
      await service.verifyUser('f8b3b3b3-0b3b-4b3b-8b3b-3b3b3b3b3b3b');
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundException);
    }
  });

  it('should init form fields', async () => {
    const user = await service.createUser(tempCreateUser);
    await service.initFormFields(user, true);
    expect(mockAutofillService.send).toHaveBeenCalled();
  });

  it('should get all job seekers', async () => {
    for (let i = 0; i < 12; i++) {
      const user = await service.createUser({
        ...tempCreateUser,
        email: `w${i}@gmail.com`,
        type: AllowedUserTypes.jobSeeker,
      });
      await service.verifyUser(user.id)
    }

    const users = await service.getAllJobSeekers({
      page: 1,
      take: 10,
    });

    expect(users).toHaveLength(10);
  });




});
