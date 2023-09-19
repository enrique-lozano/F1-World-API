import { SelectQueryBuilder } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { DbService } from '../services/db.service';
import { DB, EventEntrantDTO } from './../models/types.dto';
import { CompanyService } from './company.controller';
import { DriverService } from './driver.controller';
import { SeasonEntrantService } from './seasonEntrant.controller';
import { TyreManufacturerService } from './tyreManufacturer.controller';

export class EventEntrantService extends DbService {
  static getEventEntrantSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'eventEntrants', {}>
  ) {
    return (qb as SelectQueryBuilder<DB, 'eventEntrants', {}>)
      .select([
        'chassisName',
        'id',
        'driverNumber',
        'engineName',
        'entrantName',
        'note'
      ])
      .select((eb) => [
        jsonObjectFrom(
          DriverService.getDriversSelect(eb.selectFrom('drivers')).whereRef(
            'eventEntrants.driverId',
            '==',
            'drivers.id'
          )
        ).as('driver'),
        jsonObjectFrom(
          SeasonEntrantService.getSeasonEntrantsSelect(
            eb.selectFrom('seasonEntrants')
          ).whereRef('eventEntrants.seasonEntrantId', '==', 'seasonEntrants.id')
        ).as('seasonEntrant'),
        jsonObjectFrom(
          TyreManufacturerService.getTyreManufacturerSelect(
            eb.selectFrom('tyreManufacturers')
          ).whereRef(
            'eventEntrants.tyreManufacturerId',
            '==',
            'tyreManufacturers.id'
          )
        ).as('tyreManufacturer'),
        jsonObjectFrom(
          CompanyService.getCompaniesSelect(
            eb.selectFrom('companies')
          ).whereRef(
            'eventEntrants.chassisManufacturerId',
            '==',
            'companies.id'
          )
        ).as('chassisManufacturer'),
        jsonObjectFrom(
          CompanyService.getCompaniesSelect(
            eb.selectFrom('companies')
          ).whereRef('eventEntrants.engineManufacturerId', '==', 'companies.id')
        ).as('engineManufacturer')
      ]) as SelectQueryBuilder<DB, 'eventEntrants' | T, EventEntrantDTO>;
  }
}
