import type { Companies } from '../db/company.db';
import type { CountryDTO } from './country.dto';

export interface CompanyDTO extends Omit<Companies, 'countryId'> {
  country: CountryDTO | null;
}
