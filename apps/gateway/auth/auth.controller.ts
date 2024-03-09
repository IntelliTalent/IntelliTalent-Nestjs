import { CreateUserDto, LoginDto } from '@app/services_communications';
import {
  AUTH_HEADER,
  ChangeForgottenPasswordDto,
  authServicePattern,
} from '@app/services_communications/authService';
import { CurrentUser, ServiceName, User } from '@app/shared';
import { JwtAuthGuard } from '@app/shared/guards/jwt-auth.guard';
import { LocalAuthGuard } from '@app/shared/guards/local-auth.guard';
import {
  Body,
  Controller,
  Get,
  Inject,
  NotImplementedException,
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
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ReturnedUserDto } from '@app/services_communications/authService/dtos/user.dto';
import { Public } from '@app/shared/decorators/ispublic-decorator.decorator';
import { ForgetPasswordDto } from '@app/services_communications/authService/dtos/forget-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class ApiAuthController {
  constructor(
    @Inject(ServiceName.AUTH_SERVICE) private authService: ClientProxy,
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
  @Post('register')
  async register(@Body() createUserdto: CreateUserDto) {
    return this.authService.send(
      {
        cmd: authServicePattern.register,
      },
      createUserdto,
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
    type: ReturnedUserDto,
  })
  @ApiUnauthorizedResponse({ description: 'Wrong email or password' })
  @Post('login')
  async login(@CurrentUser() user: any) {
    console.log('userggg', user);
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
  async forgetPassword(@Body() dto: ForgetPasswordDto) {
    throw new NotImplementedException();
    // return this.authService.forgetPassword(dto);
  }

  @ApiProperty({ description: 'after sending token to the user in email' })
  @ApiCreatedResponse({ description: 'password changed successfully' })
  @ApiUnauthorizedResponse({ description: 'wrong token' })
  @ApiBearerAuth(AUTH_HEADER)
  @Public()
  // @UseGuards(JWTForgetPasswordGuard)
  @Post('change-forgotten-password')
  async changeForgottenPassword(
    @Body() dto: ChangeForgottenPasswordDto,
    @CurrentUser() user: User,
  ) {
    throw new NotImplementedException();
    // return this.authService.changePasswordUsingToken(
    //   user.user_id,
    //   dto.password,
    // );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: User) {
    return user;
  }
}
