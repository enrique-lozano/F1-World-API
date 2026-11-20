import type { LapTimes, PitStops } from '../db/lap.db';
import type { EntryDTO } from './entry.dto';
import type { SessionDTO } from './session.dto';

export interface LapTimeDTO extends Omit<LapTimes, 'sessionId' | 'entryId'> {
  session: SessionDTO | null;
  entry: EntryDTO | null;
}

export interface PitStopDTO extends Omit<PitStops, 'sessionId' | 'entryId'> {
  session: SessionDTO | null;
  entry: EntryDTO | null;
}
