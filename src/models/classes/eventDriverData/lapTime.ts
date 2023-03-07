import { EventDriverData, EventDriverDataInStorage } from './eventDriverData';

export type LapTimeStorage = Pick<
  EventDriverDataInStorage,
  'eventId' | 'driverId'
> &
  Pick<LapTime, 'pos' | 'time' | 'lap'>;

export class LapTime extends EventDriverData {
  /** The position of the driver in the lap */
  pos: number;

  /** Time of this lap in ms */
  time: number;

  /** The lap number */
  lap: number;

  constructor(data: LapTimeStorage, completeObjects: EventDriverData) {
    super({ ...completeObjects });

    this.lap = data.lap;
    this.time = data.time;
    this.pos = data.pos;
  }
}
