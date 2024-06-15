import { Test, TestingModule } from '@nestjs/testing';
import { Constants, ServiceName, SharedModule, Token, User, UserType } from '@app/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AllowedUserTypes,
  CreateUserDto,
  GeneralTokenData,
} from '@app/services_communications';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import getConfigVariables from '@app/shared/config/configVariables.config';
import { TokenService } from './token.service';

describe('AuthService', () => {
  let authService: AuthService;
  let mockNotifierService: any;
  let mockUserService: any;
  let mockTokenService: any;

  const user: User = {
    id: "123456",
    email: 'waer@waer.com',
    type: UserType.jobSeeker,
    address: 'giza tawabik',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    country: '',
    city: '',
    dateOfBirth: undefined,
    photo: '',
    isVerified: true,
    createdAt: undefined,
    updatedAt: undefined,
    deletedAt: undefined
  };


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

    mockUserService = {
      send: jest.fn().mockImplementation(() => of({})),
      emit: jest.fn(),
      connect: jest.fn(() => Promise.resolve()),
      close: jest.fn(() => Promise.resolve()),
      subscribe: jest.fn(() => Promise.resolve()),
    };

    mockTokenService = {
      createToken: jest.fn(),
      useToken: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SharedModule.registerPostgres(
          ServiceName.TESTING_DATABASE,
          [Token],
          true,
        ),
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
          useFactory: async () => {
            const jwtSecret = getConfigVariables(Constants.JWT.secret);
            const jwtExpiresIn = getConfigVariables(Constants.JWT.expiresIn);
            return {
              secret: jwtSecret,
              signOptions: {
                expiresIn: jwtExpiresIn,
              },
            };
          },
        }),
      ],
      providers: [
        AuthService,
        TokenService,
        {
          provide: ServiceName.NOTIFIER_SERVICE,
          useValue: mockNotifierService,
        },
        {
          provide: ServiceName.USER_SERVICE,
          useValue: mockUserService,
        },
        {
          provide: TokenService,
          useValue: mockTokenService
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should return "Hello World From Auth Service!"', () => {
    expect(authService.getHello()).toBe('Hello World From Auth Service!');
  });

  it('should sign token', async () => {
    const jwtSecret = await getConfigVariables(Constants.JWT.secret);
    const generalTokenData: GeneralTokenData = {
      payload: {
        email: 'waer@waer.com',
      },
      expiresIn: 3600,
      secret: jwtSecret,
    };

    const token = await authService.signToken(generalTokenData);
    expect(token).toBeDefined();
    expect(token.token).toBeDefined();
    expect(token.uuid).toBeDefined();
  });

  it('should decode token', async () => {
    const jwtSecret = await getConfigVariables(Constants.JWT.secret);
    const generalTokenData: GeneralTokenData = {
      payload: {
        email: 'waer@waer.com',
      },
      expiresIn: 3600,
      secret: jwtSecret,
    };

    const token = await authService.signToken(generalTokenData);

    const decoded = await authService.decodeToken(token.token);
    expect(decoded).toBeDefined();
    expect(decoded.email).toBe('waer@waer.com');
    expect(decoded.exp).toBeDefined();
  });


  it('should sign User', async () => {
    const user: User = {
      id: "123456",
      email: 'waer@waer.com',
      type: UserType.jobSeeker,
      address: 'giza tawabik',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      country: '',
      city: '',
      dateOfBirth: undefined,
      photo: '',
      isVerified: true,
      createdAt: undefined,
      updatedAt: undefined,
      deletedAt: undefined
    };

    const token = await authService.sign(user);
    expect(token).toBeDefined();
    expect(token.token).toBeDefined();
    expect(token.uuid).toBeDefined();
  })


  it('should register User', async () => {

    mockUserService.send.mockImplementation(() => of(user));

    const returnMessage = await authService.register(tempCreateUser);
    expect(mockUserService.send).toHaveBeenCalled();
    expect(mockNotifierService.emit).toHaveBeenCalled();
    expect(returnMessage).toBeDefined();
    expect(returnMessage).toHaveProperty('message');
  });

  it("should forget password", async () => {
    mockUserService.send.mockImplementation(() => of(user));
    const returnMessage = await authService.forgetPassword(user.email);
    expect(mockUserService.send).toHaveBeenCalled();
    expect(mockNotifierService.emit).toHaveBeenCalled();
    expect(returnMessage).toBeDefined();
    expect(returnMessage).toHaveProperty('message');
    expect(mockTokenService.createToken).toHaveBeenCalled();
  });

  it("should reset password", async () => {
    mockTokenService.useToken.mockImplementation(() => of({ message: 'Token used successfully' }));
    const returnMessage = await authService.resetPassword('123456');
    expect(mockTokenService.useToken).toHaveBeenCalled();
    expect(returnMessage).toBeDefined();
    expect(returnMessage).toHaveProperty('message');
  });


  it("should verify email", async () => {
    mockTokenService.useToken.mockImplementation(() => of({ message: 'Token used successfully' }));
    mockUserService.send.mockImplementation(() => of(user));
    const returnMessage = await authService.verifyEmail({ email: user.email, id: user.id, uuid: 'skjdk-sdsd' } );
    expect(mockTokenService.useToken).toHaveBeenCalled();
    expect(mockUserService.send).toHaveBeenCalled();
    expect(returnMessage).toBeDefined();
    expect(returnMessage).toHaveProperty('token');
    expect(returnMessage).toHaveProperty('user');
  });

  it("should user token", async () => {
    const token = await authService.userToken(user);
    expect(token).toBeDefined();
    expect(token).toHaveProperty('token');
    expect(token).toHaveProperty('user');
  });

});
