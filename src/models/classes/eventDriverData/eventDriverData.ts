import { Constructor } from '../constructor';
import { Driver } from '../driver';
import { EngineManufacturer } from '../engineManufacturer';
import { Event } from '../raceEvent';
import { TyreManufacturer } from '../tyreManufacturer';

export type EventDriverDataInStorage = {
  raceId: string;
  driverId: string;
};

/** Object that represents a driver and an event of his that has occurred within an event. For example, his results in one of the sessions, the time he has set in a race lap, or a pit stop. */
export abstract class EventDriverData {
  /** The full driver object. Got in the contructor */
  driver: Driver;

  /** The full race event object. Got in the contructor */
  race: Event;

  constructorData: Constructor;
  engine: EngineManufacturer;
  tyre: TyreManufacturer;

  constructor(data: EventDriverData) {
    this.driver = data.driver;
    this.race = data.race;
    this.constructorData = data.constructorData;
    this.engine = data.engine;
    this.tyre = data.tyre;
  }
}
