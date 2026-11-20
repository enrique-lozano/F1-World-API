import type { Events, GrandsPrix } from '../db/event.db';
import type { CircuitDTO, CircuitLayoutDTO } from './circuit.dto';
import type { CountryDTO } from './country.dto';
import type { EntryDTO } from './entry.dto';

/** An entry of an event (GP) and what it did in it */
export interface EventEntryDTO {
  /** The race result (a finishing position or a `ResultStatusCode`), `TD` for a test driver (`entry.testDriver`) that only took part in free practice, or `null` if the entry has results of other sessions but none in the race */
  participation: string | null;
  entry: EntryDTO;
}

/** The result of a driver in one event (GP), as in the season tables of Wikipedia: one row per race result, plus the events in which he was only a test driver */
export interface DriverEventResultDTO {
  eventId: string;
  season: number;
  round: number;
  grandPrixId: string;
  /** Country of the grand prix (alpha-2 code) */
  grandPrixCountryId: string | null;
  scheduledLaps: number | null;
  entryId: string;
  driverNumber: number;
  constructorId: string;
  constructorName: string;
  /** The finishing position or a `ResultStatusCode` (`TD` if he was a test driver, `entries.testDriver`, in a GP without a race result) */
  positionText: string;
  points: number | null;
  laps: number | null;
}

export interface EventDTO extends Omit<
  Events,
  'grandPrixId' | 'circuitLayoutId'
> {
  /** Season (year) of the event, deduced from its ID */
  season: number;

  /** Round of the event inside its season, deduced from its ID */
  round: number;

  grandPrix: GrandsPrixDTO | null;
  /** The circuit where the event was held. It is also available inside `circuitLayout`, with the rest of the data of the layout */
  circuit: CircuitDTO | null;
  /** The layout of the circuit that was raced in this event */
  circuitLayout: CircuitLayoutDTO | null;
}

export interface GrandsPrixDTO extends Omit<GrandsPrix, 'countryId'> {
  country: CountryDTO | null;
}
