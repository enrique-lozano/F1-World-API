import {
  RaceResult,
  RaceResultStorage
} from './../models/classes/eventDriverData/raceResult';
import { DbService } from './db.service';
import { DriverService } from './driver.service';
import { EventService } from './event.service';

export class RaceResultService extends DbService {
  private instanciateNewClass(elToInstanciate: RaceResultStorage) {
    return new RaceResult(elToInstanciate, {
      driver: this.driverService.getById(elToInstanciate.driverId),
      race: this.eventService.getById(elToInstanciate.raceId),
      constructorData: undefined as any,
      engine: undefined as any,
      tyre: undefined as any
    });
  }

  getAllRaceResults() {
    return this.db
      .prepare('SELECT * FROM raceResults')
      .all()
      .map((x: RaceResultStorage) => this.instanciateNewClass(x));
  }

  getDriverRaceResults(driverId: string) {
    return this.db
      .prepare('SELECT * FROM raceResults WHERE driverId = ?')
      .all(driverId)
      .map((x: RaceResultStorage) => this.instanciateNewClass(x));
  }

  getRaceResults(raceId: string) {
    return this.db
      .prepare('SELECT * FROM raceResults WHERE raceId = ?')
      .all(raceId)
      .map((x: RaceResultStorage) => this.instanciateNewClass(x));
  }

  getRaceResult(driverId: string, raceId: string) {
    const raceResultInDB = this.db
      .prepare('SELECT * FROM raceResults WHERE driverId = ? AND raceId = ?')
      .get(driverId, raceId) as RaceResultStorage;

    return this.instanciateNewClass(raceResultInDB);
  }

  private get eventService() {
    return new EventService();
  }

  private get driverService() {
    return new DriverService();
  }
}
