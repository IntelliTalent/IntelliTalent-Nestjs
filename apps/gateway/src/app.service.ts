import { ServiceName } from '@app/shared/config/environment.constants';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    @Inject(ServiceName.AUTH_SERVICE) private readonly authService: ClientProxy,
    @Inject(ServiceName.USER_SERVICE) private readonly userService: ClientProxy,
    @Inject(ServiceName.COVER_LETTER_GENERATOR_SERVICE)
    private readonly coverLetterService: ClientProxy,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async gethealthCheck() {
    const pattern = { cmd: 'healthCheck' };
    const authHealth = await firstValueFrom(
      this.authService.send(pattern, {})
      );
    const userHealth = await firstValueFrom(this.userService.send(pattern, {}));
    const coverletterHealth = await firstValueFrom(
      this.coverLetterService.send(pattern, {}),
    );
    return {
      authHealth,
      userHealth,
      coverletterHealth,
    };
  }
}
