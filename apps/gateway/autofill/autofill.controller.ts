import { FormFieldsDto } from '@app/services_communications/autofill/dtos/form-fields.dto';
import { AutofillServicePattern } from '@app/services_communications/autofill/patterns/autofill-service.pattern';
import { ServiceName } from '@app/shared';
import { Body, Controller, Get, Header, Inject, Param, Patch, Post } from '@nestjs/common';
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
    @Post(':userId')
    async initProfile(
        @Param('userId') userId: string,
        @Body() formFields: FormFieldsDto
        ) {
        return this.autoFillService.send(
            {
                cmd: AutofillServicePattern.init,
            },
            {
                userId,
                formFields
            },
        );
    }

    @ApiOperation({ summary: 'Get the profile data based on the certain fields' })
    @ApiOkResponse({
        type: FormFieldsDto,
        description: 'The profile data based on the certain fields',
    })
    @Get(':userId')
    async getFormFields(
        @Param('userId') userId: string,
        @Param('fields') fields: [string]
        ) {
        return this.autoFillService.send(
            {
                cmd: AutofillServicePattern.getFields,
            },
            {
                userId,
                fields
            },
        );
    }
    
    
    @ApiOperation({ summary: 'Patch the profile data' })
    @ApiOkResponse({
        description: 'The profile data has been patched',
    })
    @Patch(':userId')
    async patchFormFields(
        @Param('userId') userId: string,
        @Body() formFields: FormFieldsDto
        ) {
        return this.autoFillService.send(
            {
                cmd: AutofillServicePattern.patchFields,
            },
            {
                userId,
                formFields
            },
        );
    }
}