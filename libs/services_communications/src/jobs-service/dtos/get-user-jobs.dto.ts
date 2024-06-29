import { PageOptionsDto } from '@app/shared/api-features/dtos/page-options.dto';

export class GetUserJobsDto {
  userId: string;

  pageOptionsDto: PageOptionsDto;
}
