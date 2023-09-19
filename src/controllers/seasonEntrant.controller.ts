import { SelectQueryBuilder } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { DB, SeasonEntrantDTO } from '../models/types.dto';
import { DbService } from '../services/db.service';
import { CountryService } from './countries.controller';

export class SeasonEntrantService extends DbService {
  static getSeasonEntrantsSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'seasonEntrants', {}>
  ) {
    return (qb as SelectQueryBuilder<DB, 'seasonEntrants', {}>)
      .select(['id', 'season', 'name'])
      .select((eb) => [
        jsonObjectFrom(
          CountryService.getCountriesSelect(
            eb.selectFrom('countries')
          ).whereRef('seasonEntrants.countryId', '==', 'countries.alpha2Code')
        ).as('country')
      ]) as SelectQueryBuilder<DB, 'seasonEntrants' | T, SeasonEntrantDTO>;
  }
}
