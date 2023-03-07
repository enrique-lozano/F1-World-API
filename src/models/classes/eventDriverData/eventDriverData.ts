import { Except } from 'type-fest';
import { Company } from '../company';
import { Driver } from '../driver';
import { Event } from '../event';
import { SeasonEntrant } from '../seasonEntrant';
import { TyreManufacturer } from '../tyreManufacturer';

export type EventDriverDataInStorage = Except<
  EventDriverData,
  | 'driver'
  | 'chassisManufacturer'
  | 'engineManufacturer'
  | 'seasonEntrant'
  | 'race'
  | 'tyreManufacturer'
> & {
  eventId: string;
  driverId: string;
  chassisManufacturerId: string;
  engineManufacturerId: string;
  seasonEntrantId: string;
  tyreManufacturerId: string;
};

/** Object that represents a driver and an event of his that has occurred within an event. For example, his results in one of the sessions, the time he has set in a race lap, or a pit stop. */
export class EventDriverData {
  /** The full driver object. Got in the contructor */
  driver: Driver;

  /** The full race event object. Got in the contructor */
  race: Event;

  seasonEntrant?: SeasonEntrant;
  entrantName: string;

  chassisManufacturer: Company;
  chassisName: string;

  engineManufacturer: Company;
  engineName?: string;

  tyreManufacturer: TyreManufacturer;

  driverNumber?: number;

  note?: string;

  constructor(data: EventDriverData) {
    this.driver = data.driver;
    this.race = data.race;
    this.chassisManufacturer = data.chassisManufacturer;
    this.engineManufacturer = data.engineManufacturer;
    this.tyreManufacturer = data.tyreManufacturer;
    this.seasonEntrant = data.seasonEntrant;

    this.entrantName = data.entrantName;
    this.chassisName = data.chassisName;
    this.engineName = data.engineName;

    this.driverNumber = data.driverNumber;

    this.note = data.note;
  }
}
