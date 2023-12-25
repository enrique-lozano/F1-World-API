import { SelectQueryBuilder } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam } from '../models/fields-filter';
import { DB, EventEntrantDTO } from '../models/types.dto';
import { DbService } from '../services/db.service';
import { CompanyService } from './company.controller';
import { DriverService } from './driver.controller';
import { SeasonEntrantService } from './seasonEntrant.controller';
import { TyreManufacturerService } from './tyreManufacturer.controller';

export class SessionEntrantService extends DbService {
  static getEventEntrantSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'sessionEntrants', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = [
      'chassisName',
      'id',
      'driverNumber',
      'engineName',
      'entrantName',
      'note'
    ] as const;

    return (qb as SelectQueryBuilder<DB, 'sessionEntrants', object>)
      .select(fieldsParam.getFilteredFieldsArray(allSingleFields))
      .$if(fieldsParam.shouldSelectObject('driver'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            DriverService.getDriversSelect(
              eb.selectFrom('drivers'),
              fieldsParam?.clone('driver')
            ).whereRef('sessionEntrants.driverId', '==', 'drivers.id')
          ).as('driver')
        )
      )
      .$if(fieldsParam.shouldSelectObject('seasonEntrant'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            SeasonEntrantService.getSeasonEntrantsSelect(
              eb.selectFrom('seasonEntrants')
            ).whereRef(
              'sessionEntrants.seasonEntrantId',
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
              eb.selectFrom('tyreManufacturers'),
              fieldsParam?.clone('tyreManufacturer')
            ).whereRef(
              'sessionEntrants.tyreManufacturerId',
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
              'sessionEntrants.chassisManufacturerId',
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
              'sessionEntrants.engineManufacturerId',
              '==',
              'companies.id'
            )
          ).as('engineManufacturer')
        )
      ) as SelectQueryBuilder<DB, 'sessionEntrants' | T, EventEntrantDTO>;
  }
}
