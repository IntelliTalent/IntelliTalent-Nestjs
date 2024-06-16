import { PageOptionsDto } from "@app/shared/api-features/dtos/page-options.dto";
import { JobQuizzesIdentifierDto } from "./job-quiz-identifier.dto";


export class PaginatedJobQuizzesIdentifierDto extends JobQuizzesIdentifierDto {
    pageOptionsDto: PageOptionsDto;
}
