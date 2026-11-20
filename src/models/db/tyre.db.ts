import type { TyreCompound } from '../enums/tyre.enums';

export interface Stints {
  entryId: string;
  sessionId: string;
  /** 1, 2, 3... in order */
  stint: number;
  /** First lap on this set. The last lap is the `lapStart` of the next stint minus 1, or the laps of the race result for the last stint */
  lapStart: number;
  compound: TyreCompound | null;
  /** Laps already done on the set when the stint started (0 = new) */
  tyreAge: number | null;
}

export interface TyreManufacturers {
  id: string;
  companyId: string;
  name: string;
  countryId: string;
  primaryColor: string;
  secondaryColor: string;
}
