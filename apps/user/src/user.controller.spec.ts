import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ServiceName, SharedModule, User } from '@app/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { of } from 'rxjs';
import {
  AllowedUserTypes,
  changePasswordDto,
  CreateUserDto,
  UpdateUserDto,
} from '@app/services_communications';
import { ResetPasswordDto } from '@app/services_communications/userService/dtos/reset-password.dto';
import { GetUsersByIdsDto } from '@app/services_communications/userService/dtos/get-users.dto';

describe('UserController', () => {
  let userController: UserController;
  let mockUserService;
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
    mockUserService = {
      getHello: jest.fn(),
      createUser: jest.fn(),
      findUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      getAllUsers: jest.fn(),
      validateUser: jest.fn(),
      changePasswordUsingToken: jest.fn(),
      verifyUser: jest.fn(),
      changePassword: jest.fn(),
      getAllJobSeekers: jest.fn(),
      getUsersByIds: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userController = app.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  it('Should call userService.getHello', async () => {
    mockUserService.getHello.mockResolvedValue(
      'Hello World From User Service!',
    );
    expect(await userController.getHello()).toBe(
      'Hello World From User Service!',
    );
  });

  it('Should call userService.createUser', async () => {
    const createUserDto: CreateUserDto = tempCreateUser;
    userController.createUser(createUserDto);
    expect(mockUserService.createUser).toHaveBeenCalledWith(createUserDto);
  });

  it('Should call userService.findUser', async () => {
    const id = '123';
    userController.findUserById(id);
    expect(mockUserService.findUser).toHaveBeenCalledWith({ where: { id } });
  });

  it('Should call userService.findUser', async () => {
    const email = tempCreateUser.email;
    userController.findUserByEmail(email);
    expect(mockUserService.findUser).toHaveBeenCalledWith({ where: { email } });
  });

  it('Should call userService.updateUser', async () => {
    const updateUser: UpdateUserDto = {
      id: '123',
      firstName: 'waer',
    };
    userController.updateUser(updateUser);
    expect(mockUserService.updateUser).toHaveBeenCalledWith(updateUser);
  });

  it('Should call userService.deleteUser', async () => {
    const TakenActionId = '123';
    const deletedUser = '123';
    userController.deleteUser({ TakenActionId, deletedUserId: deletedUser });
    expect(mockUserService.deleteUser).toHaveBeenCalledWith(
      TakenActionId,
      deletedUser,
    );
  });

  it('Should call userService.getAllUsers', async () => {
    userController.getAllUsers();
    expect(mockUserService.getAllUsers).toHaveBeenCalled();
  });

  it('Should call userService.validateUser', async () => {
    const email = tempCreateUser.email;
    const password = tempCreateUser.password;
    userController.validateUser({ email, password });
    expect(mockUserService.validateUser).toHaveBeenCalledWith(email, password);
  });

  it('Should call userService.changePasswordUsingToken', async () => {
    const payload: ResetPasswordDto = {
      id: '123',
      password: 'Password123+',
    };
    userController.changePasswordWithToken(payload);
    expect(mockUserService.changePasswordUsingToken).toHaveBeenCalledWith(
      payload.id,
      payload.password,
    );
  });

  it('Should call userService.verifyUser', async () => {
    const id = '123';
    userController.verifyUser(id);
    expect(mockUserService.verifyUser).toHaveBeenCalledWith(id);
  });

  it('Should call userService.changePassword', async () => {
    const password = 'Password123+';
    const payload: changePasswordDto = {
      userId: '123',
      confirmPassword: password,
      currentPassword: password,
      newPassword: password,
    }
    userController.changePassword(payload);
    expect(mockUserService.changePassword).toHaveBeenCalledWith(payload);
  });

  it('Should call userService.getAllJobSeekers', async () => {
    const pageOptions = { page: 1, limit: 10 };
    userController.getAllJobSeekers(pageOptions);
    expect(mockUserService.getAllJobSeekers).toHaveBeenCalledWith(pageOptions);
  });

  it('Should call userService.getUsersByIds', async () => {
    const payload : GetUsersByIdsDto = {
      usersIds: ['123', '456']
    }
    userController.getUsersByIds(payload);
    expect(mockUserService.getUsersByIds).toHaveBeenCalledWith(payload.usersIds);
  });


});
