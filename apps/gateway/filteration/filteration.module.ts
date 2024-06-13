import { Module } from '@nestjs/common';
import { ServiceName, SharedModule } from '@app/shared';
import { ApiFilterationController } from './filteration.controller';
@Module({
  imports: [
    SharedModule.registerRmq(ServiceName.FILTERATION_SERVICE),
  ],
  controllers: [ApiFilterationController],
  providers: [],
})
export class ApiFilterationModule {}
