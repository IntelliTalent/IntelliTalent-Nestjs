import { Module } from '@nestjs/common';
import { ServiceName, SharedModule } from '@app/shared';
import { ApiInterviewController } from './interview.controller';
@Module({
  imports: [
    SharedModule.registerRmq(ServiceName.INTERVIEW_SERVICE),
  ],
  controllers: [ApiInterviewController],
  providers: [],
})
export class ApiInterviewModule {}
