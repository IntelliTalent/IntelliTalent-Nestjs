import { ApiProperty } from '@nestjs/swagger';

export class ICvInfo {
  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ type: [String] })
  education: string[];

  @ApiProperty({ type: [String] })
  languages: string[];

  @ApiProperty({ type: [String] })
  skills: string[];

  @ApiProperty({ type: Map })
  projectSkills: Map<string, number>;

  @ApiProperty()
  yearsOfExperience: number;

  @ApiProperty({ type: [String] })
  certifications: string[];
}
