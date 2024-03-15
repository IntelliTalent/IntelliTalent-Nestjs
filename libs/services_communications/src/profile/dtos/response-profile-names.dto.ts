import { ApiProperty } from "@nestjs/swagger";

export class ResponseProfileNames {
    @ApiProperty()

    id: number;

    @ApiProperty()
    title: string
}
