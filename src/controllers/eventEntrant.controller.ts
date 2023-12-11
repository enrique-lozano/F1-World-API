import { SelectQueryBuilder } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { FieldsParam } from '../models/fields-filter';
import { DbService } from '../services/db.service';
import { DB, EventEntrantDTO } from './../models/types.dto';
import { CompanyService } from './company.controller';
import { DriverService } from './driver.controller';
import { SeasonEntrantService } from './seasonEntrant.controller';
import { TyreManufacturerService } from './tyreManufacturer.controller';

export class EventEntrantService extends DbService {
  static getEventEntrantSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'eventEntrants', {}>,
    fieldsParam?: FieldsParam
  ) {
    fieldsParam ??= new FieldsParam();

    const allSingleFields = [
      'chassisName',
      'id',
      'driverNumber',
      'engineName',
      'entrantName',
      'note'
    ] as const;

    return (qb as SelectQueryBuilder<DB, 'eventEntrants', {}>)
      .select(
        fieldsParam.getFilteredFieldsArray(allSingleFields) ?? allSingleFields
      )
      .$if(fieldsParam.shouldSelectObject('driver'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            DriverService.getDriversSelect(
              eb.selectFrom('drivers'),
              fieldsParam?.clone('driver')
            ).whereRef('eventEntrants.driverId', '==', 'drivers.id')
          ).as('driver')
        )
      )
      .$if(fieldsParam.shouldSelectObject('seasonEntrant'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            SeasonEntrantService.getSeasonEntrantsSelect(
              eb.selectFrom('seasonEntrants')
            ).whereRef(
              'eventEntrants.seasonEntrantId',
              '==',
              'seasonEntrants.id'
            )
          ).as('seasonEntrant')
        )
      )
      .$if(fieldsParam.shouldSelectObject('tyreManufacturer'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            TyreManufacturerService.getTyreManufacturerSelect(
              eb.selectFrom('tyreManufacturers')
            ).whereRef(
              'eventEntrants.tyreManufacturerId',
              '==',
              'tyreManufacturers.id'
            )
          ).as('tyreManufacturer')
        )
      )
      .$if(fieldsParam.shouldSelectObject('chassisManufacturer'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            CompanyService.getCompaniesSelect(
              eb.selectFrom('companies')
            ).whereRef(
              'eventEntrants.chassisManufacturerId',
              '==',
              'companies.id'
            )
          ).as('chassisManufacturer')
        )
      )
      .$if(fieldsParam.shouldSelectObject('engineManufacturer'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            CompanyService.getCompaniesSelect(
              eb.selectFrom('companies')
            ).whereRef(
              'eventEntrants.engineManufacturerId',
              '==',
              'companies.id'
            )
          ).as('engineManufacturer')
        )
      ) as SelectQueryBuilder<DB, 'eventEntrants' | T, EventEntrantDTO>;
  }
}
