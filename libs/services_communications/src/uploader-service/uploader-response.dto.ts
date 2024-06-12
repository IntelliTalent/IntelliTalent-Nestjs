import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ description: "The uploaded file link", required: true })
  link: string;
}
