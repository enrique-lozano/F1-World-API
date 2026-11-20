import type { RaceResults, RetirementReasons } from '../db/result.db';
import type { EntryDTO } from './entry.dto';
import type { SessionDTO } from './session.dto';

export interface RaceResultDTO extends Omit<
  RaceResults,
  'sessionId' | 'entryId'
> {
  /** Why the car did not finish (or was disqualified / did not start). `null` if it finished */
  reasonRetired: string | null;
  /** Category of the `reasonRetired` (`MECHANICAL`, `ACCIDENT`, `DRIVER_HEALTH`, `DISQUALIFICATION` or `OTHER`) */
  retirementCategory: RetirementReasons['category'] | null;
  session: SessionDTO | null;
  entry: EntryDTO | null;
  /** 1 if the car was shared with other drivers (another result of this race has the same position and car number), 0 otherwise */
  sharedCar: number;
}
