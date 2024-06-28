
import { Controller, Get, Inject, Module, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { SeederEvent, ServiceName, User } from '@app/shared';
import { ModuleRef } from '@nestjs/core';
import { firstValueFrom } from 'rxjs';

@ApiTags('Gateway')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(ServiceName.USER_SERVICE) private userService: ClientProxy,
  ) {
    this.seeder();
  }

  @Get('global-health-check')
  getHello() {
    return this.appService.gethealthCheck();
  }

  @ApiOperation({
    description: 'run the seeds',
  })
  @Post('seeder')
  async seeder() {
    console.log('seeder callesdsdsdd');


    const usersCount = 5;
    // create x users

    let users: User[] = await firstValueFrom(
      this.userService.send({ cmd: SeederEvent }, usersCount),
    );

    // create x profile for each user



  }
}
