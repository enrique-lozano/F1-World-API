import { SelectQueryBuilder } from 'kysely';
import { Get, Path, Route, Tags } from 'tsoa';
import { DbService } from '../services/db.service';
import { CountryDTO, DB } from './../models/types.dto';

@Route('/countries')
@Tags('Countries')
export class CountryService extends DbService {
  static getCountriesSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'countries', {}>
  ) {
    return (qb as SelectQueryBuilder<DB, 'countries', {}>)
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
      .select([
        'countries.alpha2Code',
        'countries.alpha3Code',
        'countries.region',
        'countries.subregion',
        'countriesCommonNames.en as commonName',
        'countriesOfficialNames.en as officialName'
      ]) as SelectQueryBuilder<
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
