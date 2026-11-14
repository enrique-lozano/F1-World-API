import { HttpException } from '../../utils/custom-error';
import { SelectQueryBuilder, sql } from 'kysely';
import { IncludeParam } from '../../models/include-filter';
import { CountryDTO, DB } from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { CountryController } from './countries.controller';

export class CountryService
  extends DbService
  implements Pick<CountryController, 'getById' | 'get'>
{
  static getCountriesSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'countries', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    return (qb as SelectQueryBuilder<DB, 'countries', object>)
      .$if(fieldsParam.shouldSelectKey('alpha2Code'), (qb) =>
        qb.select('countries.alpha2Code')
      )
      .$if(fieldsParam.shouldSelectKey('alpha3Code'), (qb) =>
        qb.select('countries.alpha3Code')
      )
      .$if(fieldsParam.shouldSelectKey('region'), (qb) =>
        qb.select('countries.region')
      )
      .$if(fieldsParam.shouldSelectKey('subregion'), (qb) =>
        qb.select('countries.subregion')
      )
      .$if(fieldsParam.shouldSelectKey('commonName'), (qb) =>
        qb.select(
          sql<string>`country_name(countries.alpha2Code)`.as('commonName')
        )
      ) as SelectQueryBuilder<DB, 'countries' | T, CountryDTO>;
  }

  get(): Promise<CountryDTO[]> {
    return CountryService.getCountriesSelect(
      this.db.selectFrom('countries')
    ).execute();
  }

  getById(countryId: string): Promise<CountryDTO> {
    return CountryService.getCountriesSelect(this.db.selectFrom('countries'))
      .where('alpha2Code', '==', countryId)
      .executeTakeFirstOrThrow(() => HttpException.resourceNotFound('default'));
  }
}
