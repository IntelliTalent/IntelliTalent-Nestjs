import { PageOptionsDto } from '@app/shared/api-features/dtos/page-options.dto';

export class PaginatedProfilesDto {
  id: string;

  pageOptionsDto: PageOptionsDto;
}
