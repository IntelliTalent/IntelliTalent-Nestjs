import { JobPlace, JobType } from '@app/shared';
import { ApiProperty } from '@nestjs/swagger';

export class CustomJobResponseDto {
    @ApiProperty({
        type: String,
        description: 'The title of the job',
        example: 'Software Engineer',
        required: false
    })
    title: string;

    @ApiProperty({
        type: String,
        description: 'The company name',
        example: 'Google',
        required: false
    })
    company: string;

    @ApiProperty({
        type: String,
        description: 'The location of the job',
        example: 'Mountain View, CA',
        required: false
    })
    jobLocation: string;

    @ApiProperty({
        type: String,
        description: 'The type of job',
        example: 'Full-time',
        enum: JobType,
        required: false
    })
    type: JobType;

    @ApiProperty({
        type: [String],
        description: 'The skills required for the job',
        example: ['JavaScript', 'React', 'Node.js'],
        required: false
    })
    skills: string[];

    @ApiProperty({
        type: String,
        description: 'The place of the job',
        example: 'Remote',
        enum: JobPlace,
        required: false
    })
    jobPlace: JobPlace;

    /*TODO: edit this to be min experience and max */

    @ApiProperty({
        type: Number,
        description: 'The years of experience required for the job',
        example: 3,
        required: false
    })
    neededExperience: number;

    @ApiProperty({
        type: String,
        description: 'The education required for the job',
        example: 'Bachelors',
        required: false
    })
    education: string;

    @ApiProperty({
        type: Boolean,
        description: 'If computer science degree is required for the job',
        example: true,
        required: false
    })
    csRequired: boolean;

}
