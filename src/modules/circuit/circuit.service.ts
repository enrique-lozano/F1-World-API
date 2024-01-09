import { jsonObjectFrom } from 'kysely/helpers/sqlite';

import { SelectQueryBuilder } from 'kysely';
import { IncludeParam } from '../../models/include-filter';
import { PageMetadata, Paginator } from '../../models/pagination';
import { Sorter } from '../../models/sorter';
import { CircuitDTO, Circuits, DB } from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { CountryService } from '../countries/countries.service';
import { CircuitController, CircuitQueryParams } from './circuit.controller';

export class CircuitService
  extends DbService
  implements Pick<CircuitController, 'get' | 'getById'>
{
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
      .select(fieldsParam.getFilteredFieldsArray(allSingleFields))
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

  async get(
    obj: CircuitQueryParams
  ): Promise<PageMetadata & { data: CircuitDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<Circuits>(obj.sort || 'name');

    const mainSelect = this.db.selectFrom('circuits');

    return this.paginateSelect(
      mainSelect,
      CircuitService.getCircuitsSelect(
        mainSelect,
        IncludeParam.fromFieldQueryParam(obj)
      ),
      paginator,
      sorter
    ).executeTakeFirstOrThrow();
  }

  getById(id: string): Promise<CircuitDTO | undefined> {
    return CircuitService.getCircuitsSelect(this.db.selectFrom('circuits'))
      .where('id', '==', id)
      .executeTakeFirst();
  }
}
