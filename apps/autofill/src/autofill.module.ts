import { Module } from '@nestjs/common';
import { AutofillController } from './autofill.controller';
import { AutofillService } from './autofill.service';
import { FormField, FormFieldSchema, SharedModule } from '@app/shared';
import { MongoDBName } from '@app/shared/config/mongodb.config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    SharedModule.registerMongoDB(MongoDBName.FormFieldsDB),
    MongooseModule.forFeature([
      { name: FormField.name, schema: FormFieldSchema },
    ]),
  ],
  controllers: [AutofillController],
  providers: [AutofillService],
})
export class AutofillModule {}
