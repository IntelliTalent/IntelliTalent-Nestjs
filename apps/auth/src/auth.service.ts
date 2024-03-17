import {
  CreateUserDto,
  ForgetPasswordToken,
  GeneralTokenData,
  TokenPayload,
  generatedToken,
  userServicePatterns,
} from '@app/services_communications';
import { Constants, ServiceName, User } from '@app/shared';
import getConfigVariables from '@app/shared/config/configVariables.config';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(ServiceName.USER_SERVICE)
    private readonly userService: ClientProxy,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
  ) {}

  getHello(): string {
    return 'Hello World From Auth Service!';
  }

  /**
   * sign invitation token
   * @param dto see InviteUserDto
   */
  async signToken(data: GeneralTokenData): Promise<generatedToken> {
    const uuid = uuidv4();
    data.payload.uuid = uuid;
    const token = await this.jwtService.signAsync(data.payload, {
      secret: data.secret,
      expiresIn: data.expiresIn,
    });
    return { token, uuid: uuid };
  }

  async decodeToken(token: string): Promise<any> {
    const decoded = await this.jwtService.decode(token, {});
    return decoded;
  }

  async sign(user: User) {
    const payload: TokenPayload = {
      email: user.email,
      id: user.id,
      type: user.type,
    };

    const jwtSecret = await getConfigVariables(Constants.JWT.secret);
    const loginExpiration = await getConfigVariables(Constants.JWT.expiresIn);

    return this.signToken({
      payload: payload,
      secret: jwtSecret,
      expiresIn: loginExpiration,
    });
  }

  async register(newUser: CreateUserDto) {
    try {
      const user: User = await firstValueFrom(
        this.userService.send({ cmd: userServicePatterns.createUser }, newUser),
      );

      const payload: TokenPayload = {
        email: user.email,
        id: user.id,
        type: user.type,
      };

      const jwtSecret = await getConfigVariables(
        Constants.JWT.verifyEmailSecret,
      );
      const loginExpiration = await getConfigVariables(
        Constants.JWT.verifyEmailExpiresIn,
      );

      // TODO: send mail to user with token

      const { uuid, token } = await this.signToken({
        payload: payload,
        secret: jwtSecret,
        expiresIn: loginExpiration,
      });

      await this.tokenService.createToken(uuid);

      return {
        token,
        message: `welcome to InteliTalent, ${user.firstName} ${user.lastName}! Please verify your email to continue. A verification link has been sent to ${user.email}`,
      };
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async forgetPassword(email: string) {
    try {
      const user = await firstValueFrom(
        this.userService.send(
          { cmd: userServicePatterns.findUserByEmail },
          email,
        ),
      );

      const payload: TokenPayload = {
        email: user.email,
        id: user.id,
        type: user.type,
      };

      const jwtSecret = await getConfigVariables(
        Constants.JWT.forgetPasswordSecret,
      );
      const loginExpiration = await getConfigVariables(
        Constants.JWT.forgetPasswordExpiresIn,
      );

      // TODO: send mail to user with token

      const { uuid, token } = await this.signToken({
        payload: payload,
        secret: jwtSecret,
        expiresIn: loginExpiration,
      });

      await this.tokenService.createToken(uuid);

      return { token, uuid };
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async resetPassword(
    uuid: string,
  ): Promise<{ message: string }> {
    try {
      await this.tokenService.useToken(uuid);
      return {
        message: 'Password reset successfully',
      };
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async userToken(user: User) {
    const { token } = await this.sign(user);

    const response = {
      token,
      user,
    };

    return response;
  }

  async verifyEmail(
    verifyEmail: ForgetPasswordToken,
  ): Promise<{ token: string; user: User }> {
    try {
      const { uuid } = verifyEmail;
      await this.tokenService.useToken(uuid);

      const user: User = await firstValueFrom(
        this.userService.send(
          {
            cmd: userServicePatterns.verifyUser,
          },
          verifyEmail.id,
        ),
      );

      return this.userToken(user);
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
