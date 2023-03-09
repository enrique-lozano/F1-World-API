import { Get, Path, Route, Tags } from 'tsoa';
import {
  Country,
  countryCommonNames,
  CountryInDB,
  countryOfficialNames
} from '../models/classes/country';
import { DbService } from './db.service';

@Route('/countries')
@Tags('Countries')
export class CountryService extends DbService {
  private instanciateNewClass(x: CountryInDB) {
    return new Country(
      x,
      this.getCommonName(x.alpha2Code),
      this.getOfficialName(x.alpha2Code)
    );
  }

  private getOfficialName(countryId: string, lang: string = 'en') {
    const officialName = this.getOfficialNames(countryId)[lang];

    if (!officialName) this.getOfficialNames(countryId)['en'];

    return officialName as string;
  }

  private getOfficialNames(countryId: string) {
    return this.db
      .prepare('SELECT * FROM countriesOfficialNames WHERE countryId = ?')
      .get(countryId) as countryOfficialNames;
  }

  private getCommonName(countryId: string, lang: string = 'en') {
    const commonName = this.getCommonNames(countryId)[lang];

    if (!commonName) this.getCommonNames(countryId)['en'];

    return commonName as string;
  }

  private getCommonNames(countryId: string) {
    return this.db
      .prepare(`SELECT * FROM countriesCommonNames WHERE countryId = ?`)
      .get(countryId) as countryCommonNames;
  }

  @Get('/')
  get() {
    const countriesInDb = this.db
      .prepare('SELECT * FROM countries')
      .all() as CountryInDB[];

    return countriesInDb.map((x) => this.instanciateNewClass(x));
  }

  /** Get a country by its ID
   *
   * @param countryId The ID of the country to get */ @Get('{countryId}')
  getById(@Path() countryId: string) {
    const countryFound = this.db
      .prepare('SELECT * FROM countries WHERE alpha2Code = ?')
      .get(countryId);

    return this.instanciateNewClass(countryFound);
  }
}
