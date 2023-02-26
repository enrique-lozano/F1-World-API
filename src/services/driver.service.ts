import { Get, Path, Queries, Route, Tags } from 'tsoa';
import { LapTime } from '../models/classes/eventDriverData/lapTime';
import { Driver, DriverStorage } from './../models/classes/driver';
import { CountryService } from './countries.service';
import { DbService } from './db.service';
import { EventService } from './event.service';
import { RaceResultQueryParams, RaceResultService } from './raceResult.service';

@Route('/drivers')
@Tags('Drivers')
export class DriverService extends DbService {
  private instanciateNewClass(x: DriverStorage) {
    return new Driver(
      x,
      this.countryService.getById(x.countryOfBirthCountryId),
      this.countryService.getById(x.nationalityCountryId),
      x.secondNationalityCountryId
        ? this.countryService.getById(x.secondNationalityCountryId)
        : undefined
    );
  }

  @Get('/')
  get() {
    return this.db
      .prepare('SELECT * FROM drivers')
      .all()
      .map((x) => this.instanciateNewClass(x));
  }

  /** Get a driver by its ID
   *
   * @param driverId The ID of the driver to get */ @Get('{driverId}')
  getById(@Path() driverId: string) {
    return this.instanciateNewClass(
      this.db.prepare('SELECT * FROM drivers WHERE id = ?').get(driverId)
    );
  }

  @Get('{driverId}/fastest-laps')
  getFastestLaps(@Path() driverId: string) {
    const raceResults = this.getRaceResults(driverId, {
      pageSize: 100000
    }).items;

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
  getRaceResults(
    @Path() driverId: string,
    @Queries() params: RaceResultQueryParams
  ) {
    return this.raceResultService.getAllRaceResults({ driverId, ...params });
  }

  private get raceResultService() {
    return new RaceResultService();
  }

  private get eventService() {
    return new EventService();
  }

  private get countryService() {
    return new CountryService();
  }
}
