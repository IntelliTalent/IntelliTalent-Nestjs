import {
  CreateUserDto,
  LoginDto,
  userServicePatterns,
} from '@app/services_communications';
import {
  AUTH_HEADER,
  ChangeForgottenPasswordDto,
  authServicePattern,
} from '@app/services_communications/authService';
import {
  CurrentUser,
  JWTForgetPasswordGuard,
  Roles,
  ServiceName,
  User,
  UserType,
} from '@app/shared';
import { JwtAuthGuard } from '@app/shared/guards/jwt-auth.guard';
import { LocalAuthGuard } from '@app/shared/guards/local-auth.guard';
import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '@app/shared/decorators/ispublic-decorator.decorator';
import { ForgetPasswordDto } from '@app/services_communications/authService/dtos/forget-password.dto';
import { ResetPasswordDto } from '@app/services_communications/userService/dtos/reset-password.dto';
import { JWTVerificationGuard } from '@app/shared/guards/verify-account.guard';
import { firstValueFrom } from 'rxjs';

@ApiTags('Auth')
@Controller('auth')
export class ApiAuthController {
  constructor(
    @Inject(ServiceName.AUTH_SERVICE) private authService: ClientProxy,
    @Inject(ServiceName.USER_SERVICE) private userService: ClientProxy,
  ) {}

  /**
   * This method registers a new user.
   *
   * @param createUserDto - An object that holds the data for the new user. It is an instance of the CreateUserDto class.
   *
   * The register method does the following:
   * - Uses the authService to send a 'register' command with the CreateUserDto as payload to the microservice.
   *
   * @returns An Observable of the newly registered user.
   */
  @ApiOperation({ description: 'Register a new user' })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    type: User,
  })
  @Public()
  @Post('register')
  async register(@Body() createUserdto: CreateUserDto) {
    return this.authService.send(
      {
        cmd: authServicePattern.register,
      },
      createUserdto,
    );
  }

  @Post('verify-email')
  @ApiCreatedResponse({ description: 'Email verified successfully' })
  @ApiOperation({ description: 'Verify the email of the user' })
  @Public()
  @ApiBearerAuth(AUTH_HEADER)
  @UseGuards(JWTVerificationGuard)
  async verifyEmail(@CurrentUser() user: User) {
    return this.authService.send(
      {
        cmd: authServicePattern.signUser,
      },
      user,
    );
  }

  /**
   * This method used for login and return the jwt token for the user.
   *
   * @param loginDto - An object that holds the data for the existing user. It is an instance of the LoginDto class.
   *
   * The login method does the following:
   * - Uses the authService to send a 'login' command with the LoginDto as payload to the microservice.
   *
   * @returns An Observable of the logged in user.
   */
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ description: 'Login user to his account' })
  @ApiCreatedResponse({
    description: 'Autherized Successfully',
    type: User,
  })
  @ApiUnauthorizedResponse({ description: 'Wrong email or password' })
  @Post('login')
  @Public()
  async login(@Body() loginCred: LoginDto, @CurrentUser() user: User) {
    return this.authService.send(
      {
        cmd: authServicePattern.signUser,
      },
      user,
    );
  }

  @ApiOperation({ description: 'Logout user from his account' })
  @ApiCreatedResponse({ description: 'Logout Successfully' })
  @Post('logout')
  async logout(
    @Res({
      passthrough: true,
    })
    res: Response,
  ) {
    // return this.authService.logout(res);
    res.clearCookie('jwt');
  }

  @ApiOperation({ description: 'Recover the password of an account' })
  @ApiCreatedResponse({
    description: 'An email will be sent if the user exists in the database',
  })
  @Public()
  @Post('forget-password')
  async forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return this.authService.send(
      { cmd: authServicePattern.forgetPassword },
      forgetPasswordDto,
    );
  }

  @ApiProperty({ description: 'after sending token to the user in email' })
  @ApiCreatedResponse({ description: 'password changed successfully' })
  @ApiUnauthorizedResponse({ description: 'wrong token' })
  @ApiBearerAuth(AUTH_HEADER)
  @Public()
  @Post('change-forgotten-password')
  @UseGuards(JWTForgetPasswordGuard)
  async changeForgottenPassword(
    @Body() dto: ChangeForgottenPasswordDto,
    // here i use any because i injectthe uuid of the token inside the user
    @CurrentUser() user: any,
  ) {
    await firstValueFrom(
      this.authService.send(
        {
          cmd: authServicePattern.resetPassword,
        },
        user.uuid,
      ),
    );
    const payload: ResetPasswordDto = {
      id: user.id,
      password: dto.password,
    };
    return this.userService.send(
      {
        cmd: userServicePatterns.resetPassword,
      },
      payload,
    );
  }

  @Get('me')
  @ApiResponse({
    type: User,
  })
  @ApiBearerAuth(AUTH_HEADER)
  async me(@CurrentUser() user: User) {
    return user;
  }
}
