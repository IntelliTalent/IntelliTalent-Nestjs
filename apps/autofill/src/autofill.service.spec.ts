import { Test, TestingModule } from '@nestjs/testing';
import { AutofillController } from './autofill.controller';
import { AutofillService } from './autofill.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FormField, FormFieldSchema } from '@app/shared/entities/form_fields.schema';
import { ServiceName, SharedModule } from '@app/shared';
import { AuthFormFieldsDto, FormFieldsDto } from '@app/services_communications/autofill';
import * as AUTOFILL_CONSTANTS from '@app/services_communications/autofill/index';
import { MongoDBName } from '@app/shared/config/mongodb.config';

describe('Autofill service', () => {
  let autofillService: AutofillService;
  const formFieldsDto: AuthFormFieldsDto = {
    userId: 'b66c1a13-3674-41eb-a77b-25e6f120e8da',
    data: {
      "user_name": "Mohamed Nabil",
      "user_city": "Cairo",
      "user_phone": "01100961135",
      "email": "mohamednabil@gmail.com"
    }
  }

  const fieldsTemp: string[] = [
    'name',
    'city',
    'phone',
  ]

  const resultTemp = {
    "name": "Mohamed Nabil",
    "city": "Cairo",
    "phone": "01100961135",
  }


  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        SharedModule.registerMongoDB(MongoDBName.FormFieldsDB),
        MongooseModule.forFeature([
          {
            name: FormField.name,
            schema: FormFieldSchema,
            collection: ServiceName.TESTING_DATABASE,
          },
        ]),
      ],
      controllers: [AutofillController],
      providers: [AutofillService],
    }).compile();

    autofillService = app.get<AutofillService>(AutofillService);
  });

  it('should be defined', () => {
    expect(autofillService).toBeDefined();
  });

  it('should init the form fields for the first time', async () => {
    const result = await autofillService.init(formFieldsDto.userId, new FormFieldsDto(formFieldsDto.data));
    expect(result).toBeDefined();
    expect(result).toHaveProperty('message');
    expect(result.message).toBe(AUTOFILL_CONSTANTS.INITIATED_SUCCESSFULLY);
    expect(result).toHaveProperty('formFields');
    expect(result.formFields).toEqual(formFieldsDto.data);
  });

  it('should update the form fields', async () => {
    const result = await autofillService.init(formFieldsDto.userId, new FormFieldsDto(formFieldsDto.data));
    expect(result).toBeDefined();
    expect(result).toHaveProperty('message');
    expect(result.message).toBe(AUTOFILL_CONSTANTS.SUCCESS);
    expect(result).toHaveProperty('formFields');
    expect(result.formFields).toEqual(formFieldsDto.data);
  });

  it('should get the form fields', async () => {
    const result = await autofillService.getFields(formFieldsDto.userId, fieldsTemp);
    expect(result).toBeDefined();
    expect(result).toHaveProperty('message');
    expect(result.message).toBe(AUTOFILL_CONSTANTS.SUCCESS);
    expect(result).toHaveProperty('formFields');
    expect(result.formFields).toEqual(resultTemp);
  });

  it('should throw an error that the user not found', async () => {
    const result = await autofillService.getFields('b66c1a13-3674-41eb-a77b-25e6f120e8db', fieldsTemp);
    expect(result).toBeDefined();
    expect(result).toHaveProperty('message');
    expect(result.message).toBe(AUTOFILL_CONSTANTS.USER_NOT_FOUND);
    expect(result).toHaveProperty('formFields');
    expect(result.formFields).toEqual({});
  });

  it('should init the form fields for the first time', async () => {
    const result = await autofillService.patchFields('b66c1a13-3674-41eb-a77b-25e6f120e8db', formFieldsDto.data);
    expect(result).toBeDefined();
    expect(result).toHaveProperty('message');
    expect(result.message).toBe(AUTOFILL_CONSTANTS.INITIATED_SUCCESSFULLY);
    expect(result).toHaveProperty('formFields');
    expect(result.formFields).toEqual(formFieldsDto.data);
  });
});
