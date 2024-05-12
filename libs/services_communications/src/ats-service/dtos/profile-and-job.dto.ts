import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class ProfileAndJobDto {
    @ApiProperty({
        description: 'Profile id',
        example: '123'
    })
    @IsNotEmpty()
    @IsString()
    profileId: string;

    @ApiProperty({
        description: 'Job id',
        example: '123'
    })
    @IsNotEmpty()
    @IsString()
    jobId: string;
}