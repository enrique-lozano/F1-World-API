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
  Pick<TimedSessionResult, 'positionOrder' | 'positionText' | 'time' | 'laps'>;

/** Common interface for timed sessions, like free practices, warm ups... */
export class TimedSessionResult extends EventDriverData {
  positionOrder: number;
  positionText: string;
  laps?: number;
  time: number;

  constructor(
    data: TimedSessionResultStorage,
    completeObjects: EventDriverData
  ) {
    super({ ...completeObjects });

    this.positionOrder = data.positionOrder;
    this.positionText = data.positionText;
    this.laps = data.laps;
    this.time = data.time;
  }
}
