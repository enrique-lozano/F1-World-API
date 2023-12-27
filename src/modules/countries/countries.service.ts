import { SelectQueryBuilder } from 'kysely';
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
      .innerJoin(
        'countriesCommonNames',
        'countries.alpha2Code',
        'countriesCommonNames.countryId'
      )
      .innerJoin(
        'countriesOfficialNames',
        'countries.alpha2Code',
        'countriesOfficialNames.countryId'
      )
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
        qb.select('countriesCommonNames.en as commonName')
      )
      .$if(fieldsParam.shouldSelectKey('officialName'), (qb) =>
        qb.select('countriesOfficialNames.en as officialName')
      ) as SelectQueryBuilder<
      DB,
      'countries' | 'countriesCommonNames' | 'countriesOfficialNames' | T,
      CountryDTO
    >;
  }

  get(): Promise<CountryDTO[]> {
    return CountryService.getCountriesSelect(
      this.db.selectFrom('countries')
    ).execute();
  }

  getById(countryId: string): Promise<CountryDTO | undefined> {
    return CountryService.getCountriesSelect(this.db.selectFrom('countries'))
      .where('alpha2Code', '==', countryId)
      .executeTakeFirst();
  }
}
