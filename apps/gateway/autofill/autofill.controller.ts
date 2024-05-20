import { FormFieldsDto } from '@app/services_communications/autofill/dtos/form-fields.dto';
import { AutofillServicePattern } from '@app/services_communications/autofill/patterns/autofill-service.pattern';
import { CurrentUser, ServiceName } from '@app/shared';
import { Body, Controller, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Autofill Service')
@Controller('autofill')
@ApiBearerAuth()
export class ApiAutofillController {
    constructor(
        @Inject(ServiceName.AUTOFILL_SERVICE)
        private autoFillService: ClientProxy,
    ) {}


    @ApiOperation({ summary: 'Init the profile data' })
    @ApiOkResponse({
        description: 'The profile data has been initialized',
    })
    @Post()
    async initProfile(
        @CurrentUser('id') userId,
        @Body() formFields: FormFieldsDto
        ) {
        return this.autoFillService.send(
            {
                cmd: AutofillServicePattern.init,
            },
            {
                userId:userId.id,
                formFields
            },
        );
    }

    @ApiOperation({ summary: 'Get the profile data based on the certain fields' })
    @ApiOkResponse({
        type: FormFieldsDto,
        description: 'The profile data based on the certain fields',
    })
    @Get()
    async getFormFields(
        @CurrentUser('id') userId,
        @Query('fields') fields: [string]
        ) {
        return this.autoFillService.send(
            {
                cmd: AutofillServicePattern.getFields,
            },
            {
                userId:userId.id,
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
        @CurrentUser('id') userId,
        @Body() formFields: FormFieldsDto
        ) {
        return this.autoFillService.send(
            {
                cmd: AutofillServicePattern.patchFields,
            },
            {
                userId:userId.id,
                formFields
            },
        );
    }
}