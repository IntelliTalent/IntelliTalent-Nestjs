import { PageOptionsDto } from "@app/shared/api-features/dtos/page-options.dto";
import { JobDto } from "./job.dto";

export class PaginatedJobDto extends JobDto {
    userId: string;
    isQualified?: boolean;
    paginationOptions: PageOptionsDto;
}