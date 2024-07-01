import { PageMetaDto } from "@app/shared/api-features/dtos/page-meta.dto";
import { ApiProperty } from "@nestjs/swagger";

export class UserInterview{
    userId: string;
    profileId: string;
    jobId: string;
    score: number;
    deadline: Date;
    isTaken: boolean;
    name: string;
    email: string;
}

export class GetUserInterviewsResDto {
    @ApiProperty({
        description: 'Metadata of the response',
        type: PageMetaDto,
    })
    metadata: PageMetaDto;

    @ApiProperty({
        type: [UserInterview]
    })
    userInterviews: UserInterview[];
}