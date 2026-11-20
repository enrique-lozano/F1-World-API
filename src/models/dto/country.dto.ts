import type { Countries } from '../db/country.db';

export interface CountryDTO extends Countries {
  /** Name of the country in the requested `locale` (English by default) */
  commonName: string;
}
