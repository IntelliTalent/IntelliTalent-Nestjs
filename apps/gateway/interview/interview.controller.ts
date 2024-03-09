import { ServiceName } from "@app/shared";
import { Body, Controller, Get, Inject, Param, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { ClientProxy } from '@nestjs/microservices';
import { InterviewServicePattern } from "@app/services_communications/interview/patterns/interview-service.pattern";
import { UserQuestionsDto } from "@app/services_communications/interview/dtos/user-questions.dto";


@ApiSecurity('bearer')
@Controller('interview')
@ApiTags('Interview Service')
export class ApiInterviewController {
    constructor(
        @Inject(ServiceName.INTERVIEW_SERVICE)
        private interviewService: ClientProxy,
      ) {}

    @ApiOperation({
        summary: 'Submit the user\'s interview answers'
    })
    @ApiOkResponse({
        description: 'The interview answers submitted successfully'
    })
    @Post(':jobId/:userId')
    async submitInterview(
        @Param('jobId') jobId: string,
        @Param('userId') userId: string,
        @Body() answers: UserQuestionsDto,
    ) {
        return this.interviewService.send(
            {
                cmd: InterviewServicePattern.submitInterview,
            },
            {
                userId,
                jobId,
                answers,
            },
        );
    }

    @ApiOperation({
        summary: 'Get the user\'s interview answers'
    })
    @ApiOkResponse({
        description: 'The interview answers of the user',
        type: UserQuestionsDto,
    })
    @Get(':jobId/:userId')
    async getInterviewAnswers(
        @Param('jobId') jobId: string,
        @Param('userId') userId: string,
    ) {
        return this.interviewService.send(
            {
                cmd: InterviewServicePattern.getUserAnswers,
            },
            {
                userId,
                jobId,
            },
        );
    }
}
