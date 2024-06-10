import { AutofillService } from './autofill.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FormFieldsResponseDto } from '@app/services_communications/autofill/dtos/form-fields-response.dto';
import { Controller, Get } from '@nestjs/common';
import { AutofillServicePattern } from '@app/services_communications/autofill/patterns/autofill-service.pattern';
import { GetFieldsDto } from '@app/services_communications/autofill/dtos/get-fields.dto';
import { AuthFormFieldsDto } from '@app/services_communications/autofill/dtos/auth-form-fields.dto';

@Controller()
export class AutofillController {
  constructor(private readonly autofillService: AutofillService) { }

  @Get()
  getHello(): string {
    return this.autofillService.getHello();
  }

  @MessagePattern({ cmd: AutofillServicePattern.init })
  async init(@Payload() dto: AuthFormFieldsDto): Promise<FormFieldsResponseDto> {
    console.log('init', dto);
    const { userId, data } = dto;
    return await this.autofillService.init(userId, {data});
  }

  @MessagePattern({ cmd: AutofillServicePattern.getFields })
  async getFields(@Payload() data: GetFieldsDto): Promise<FormFieldsResponseDto> {
    const { userId, fields } = data;
    return await this.autofillService.getFields(userId, fields);
  }

  @MessagePattern({ cmd: AutofillServicePattern.patchFields })
  async patchFields(@Payload() dto: AuthFormFieldsDto): Promise<FormFieldsResponseDto> {
    const { userId, data } = dto;
    return await this.autofillService.patchFields(userId, data);
  }

}
