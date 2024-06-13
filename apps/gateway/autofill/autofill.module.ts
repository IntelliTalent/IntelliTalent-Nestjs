import { Module } from '@nestjs/common';
import { ServiceName, SharedModule } from '@app/shared';
import { ApiAutofillController } from './autofill.controller';

@Module({
  // assign the RabbitMQ queues (CoverLetterGenerator) to the CoverLetterGeneratorController
  imports: [
    SharedModule.registerRmq(ServiceName.AUTOFILL_SERVICE),
  ],
  controllers: [ApiAutofillController],
  providers: [],
})
export class ApiAutofillModule {}
