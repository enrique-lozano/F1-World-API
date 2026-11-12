import { SelectQueryBuilder, sql } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam } from '../../models/include-filter';
import { DB, EntrantSeasonDTO } from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { ConstructorService } from '../constructor/constructor.service';
import { CountryService } from '../countries/countries.service';
import { EntrantService } from './entrant.service';

export class EntrantSeasonService extends DbService {
  static getEntrantSeasonsSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'entrantSeasons', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = ['id', 'season'] as const;

    return (qb as SelectQueryBuilder<DB, 'entrantSeasons', object>)
      .select(
        fieldsParam.getFilteredFieldsArrayWithPrefix(
          allSingleFields,
          'entrantSeasons.'
        )
      )
      .$if(fieldsParam.shouldSelectKey('type'), (qb) =>
        qb.select(
          sql<
            'WORKS' | 'CUSTOMER'
          >`CASE WHEN entrantSeasons.ownConstructorId IS NULL THEN 'CUSTOMER' ELSE 'WORKS' END`.as(
            'type'
          )
        )
      )
      .$if(fieldsParam.shouldSelectObject('entrant'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            EntrantService.getEntrantsSelect(
              eb.selectFrom('entrants'),
              fieldsParam?.clone('entrant')
            ).whereRef('entrantSeasons.entrantId', '==', 'entrants.id')
          ).as('entrant')
        )
      )
      .$if(fieldsParam.shouldSelectObject('ownConstructor'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            ConstructorService.getConstructorsSelect(
              eb.selectFrom('constructors'),
              fieldsParam?.clone('ownConstructor')
            ).whereRef(
              'entrantSeasons.ownConstructorId',
              '==',
              'constructors.id'
            )
          ).as('ownConstructor')
        )
      )
      .$if(fieldsParam.shouldSelectObject('licenceCountry'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            CountryService.getCountriesSelect(
              eb.selectFrom('countries'),
              fieldsParam?.clone('licenceCountry')
            ).whereRef(
              'entrantSeasons.licenceCountryId',
              '==',
              'countries.alpha2Code'
            )
          ).as('licenceCountry')
        )
      ) as SelectQueryBuilder<DB, 'entrantSeasons' | T, EntrantSeasonDTO>;
  }
}
