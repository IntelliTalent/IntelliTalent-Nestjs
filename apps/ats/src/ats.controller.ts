import { Controller, Get, Post, UseFilters } from '@nestjs/common';
import { AtsService } from './ats.service';
import { MessagePattern } from '@nestjs/microservices';
import { atsServicePattern } from '@app/services_communications/ats-service';
import { RpcExceptionsFilter } from '@app/shared/filters/RPCFilter.filter';

@Controller()
@UseFilters(RpcExceptionsFilter)
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
