import { PageOptionsDto } from "@app/shared/api-features/dtos/page-options.dto";

export class GetUserQuizzesDto {
  userId: string;

  pageOptionsDto: PageOptionsDto;
}
