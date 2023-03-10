import { Get, Path, Query, Route, Tags } from 'tsoa';
import { Driver, DriverStorage } from './../models/classes/driver';
import { CountryService } from './countries.service';
import { DbService } from './db.service';
import { DriverStandingService } from './driver-standings.service';

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

  /** Get the seasons where a specific driver has participated in at least one race or event
   *
   * @param driverId The ID of the driver to get
   * @param from If 'entrants' is selected here, it will return also the season where the driver has participated in free practices and other not computable sessions for the WDC. The 'race' will only take into account the race entrants  @default races */ @Get(
    '{driverId}/seasons'
  )
  getDriverSeasons(
    @Path() driverId: string,
    @Query() from: 'entrants' | 'races' = 'races'
  ) {
    let tableToGet: 'eventEntrants' | 'raceResults' = 'raceResults';
    if (from == 'entrants') tableToGet = 'eventEntrants';

    return this.db
      .prepare(
        `SELECT cast(substr(eventId, 1, 4) as INT) as year FROM ${tableToGet} WHERE driverId = ? GROUP BY year`
      )
      .all(driverId)
      .map((x) => x['year']) as number[];
  }

  /** Get WDC results of this driver */ @Get('{driverId}/championship-results')
  getChampionshipResults(@Path() driverId: string) {
    const seasonsToGet = this.getDriverSeasons(driverId);

    const toReturn: {
      season: number;
      position: number;
      points: number;
    }[] = [];

    seasonsToGet.forEach((season) => {
      const results = this.championshipService.getDriverChampionshipResult(
        season,
        driverId
      );

      if (!toReturn) return;

      toReturn.push({
        season,
        points: results!.points,
        position: results!.position
      });
    });

    return { driver: this.getById(driverId), results: toReturn };
  }

  private get countryService() {
    return new CountryService();
  }

  private get championshipService() {
    return new DriverStandingService();
  }
}
