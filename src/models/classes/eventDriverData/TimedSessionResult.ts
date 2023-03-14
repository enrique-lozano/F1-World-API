import { EventDriverData, EventDriverDataInStorage } from './eventDriverData';

/** Different types/names of timed sessions */
export type TimedSessions =
  | 'fp1'
  | 'fp2'
  | 'fp3'
  | 'fp4'
  | 'warm-up'
  | 'preQualifying'
  | 'qualifying1'
  | 'qualifying2';

export type TimedSessionResultStorage = EventDriverDataInStorage &
  Pick<
    TimedSessionResult,
    'positionOrder' | 'positionText' | 'position' | 'time' | 'laps'
  >;

/** Common interface for timed sessions, like free practices, warm ups... */
export class TimedSessionResult extends EventDriverData {
  positionOrder: number;
  positionText: string;
  position: number | null;

  /** Number of laps completed in this session. */ laps?: number;

  /** Time that gives the driver his/her position at the end of this session. */
  time: number;

  constructor(
    data: TimedSessionResultStorage,
    completeObjects: EventDriverData
  ) {
    super({ ...completeObjects });

    this.positionOrder = data.positionOrder;
    this.positionText = data.positionText;
    this.position = data.position;

    this.laps = data.laps;
    this.time = data.time;
  }
}
