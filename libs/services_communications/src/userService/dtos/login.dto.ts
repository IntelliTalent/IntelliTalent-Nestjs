import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";


export class LoginDto {
  @ApiProperty({
    description: 'Email of the user',
    example: 'waer@waer.com'
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'Password123+'
  })
  @IsNotEmpty()
  password: string;
}
