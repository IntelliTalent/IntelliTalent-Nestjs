import { CreateUserDto, LoginDto } from '@app/services_communications';
import { authServicePattern } from '@app/services_communications/authService';
import { CurrentUser, ServiceName, User } from '@app/shared';
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
import { ApiTags } from '@nestjs/swagger';

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

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: User) {
    return user;
  }
}
