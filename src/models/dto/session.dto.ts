import type { Sessions, TimedSessionResults } from '../db/session.db';
import type { EntryDTO } from './entry.dto';
import type { EventDTO } from './event.dto';

export interface SessionDTO extends Omit<Sessions, 'eventId'> {
  event: EventDTO | null;
}

export interface TimedSessionResultsDTO extends Omit<
  TimedSessionResults,
  'sessionId' | 'entryId'
> {
  session: SessionDTO | null;
  entry: EntryDTO | null;
}
