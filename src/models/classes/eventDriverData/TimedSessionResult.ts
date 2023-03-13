import { EventDriverData, EventDriverDataInStorage } from './eventDriverData';

/** Different types/names of timed sessions */
export type TimedSessions =
  | 'fp1'
  | 'fp2'
  | 'fp3'
  | 'fp4'
  | 'warm-up'
  | 'preQualifying';

export type TimedSessionResultStorage = EventDriverDataInStorage &
  Pick<TimedSessionResult, 'pos' | 'time' | 'laps'>;

/** Common interface for timed sessions, like free practices, warm ups... */
export class TimedSessionResult extends EventDriverData {
  pos: number;
  laps?: number;
  time: number;

  constructor(
    data: TimedSessionResultStorage,
    completeObjects: EventDriverData
  ) {
    super({ ...completeObjects });

    this.pos = data.pos;
    this.laps = data.laps;
    this.time = data.time;
  }
}
