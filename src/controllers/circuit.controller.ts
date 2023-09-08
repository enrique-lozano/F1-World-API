import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';

import { SelectQueryBuilder } from 'kysely';
import { Get, Queries, Route, Tags } from 'tsoa';
import { CircuitDTO, DB } from '../models/interfaces/types.dto';
import { DbService } from '../services/db.service';
import {
  PageMetadata,
  PageQueryParams,
  Paginator
} from './../models/interfaces/paginated-items';
import { CountryService } from './countries.controller';

@Route('circuits')
@Tags('Circuits')
export class CircuitService extends DbService {
  static getCircuitsSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'circuits', {}>
  ) {
    return (qb as SelectQueryBuilder<DB, 'circuits', {}>)
      .select([
        'fullName',
        'id',
        'latitude',
        'longitude',
        'name',
        'placeName',
        'previousNames',
        'type'
      ])
      .select((eb) => [
        jsonObjectFrom(
          CountryService.getCountriesSelect(
            eb.selectFrom('countries')
          ).whereRef('circuits.countryId', '==', 'countries.alpha2Code')
        ).as('country')
      ]) as SelectQueryBuilder<DB, 'circuits' | T, CircuitDTO>;
  }

  @Get('/')
  async get(
    @Queries() obj: PageQueryParams
  ): Promise<PageMetadata & { data: CircuitDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);

    return this.db1
      .selectFrom('circuits')
      .select(({ fn, eb }) => [
        fn.countAll<number>().as('totalElements'),
        eb.val(paginator.pageSize).as('pageSize'),
        eb.val(paginator.pageNo).as('currentPage'),
        jsonArrayFrom(
          CircuitService.getCircuitsSelect(eb.selectFrom('circuits'))
            .limit(paginator.pageSize)
            .offset(paginator.sqlOffset)
        ).as('data')
      ])
      .executeTakeFirstOrThrow();
  }

  /** Get a circuit by its ID */ @Get('/{id}')
  getById(id: string): Promise<CircuitDTO | undefined> {
    return CircuitService.getCircuitsSelect(this.db1.selectFrom('circuits'))
      .where('id', '==', id)
      .executeTakeFirst();
  }
}
