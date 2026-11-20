import type { SessionAbbreviation } from '../enums/session.enums';

export interface Sessions {
  id: string;
  eventId: string;
  abbreviation: SessionAbbreviation;
  /** ISO 8601 date and time in UTC. The sessions of the oldest seasons only have the date, with the time `00:00:00Z`. `null` if unknown */
  startDateTime: string | null;
}

export interface TimedSessionResults {
  entryId: string;
  sessionId: string;
  positionOrder: number | null;
  /** The finishing position (`"1"`, `"2"`...) or a `ResultStatusCode` */
  positionText: string | null;
  laps: number | null;
  time: number | null;
}
