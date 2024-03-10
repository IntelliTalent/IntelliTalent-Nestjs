import { ApiProperty } from "@nestjs/swagger";

export class UpdateStatusResponseDto {
    @ApiProperty({
        description: 'The message of the response',
        type: 'string',
    })
    message: string;
}