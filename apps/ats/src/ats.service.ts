import { Injectable } from '@nestjs/common';

@Injectable()
export class AtsService {
  getHello(): string {
    return 'Hello World!';
  }
}
