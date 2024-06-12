import { Injectable } from '@nestjs/common';

@Injectable()
export class FilteringService {
  getHello(): string {
    return 'Hello World!';
  }
}
