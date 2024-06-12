import { Injectable } from '@nestjs/common';

@Injectable()
export class AutofillService {
  getHello(): string {
    return 'Hello World!';
  }
}
