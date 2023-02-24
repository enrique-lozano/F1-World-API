import { Except } from 'type-fest';
import { Modify } from './../../utils/types';
import { Circuit } from './circuit';
import { GrandPrix } from './grandPrix';

export enum qualyFormat {
  FOUR_LAPS = 'FOUR_LAPS',
  TWO_SESSION = 'TWO_SESSION',
  ONE_SESSION = 'ONE_SESSION',
  ONE_LAP = 'ONE_LAP',
  AGGREGATE = 'AGGREGATE',
  KNOCKOUT = 'KNOCKOUT',
  ELIMINATION = 'ELIMINATION',
  SPRINT_RACE = 'SPRINT_RACE'
}

export type RaceEventStorage = Modify<
  Except<Event, 'year' | 'round' | 'circuit' | 'grandPrix'> & {
    /** ID of the circuit of this event */ circuitId: string;
    /** ID of the grand prix of this event */ grandPrixId: string;
  },
  {
    raceDate: string;
  }
>;

export class Event {
  id: string;
  raceDate: Date;
  name: string;
  scheduledLaps: number;
  qualyFormat: qualyFormat;
  posterURL: string;

  /**
   * The year (or F1 session) of the event. Obtained from the ID in the constructor.
   */
  readonly year: number;

  /**
   * The round number of the event in its year. Obtained from the ID in the constructor.
   */
  readonly round: number;

  /** The full circuit object. Got in the contructor */
  circuit: Circuit;

  /** The full grand prix object. Got in the contructor */
  grandPrix: GrandPrix;

  constructor(data: RaceEventStorage, circuit: Circuit, grandPrix: GrandPrix) {
    this.id = data.id;
    this.posterURL = data.posterURL;
    this.qualyFormat = data.qualyFormat;
    this.scheduledLaps = data.scheduledLaps;
    this.raceDate = new Date(data.raceDate);
    this.name = data.name;

    this.year = Number(this.id.split('-')[0]);
    this.round = Number(this.id.split('-')[1]);

    this.circuit = circuit;
    this.grandPrix = grandPrix;
  }
}
