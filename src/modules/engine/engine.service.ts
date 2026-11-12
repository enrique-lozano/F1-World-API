import { SelectQueryBuilder } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam } from '../../models/include-filter';
import { DB, EngineDTO, EngineManufacturerDTO } from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { CountryService } from '../countries/countries.service';

export class EngineManufacturerService extends DbService {
  static getEngineManufacturersSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'engineManufacturers', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = ['id', 'companyId', 'name'] as const;

    return (qb as SelectQueryBuilder<DB, 'engineManufacturers', object>)
      .select(
        fieldsParam.getFilteredFieldsArrayWithPrefix(
          allSingleFields,
          'engineManufacturers.'
        )
      )
      .$if(fieldsParam.shouldSelectObject('country'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            CountryService.getCountriesSelect(
              eb.selectFrom('countries'),
              fieldsParam?.clone('country')
            ).whereRef(
              'engineManufacturers.countryId',
              '==',
              'countries.alpha2Code'
            )
          ).as('country')
        )
      ) as SelectQueryBuilder<
      DB,
      'engineManufacturers' | T,
      EngineManufacturerDTO
    >;
  }
}

export class EngineService extends DbService {
  static getEnginesSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'engines', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = [
      'id',
      'name',
      'layout',
      'cylinders',
      'displacement',
      'aspiration',
      'hybrid'
    ] as const;

    return (qb as SelectQueryBuilder<DB, 'engines', object>)
      .select(
        fieldsParam.getFilteredFieldsArrayWithPrefix(
          allSingleFields,
          'engines.'
        )
      )
      .$if(fieldsParam.shouldSelectObject('manufacturer'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            EngineManufacturerService.getEngineManufacturersSelect(
              eb.selectFrom('engineManufacturers'),
              fieldsParam?.clone('manufacturer')
            ).whereRef('engines.manufacturerId', '==', 'engineManufacturers.id')
          ).as('manufacturer')
        )
      ) as SelectQueryBuilder<DB, 'engines' | T, EngineDTO>;
  }
}
