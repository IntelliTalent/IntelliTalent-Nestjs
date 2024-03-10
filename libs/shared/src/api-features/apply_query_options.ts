import { SelectQueryBuilder } from 'typeorm';
import { PageOptionsDto } from './dtos/page-options.dto';
import { PageMetaDto } from './dtos/page-meta.dto';
import { PageDto } from './dtos/page.dto';

export const applyQueryOptions = async (
  query: SelectQueryBuilder<any>,
  pageOptionsDto: PageOptionsDto,
): Promise<PageDto<any>> => {
  const { orderBy, orderDirection, searchField, searchValue } = pageOptionsDto;

  if (searchField && searchValue) {
    query = query.andWhere(`${searchField} ILIKE :search`, {
      search: `%${searchValue}%`,
    });
  }

  if (orderBy && orderDirection) {
    query = query.orderBy(`${orderBy}`, orderDirection);
  }

  query = query.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

  const itemCount = await query.getCount();

  const { entities } = await query.getRawAndEntities();

  const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
  return new PageDto(entities, pageMetaDto);
};
