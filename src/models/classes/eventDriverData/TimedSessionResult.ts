import { EventDriverData, EventDriverDataInStorage } from './eventDriverData';

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
