import { Controller, Get, Post, UseFilters } from '@nestjs/common';
import { AtsService } from './ats.service';
import { EventPattern } from '@nestjs/microservices';
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

  @EventPattern({ cmd: atsServicePattern.match })
  match(): object {
    return this.atsService.match();
  }
}
