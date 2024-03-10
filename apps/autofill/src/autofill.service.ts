import { FormFieldsDto } from '@app/services_communications/autofill/dtos/form-fields.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AutofillService {
  getHello(): string {
    return 'Hello World!';
  }

  init(data: FormFieldsDto)  {
    return {
      message: 'initalized successfully',
    };
  }

  getFields(userId: string, fields: [string]) {
    return {
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      email: 'johndoe@example.com',
      phoneNumber: '1234567890',
      address: '123 Main St',
      city: 'Anytown',
      country: 'USA',
      skills: ['skill1', 'skill2'],
      portofolio: 'https://example.com',
      linkedIn: 'https://linkedin.com',
      github: 'https://github.com',
      cvLink: 'https://cv.com',
      postalCode: '12345',
      nationalId: '1234567890',
    }
  }

  patchFields(userId: string, fields: FormFieldsDto) {
    return {
      message: 'patched successfully',
    };
  }
}
