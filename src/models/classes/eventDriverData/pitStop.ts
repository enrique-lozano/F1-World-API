import { EventDriverData, EventDriverDataInStorage } from './eventDriverData';

export type PitStopStorage = EventDriverDataInStorage & PitStop;

export class PitStop extends EventDriverData {
  /** The lap of the race in which the pit stop happened */
  pitStopLap: number;

  /** Time of this pit stops in ms. The time is counted from the moment the pilot crosses the line of the pits until he leaves them. */
  time: number;

  /** The time of the day of the pit stop. */
  timeOfDay: string;

  /** Some notes about the pit stop. */
  annotation: string | null;

  constructor(data: PitStopStorage, completeObjects: EventDriverData) {
    super({ ...completeObjects });

    this.pitStopLap = data.pitStopLap;
    this.time = data.time;
    this.timeOfDay = data.timeOfDay;
    this.annotation = data.annotation;
  }
}
