import { Get, Queries, Route, Tags } from 'tsoa';

import { SelectQueryBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import {
  PageMetadata,
  PageQueryParams,
  Paginator
} from '../models/paginated-items';
import { DB, TyreManufacturerDTO } from '../models/types.dto';
import { DbService } from '../services/db.service';
import { CountryService } from './countries.controller';

@Route('tyre-manufacturers')
@Tags('Tyre Manufacturers')
export class TyreManufacturerService extends DbService {
  static getTyreManufacturerSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'tyreManufacturers', object>
  ) {
    return (qb as SelectQueryBuilder<DB, 'tyreManufacturers', object>)
      .select(['primaryColor', 'secondaryColor', 'id', 'name'])
      .select((eb) => [
        jsonObjectFrom(
          CountryService.getCountriesSelect(
            eb.selectFrom('countries')
          ).whereRef(
            'tyreManufacturers.countryId',
            '==',
            'countries.alpha2Code'
          )
        ).as('country')
      ]) as SelectQueryBuilder<
      DB,
      'tyreManufacturers' | T,
      TyreManufacturerDTO
    >;
  }

  @Get('/')
  async get(
    @Queries() obj: PageQueryParams
  ): Promise<PageMetadata & { data: TyreManufacturerDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);

    const mainSelect = this.db.selectFrom('tyreManufacturers');

    return mainSelect
      .select(({ fn, eb }) => [
        fn.countAll<number>().as('totalElements'),
        eb.val(paginator.pageSize).as('pageSize'),
        eb.val(paginator.pageNo).as('currentPage'),
        jsonArrayFrom(
          TyreManufacturerService.getTyreManufacturerSelect(mainSelect)
            .limit(paginator.pageSize)
            .offset(paginator.sqlOffset)
        ).as('data')
      ])
      .executeTakeFirstOrThrow();
  }

  /** Get a company by its ID
   *
   * @param companyId The ID of the company to get */
  @Get('{id}')
  getById(id: string): Promise<TyreManufacturerDTO | undefined> {
    return TyreManufacturerService.getTyreManufacturerSelect(
      this.db.selectFrom('tyreManufacturers')
    )
      .where('id', '==', id)
      .executeTakeFirst();
  }
}
