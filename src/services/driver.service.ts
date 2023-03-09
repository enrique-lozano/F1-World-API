import { Get, Path, Route, Tags } from 'tsoa';
import { Driver, DriverStorage } from './../models/classes/driver';
import { CountryService } from './countries.service';
import { DbService } from './db.service';

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

  private get countryService() {
    return new CountryService();
  }
}
