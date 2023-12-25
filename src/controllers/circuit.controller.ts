import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';

import { SelectQueryBuilder } from 'kysely';
import { Get, Queries, Route, Tags } from 'tsoa';
import { IncludeParam, IncludeQueryParam } from '../models/fields-filter';
import {
  PageMetadata,
  PageQueryParams,
  Paginator
} from '../models/paginated-items';
import { Sorter, SorterQueryParams } from '../models/sorter';
import { CircuitDTO, Circuits, DB } from '../models/types.dto';
import { DbService } from '../services/db.service';
import { CountryService } from './countries.controller';

interface CircuitQueryParams
  extends PageQueryParams,
    SorterQueryParams,
    IncludeQueryParam {
  /** @default name */
  orderBy?: keyof Circuits;
}

@Route('circuits')
@Tags('Circuits')
export class CircuitService extends DbService {
  static getCircuitsSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'circuits', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = [
      'fullName',
      'id',
      'latitude',
      'longitude',
      'name',
      'placeName',
      'previousNames',
      'type'
    ] as const;

    return (qb as SelectQueryBuilder<DB, 'circuits', object>)
      .select(
        fieldsParam.getFilteredFieldsArray(allSingleFields) ?? allSingleFields
      )
      .$if(fieldsParam.shouldSelectObject('country'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            CountryService.getCountriesSelect(
              eb.selectFrom('countries'),
              fieldsParam?.clone('country')
            ).whereRef('circuits.countryId', '==', 'countries.alpha2Code')
          ).as('country')
        )
      ) as SelectQueryBuilder<DB, 'circuits' | T, CircuitDTO>;
  }

  @Get('/')
  async get(
    @Queries() obj: CircuitQueryParams
  ): Promise<PageMetadata & { data: CircuitDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<Circuits>(obj.orderBy || 'name', obj.orderDir);

    return this.db
      .selectFrom('circuits')
      .select(({ fn, eb }) => [
        fn.countAll<number>().as('totalElements'),
        eb.val(paginator.pageSize).as('pageSize'),
        eb.val(paginator.pageNo).as('currentPage'),
        jsonArrayFrom(
          CircuitService.getCircuitsSelect(
            eb.selectFrom('circuits'),
            IncludeParam.fromFieldQueryParam(obj)
          )
            .limit(paginator.pageSize)
            .offset(paginator.sqlOffset)
            .orderBy(`${sorter.orderBy} ${sorter.orderDir}`)
        ).as('data')
      ])
      .executeTakeFirstOrThrow();
  }

  /** Get a circuit by its ID */ @Get('/{id}')
  getById(id: string): Promise<CircuitDTO | undefined> {
    return CircuitService.getCircuitsSelect(this.db.selectFrom('circuits'))
      .where('id', '==', id)
      .executeTakeFirst();
  }
}
