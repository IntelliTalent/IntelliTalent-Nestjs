import { FormFieldsResponseDto } from '@app/services_communications/autofill/dtos/form-fields-response.dto';
import { FormFieldsDto } from '@app/services_communications/autofill/dtos/form-fields.dto';
import { FormField } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AutofillHelper } from './autofill.helper';
import * as AUTOFILL_CONSTANTS from '@app/services_communications/autofill/index';


@Injectable()
export class AutofillService {


  constructor(@InjectModel(FormField.name) private formFieldModel: Model<FormField>) { }
  getHello(): string {
    return 'Hello World!';
  }

  async init(userId: string, data: FormFieldsDto): Promise<FormFieldsResponseDto> {
    // get the user 
    const user = await this.formFieldModel.findOne({ userId }).exec();
    if (user) {
      user.data = new Map(Object.entries(data.data));
      await user.save();
      return {
        message: AUTOFILL_CONSTANTS.INITIATED_SUCCESSFULLY,
        formFields: Object.fromEntries(user.data)
      }
    }
    const newUser = await this.formFieldModel.create({
      userId,
      data: data.data
    })
    return {
      message: AUTOFILL_CONSTANTS.INITIATED_SUCCESSFULLY,
      formFields: Object.fromEntries(newUser.data)
    }
  }

  async getFields(userId: string, fields: [string]): Promise<FormFieldsResponseDto> {
    const userData = (await this.formFieldModel.findOne({ userId }).exec())?.data;
    if (!userData) {
      return {
        message: AUTOFILL_CONSTANTS.USER_NOT_FOUND,
        formFields: {}
      }
    }
    const result = AutofillHelper.getMostSimilar(userData, fields, (field) => userData.get(field), false);
    return {
      message: AUTOFILL_CONSTANTS.SUCCESS,
      formFields: result
    };
  }

  async patchFields(userId: string, newFieldsValues: { [s: string]: string; }): Promise<FormFieldsResponseDto> {
    const oldFormField = await this.formFieldModel.findOne({ userId }).exec();
    let newKeys = AutofillHelper.getMostSimilar(oldFormField.data, Object.keys(newFieldsValues), (field) => field, true);
    const oldKeys = Object.values(newKeys);
    // swap the keys and values
    newKeys = Object.entries(newKeys).reduce((acc, [key, value]) => {
      acc[value] = key;
      return acc;
    }, {});
    for (const key of oldKeys) {
      oldFormField.data.set(key, newFieldsValues[newKeys[key]]);
    }
    const results = await oldFormField.save();
    return {
      message: AUTOFILL_CONSTANTS.SUCCESS,
      formFields: Object.fromEntries(results.data)
    }
  }
}
