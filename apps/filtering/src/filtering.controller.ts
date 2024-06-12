import { Controller, Get } from '@nestjs/common';
import { FilteringService } from './filtering.service';

@Controller()
export class FilteringController {
  constructor(private readonly filteringService: FilteringService) {}

  @Get()
  getHello(): string {
    return this.filteringService.getHello();
  }
}
