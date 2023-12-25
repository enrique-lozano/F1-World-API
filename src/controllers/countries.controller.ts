import { SelectQueryBuilder } from 'kysely';
import { Get, Path, Route, Tags } from 'tsoa';
import { IncludeParam } from '../models/fields-filter';
import { DbService } from '../services/db.service';
import { CountryDTO, DB } from './../models/types.dto';

@Route('/countries')
@Tags('Countries')
export class CountryService extends DbService {
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

  @Get('/')
  get(): Promise<CountryDTO[]> {
    return CountryService.getCountriesSelect(
      this.db.selectFrom('countries')
    ).execute();
  }

  /** Get a country by its ID
   *
   * @param countryId The ID of the country to get
   * */
  @Get('{countryId}')
  getById(@Path() countryId: string): Promise<CountryDTO | undefined> {
    return CountryService.getCountriesSelect(this.db.selectFrom('countries'))
      .where('alpha2Code', '==', countryId)
      .executeTakeFirst();
  }
}
