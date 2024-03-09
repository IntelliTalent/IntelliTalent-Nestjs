import { ApiProperty } from "@nestjs/swagger";
import { IsAlpha, IsEmail, IsPhoneNumber, IsPostalCode, IsString, IsUrl } from "class-validator";

export class FormFieldsDto {
    @ApiProperty({
        type: String,
        description: 'First name of the user',
        required: false
    })
    @IsAlpha()
    firstName: string;

    @ApiProperty({
        type: String,
        description: 'Last name of the user',
        required: false
    })
    @IsAlpha()
    lastName: string;

    @ApiProperty({
        type: String,
        description: 'Full name of the user',
        required: false
    })
    @IsAlpha()
    fullName: string;

    @ApiProperty({
        type: String,
        description: 'Email of the user',
        required: false
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        type: String,
        description: 'Phone number of the user',
        required: false
    })
    @IsPhoneNumber()
    phoneNumber: string;

    @ApiProperty({
        type: String,
        description: 'Address of the user',
        required: false
    })
    @IsString()
    address: string;

    @ApiProperty({
        type: String,
        description: 'City of the user',
        required: false
    })
    @IsString()
    city: string;

    @ApiProperty({
        type: String,
        description: 'Country of the user',
        required: false
    })
    @IsString()
    country: string;

    @ApiProperty({
        type: [String],
        description: 'Skills of the user',
        required: false
    })
    @IsString({ each: true })
    skills: string[];

    @ApiProperty({
        type: String,
        description: 'Portfolio of the user',
        required: false
    })
    @IsUrl()
    portfolio: string;

    @ApiProperty({
        type: String,
        description: 'LinkedIn of the user',
        required: false
    })
    @IsUrl()
    linkedIn: string;

    @ApiProperty({
        type: String,
        description: 'Github of the user',
        required: false
    })
    @IsUrl()
    github: string;

    @ApiProperty({
        type: String,
        description: 'CV link of the user',
        required: false
    })
    @IsUrl()
    cvLink: string;

    @ApiProperty({
        type: Number,
        description: 'Postal code of the user',
        required: false
    })
    @IsPostalCode()
    postalCode: number;

    @ApiProperty({
        type: String,
        description: 'National ID of the user',
        required: false
    })
    @IsString()
    nationalID: string;

}