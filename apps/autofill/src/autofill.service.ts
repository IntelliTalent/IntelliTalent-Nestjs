import { FormFieldsResponseDto } from '@app/services_communications/autofill/dtos/form-fields-response.dto';
import { FormFieldsDto } from '@app/services_communications/autofill/dtos/form-fields.dto';
import { FormField } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AutofillHelper } from './autofill.helper';
import * as AUTOFILL_CONSTANTS from '@app/services_communications/autofill/index';
import { isEmpty } from 'class-validator';

@Injectable()
export class AutofillService {
  constructor(
    @InjectModel(FormField.name) private formFieldModel: Model<FormField>,
  ) { }

  async init(
    userId: string,
    data: FormFieldsDto,
  ): Promise<FormFieldsResponseDto> {
    // get the user
    const user = await this.formFieldModel.findOne({ userId }).exec();
    if (user) {
      // call patch fields to update the user data
      return this.patchFields(userId, data.data);
    }
    const newUser = await this.formFieldModel.create({
      userId,
      data: data.data,
    });

    return {
      message: AUTOFILL_CONSTANTS.INITIATED_SUCCESSFULLY,
      formFields: Object.fromEntries(newUser.data),
    };
  }

  async getFields(
    userId: string,
    fields: string[],
  ): Promise<FormFieldsResponseDto> {
    const userData = (await this.formFieldModel.findOne({ userId }).exec())
      ?.data;
    if (!userData) {
      return {
        message: AUTOFILL_CONSTANTS.USER_NOT_FOUND,
        formFields: {},
      };
    } else if (isEmpty(fields) || fields.length < 1) {
      return {
        message: AUTOFILL_CONSTANTS.SUCCESS,
        formFields: Object.fromEntries(userData),
      };
    }
    const result = AutofillHelper.getMostSimilar(
      userData,
      fields,
      (field) => userData.get(field),
      false,
    );
    return {
      message: AUTOFILL_CONSTANTS.SUCCESS,
      formFields: result,
    };
  }

  async patchFields(
    userId: string,
    newFieldsValues: { [s: string]: string },
  ): Promise<FormFieldsResponseDto> {
    const oldFormField = await this.formFieldModel.findOne({ userId }).exec();

    if (!oldFormField) {
      return this.init(userId, { data: newFieldsValues });
    }

    let newKeys = AutofillHelper.getMostSimilar(
      oldFormField.data,
      Object.keys(newFieldsValues),
      (field) => field,
      true,
    );
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
      formFields: Object.fromEntries(results.data),
    };
  }
}
