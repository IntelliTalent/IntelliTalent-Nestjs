import { AuthFormFieldsDto } from '@app/services_communications/autofill/dtos/auth-form-fields.dto';
import { FormFieldsDto } from '@app/services_communications/autofill/dtos/form-fields.dto';
import { AutofillServicePattern } from '@app/services_communications/autofill/patterns/autofill-service.pattern';
import { CurrentUser, ServiceName, User } from '@app/shared';
import { Body, Controller, Get, Inject, ParseArrayOptions, ParseArrayPipe, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Autofill Service')
@Controller('autofill')
@ApiBearerAuth()
export class ApiAutofillController {
    constructor(
        @Inject(ServiceName.AUTOFILL_SERVICE)
        private autoFillService: ClientProxy,
    ) { }


    @ApiOperation({ summary: 'Init the profile data' })
    @ApiOkResponse({
        description: 'The profile data has been initialized',
    })
    @Post()
    async initProfile(
        @CurrentUser() user: User,
        @Body() formFields: FormFieldsDto
    ) {
        return this.autoFillService.send(
            {
                cmd: AutofillServicePattern.init,
            },
            new AuthFormFieldsDto(user.id, formFields.data)
        );
    }

    @ApiOperation({ summary: 'Get the profile data based on the certain fields' })
    @ApiOkResponse({
        type: FormFieldsDto,
        description: 'The profile data based on the certain fields',
    })
    @Get()
    async getFormFields(
        @CurrentUser() user: User,
        @Query('fields',new ParseArrayPipe({optional: true})) fields: [string]
    ) {
        return this.autoFillService.send(
            {
                cmd: AutofillServicePattern.getFields,
            },
            {
                userId: user.id,
                fields
            },
        );
    }


    @ApiOperation({ summary: 'Patch the profile data' })
    @ApiOkResponse({
        description: 'The profile data has been patched',
    })
    @Patch()
    async patchFormFields(
        @CurrentUser() user: User,
        @Body() formFields: FormFieldsDto
    ) {
        return this.autoFillService.send(
            {
                cmd: AutofillServicePattern.patchFields,
            },
            new AuthFormFieldsDto(user.id, formFields.data)
        );
    }
}