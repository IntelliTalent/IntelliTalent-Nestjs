import { PageOptionsDto } from "@app/shared/api-features/dtos/page-options.dto";

export class GetUserInterviewsDto {
    userId: string;
    
    pageOptionsDto: PageOptionsDto;
}