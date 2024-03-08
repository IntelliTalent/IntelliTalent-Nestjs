import { Controller, Get, Post } from '@nestjs/common';
import { AtsService } from './ats.service';
import { MessagePattern } from '@nestjs/microservices';
import { atsServicePattern } from '@app/services_communications/ats-service';

@Controller()
export class AtsController {
  constructor(private readonly atsService: AtsService) {}

  @Get()
  getHello(): string {
    return this.atsService.getHello();
  }

  @MessagePattern({ cmd: atsServicePattern.match })
  match(): object {
    return this.atsService.match();
  }
}
