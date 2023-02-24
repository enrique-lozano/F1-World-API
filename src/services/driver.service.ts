import { Get, Path, Route, Tags } from 'tsoa';
import { LapTime } from '../models/classes/eventDriverData/lapTime';
import { Driver } from './../models/classes/driver';
import { DbService } from './db.service';
import { EventService } from './event.service';
import { RaceResultService } from './raceResult.service';

@Route('/drivers')
@Tags('Drivers')
export class DriverService extends DbService {
  @Get('/')
  get() {
    return this.db
      .prepare('SELECT * FROM drivers')
      .all()
      .map((x) => new Driver(x));
  }

  @Get('{driverId}')
  getById(@Path() driverId: string) {
    return new Driver(
      this.db.prepare('SELECT * FROM drivers WHERE id = ?').get(driverId)
    );
  }

  @Get('{driverId}/fastest-laps')
  getFastestLaps(@Path() driverId: string) {
    const raceResults = this.raceResultService.getDriverRaceResults(driverId);

    let fastestLaps: LapTime[] = [];

    for (const race of raceResults) {
      const raceFastestLap = this.eventService.getEventFastestLap(race.race.id);

      if (raceFastestLap.driver.id == driverId) {
        fastestLaps.push(raceFastestLap);
      }
    }

    return fastestLaps;
  }

  @Get('{driverId}/race-results')
  getRaceResults(@Path() driverId: string) {
    return this.raceResultService.getDriverRaceResults(driverId);
  }

  private get raceResultService() {
    return new RaceResultService();
  }

  private get eventService() {
    return new EventService();
  }
}
