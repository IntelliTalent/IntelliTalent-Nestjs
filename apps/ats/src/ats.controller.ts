import { Controller, Get } from '@nestjs/common';
import { AtsService } from './ats.service';

@Controller()
export class AtsController {
  constructor(private readonly atsService: AtsService) {}

  @Get()
  getHello(): string {
    return this.atsService.getHello();
  }
}
