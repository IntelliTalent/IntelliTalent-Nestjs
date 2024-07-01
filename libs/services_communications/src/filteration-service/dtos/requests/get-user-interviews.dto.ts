import { PageOptionsDto } from "@app/shared/api-features/dtos/page-options.dto";
import { User } from "@app/shared/entities/user.entity";

export class GetUserInterviewsDto {
    user: User;
    
    pageOptionsDto: PageOptionsDto;
}