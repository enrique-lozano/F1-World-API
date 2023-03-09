import { Route, Tags } from 'tsoa';
import {
  EventDriverData,
  EventDriverDataInStorage
} from '../models/classes/eventDriverData/eventDriverData';
import { CompanyService } from './company.service';
import { DbService } from './db.service';
import { DriverService } from './driver.service';
import { EventService } from './event.service';
import { SeasonEntrantService } from './seasonEntrant.service';
import { TyreManufacturerService } from './tyreManufacturer.service';

export interface EventEntrantQueryParams {
  /** If specified, the call will return only the results where the company that has this ID appears as the chassis manufacturer */
  chassisManufacturerId?: string;

  /** If specified, the call will return only the results where the company that has this ID appears as the  engine manufacturer */
  engineManufacturerId?: string;

  /** If specified, it will return only results relative to the event that has this ID */
  eventId?: string;

  /** If specified, it will return only results relative to this year's events */
  year?: number;

  /** If specified, it will return only results relative to the pilot having this ID */
  driverId?: string;
}

@Route('eventEntrants')
@Tags('EventEntrants')
export class EventEntrantService extends DbService {
  private instanciateNewClass(eventEntrant: EventDriverDataInStorage) {
    return new EventDriverData({
      ...eventEntrant,
      seasonEntrant: this.seasonEntrantService.getFromDB(
        eventEntrant.seasonEntrantId
      ),
      driver: this.driverService.getById(eventEntrant.driverId),
      race: this.eventService.getById(eventEntrant.eventId),
      chassisManufacturer: this.companyService.getById(
        eventEntrant.chassisManufacturerId
      ),
      engineManufacturer: this.companyService.getById(
        eventEntrant.engineManufacturerId
      ),
      tyreManufacturer: this.tyreManufacturerService.getById(
        eventEntrant.tyreManufacturerId
      )
    });
  }

  getEntrantInfo(data: EventDriverDataInStorage) {
    return this.instanciateNewClass(data);
  }

  getEventEntrants(eventId: string) {
    const eventEntrantsInDB = this.db
      .prepare('SELECT * FROM eventEntrants WHERE eventId = ?')
      .all(eventId) as EventDriverDataInStorage[];

    return eventEntrantsInDB.map((x) => this.instanciateNewClass(x));
  }

  private get eventService() {
    return new EventService();
  }

  private get driverService() {
    return new DriverService();
  }

  private get tyreManufacturerService() {
    return new TyreManufacturerService();
  }

  private get companyService() {
    return new CompanyService();
  }

  private get seasonEntrantService() {
    return new SeasonEntrantService();
  }
}
