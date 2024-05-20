import { AutofillService } from './autofill.service';
import { MessagePattern } from '@nestjs/microservices';
import { FormFieldsDto } from '@app/services_communications/autofill/dtos/form-fields.dto';
import { FormFieldsResponseDto } from '@app/services_communications/autofill/dtos/form-fields-response.dto';
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AutofillController {
  constructor(private readonly autofillService: AutofillService) { }

  @Get()
  getHello(): string {
    return this.autofillService.getHello();
  }

  @MessagePattern({ cmd: 'init' })
  async init(data: { userId: string; formFields: FormFieldsDto }): Promise<FormFieldsResponseDto> {
    const {userId , formFields} = data;
    return await this.autofillService.init(userId, formFields);
  }

  @MessagePattern({ cmd: 'getFields' })
  async getFields(data:{userId: string, fields: [string]}): Promise<FormFieldsResponseDto> {
    const {userId, fields} = data;
    return await this.autofillService.getFields(userId, fields);
  }

  @MessagePattern({ cmd: 'patchFields' })
  async patchFields(data:{userId: string, formFields: FormFieldsDto}): Promise<FormFieldsResponseDto> {
    const {userId, formFields} = data;
    return await this.autofillService.patchFields(userId, formFields.data);
  }

}
