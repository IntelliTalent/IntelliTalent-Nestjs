import { JobDto } from "./job.dto";

export class PaginatedJobDto extends JobDto {
    userId: string;
    page: number;
    limit: number;
}