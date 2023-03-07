import { Get, Path, Route, Tags } from 'tsoa';
import {
  EventDriverData,
  EventDriverDataInStorage
} from '../models/classes/eventDriverData/eventDriverData';
import { CompanyService } from './company.service';
import { DbService } from './db.service';
import { DriverService } from './driver.service';
import { EventService } from './event.service';
import { SeasonEntrantService } from './seasonEntrant.service';

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
      tyreManufacturer: null as any
    });
  }

  getEntrantInfo(eventId: string, driverId: string) {
    const eventEntrantsInDB = this.db
      .prepare('SELECT * FROM eventEntrants WHERE eventId = ? AND driverId = ?')
      .all(eventId, driverId) as EventDriverDataInStorage[];

    if (eventEntrantsInDB.length == 0) {
      throw new Error(
        `[IN EVENT -> ${eventId}] Can not find driver with id: ${driverId}`
      );
    }

    return this.instanciateNewClass(eventEntrantsInDB[0]);
  }

  /** Get all the drivers that has participated in a certain event, alongside their teams and other usefull info
   *
   * @param eventId The ID of the event to get its entrants */ @Get(
    '/{eventId}'
  )
  getEventEntrants(@Path() eventId: string) {
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

  private get companyService() {
    return new CompanyService();
  }

  private get seasonEntrantService() {
    return new SeasonEntrantService();
  }
}
