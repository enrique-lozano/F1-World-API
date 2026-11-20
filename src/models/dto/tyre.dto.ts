import type { Stints, TyreManufacturers } from '../db/tyre.db';
import type { CountryDTO } from './country.dto';
import type { EntryDTO } from './entry.dto';
import type { SessionDTO } from './session.dto';

export interface StintDTO extends Omit<Stints, 'sessionId' | 'entryId'> {
  session: SessionDTO | null;
  entry: EntryDTO | null;
}

export interface TyreManufacturerDTO extends Omit<
  TyreManufacturers,
  'countryId'
> {
  country: CountryDTO | null;
}
