import { Module } from '@nestjs/common';
import { AutofillController } from './autofill.controller';
import { AutofillService } from './autofill.service';

@Module({
  imports: [],
  controllers: [AutofillController],
  providers: [AutofillService],
})
export class AutofillModule {}
