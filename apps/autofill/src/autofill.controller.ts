import { Controller, Get } from '@nestjs/common';
import { AutofillService } from './autofill.service';

@Controller()
export class AutofillController {
  constructor(private readonly autofillService: AutofillService) {}

  @Get()
  getHello(): string {
    return this.autofillService.getHello();
  }
}
