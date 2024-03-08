import { Module } from '@nestjs/common';
import { AtsController } from './ats.controller';
import { AtsService } from './ats.service';
import { ServiceName, SharedModule } from '@app/shared';

@Module({
  imports: [SharedModule.registerRmq(ServiceName.ATS_SERVICE)],
  controllers: [AtsController],
  providers: [AtsService],
})
export class AtsModule {}
