import { Controller, Get } from '@nestjs/common';
import { AutofillService } from './autofill.service';
import { MessagePattern } from '@nestjs/microservices';
import { FormFieldsDto } from '@app/services_communications/autofill/dtos/form-fields.dto';

@Controller()
export class AutofillController {
  constructor(private readonly autofillService: AutofillService) {}

  @Get()
  getHello(): string {
    return this.autofillService.getHello();
  }

  @MessagePattern({ cmd: 'init' })
  init(data: FormFieldsDto) {
    return this.autofillService.init(data);
  }

  @MessagePattern({ cmd: 'getFields' })
  getFields(userId: string,fields: [string]) {
    return this.autofillService.getFields(userId, fields);
  }

  @MessagePattern({ cmd: 'patchFields' })
  patchFields(userId: string, fields: FormFieldsDto) {
    return this.autofillService.patchFields(userId, fields);
  }
}
