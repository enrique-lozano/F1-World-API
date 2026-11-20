import type { Drivers } from '../db/driver.db';
import type { CountryDTO } from './country.dto';

// ! We should create a separete type to fix the issue: https://github.com/lukeautry/tsoa/issues/1238. If we put inside the Omit multiple lines, the swagger generator will not work
type driverOmittedAttr =
  | 'countryOfBirthCountryId'
  | 'nationalityCountryId'
  | 'secondNationalityCountryId';

export interface DriverDTO extends Omit<Drivers, driverOmittedAttr> {
  countryOfBirthCountry: CountryDTO | null;
  nationalityCountry: CountryDTO | null;
  secondNationalityCountry: CountryDTO | null;

  /** First season in which the driver had at least one entry, that is, appears in the results of a race, qualifying or free practice session. `null` if there are no results of this driver.
   *
   * Only returned by the `/drivers` endpoints, not when the driver is nested inside other resources */
  firstSeason?: number | null;

  /** Last season in which the driver had at least one entry, that is, appears in the results of a race, qualifying or free practice session. `null` if there are no results of this driver.
   *
   * Only returned by the `/drivers` endpoints, not when the driver is nested inside other resources */
  lastSeason?: number | null;
}
