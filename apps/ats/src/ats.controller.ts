import { Controller, Get, Post, UseFilters } from '@nestjs/common';
import { AtsService } from './ats.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { atsServicePattern } from '@app/services_communications/ats-service';
import { RpcExceptionsFilter } from '@app/shared/filters/RPCFilter.filter';
import { ProfileAndJobDto } from '@app/services_communications/ats-service/dtos/profile-and-job.dto';

@Controller()
@UseFilters(RpcExceptionsFilter)
export class AtsController {
  constructor(private readonly atsService: AtsService) {}

  @Get()
  getHello(): string {
    return this.atsService.getHello();
  }

  @EventPattern({ cmd: atsServicePattern.match })
  match() {
    this.atsService.match();
  }

  @MessagePattern({ cmd: atsServicePattern.matchProfileAndJob })
  matchProfileAndJob(@Payload() profileAndJobDto: ProfileAndJobDto): Promise<object> {
    return this.atsService.matchProfileAndJob(profileAndJobDto);
  }
}
