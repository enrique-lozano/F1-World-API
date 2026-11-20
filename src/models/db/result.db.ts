import type { ResultStatusCode } from '../enums/result.enums';

export interface RaceResults {
  entryId: string;
  sessionId: string;
  positionOrder: number;
  /** The finishing position (`"1"`, `"2"`...) or a `ResultStatusCode` (never `TD`). Every driver entered for the race has a result, also the ones that did not take the start */
  positionText: string;
  time: number | null;
  gridPosition: number | null;
  gridPenalty: string | null;
  laps: number | null;
  points: number | null;
  pointsCountForWDC: number;
  /** 0 if the result does not score for the Constructors' Championship (e.g. a non-eligible third car, a disqualified constructor), 1 otherwise. The championship itself is calculated by `/championships/{season}/constructors` */
  pointsCountForWCC: number;
  pointsGained: number | null;
  timePenalty: number | null;
  retirementReasonId: string | null;
}

export interface ResultStatuses {
  /** The code, as stored in `positionText` */
  code: ResultStatusCode;
  name: string;
  /** 1 if a result with this code counts as a race entry in the statistics (`races`) */
  raceEntry: number;
  /** 1 if the driver took the start of the race (`starts`) */
  started: number;
}

export interface RetirementReasons {
  id: string;
  name: string;
  category:
    'ACCIDENT' | 'DISQUALIFICATION' | 'DRIVER_HEALTH' | 'MECHANICAL' | 'OTHER';
}
