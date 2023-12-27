import { SelectQueryBuilder } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam } from '../../models/include-filter';
import { PageMetadata, Paginator } from '../../models/pagination';
import { SessionEntrantQueryParams } from '../../models/query-params';
import { Sorter } from '../../models/sorter';
import { DB, EventEntrantDTO, EventEntrants } from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { CompanyService } from '../company/company.service';
import { DriverService } from '../driver/driver.service';
import { SeasonEntrantService } from '../seasonEntrant.controller';
import { TyreManufacturerService } from '../tyreManufacturer.controller';
import { SessionEntrantController } from './sessionEntrant.controller';

export interface EntrantQueryParam
  extends Omit<SessionEntrantQueryParams, 'round' | 'session'> {}

export class SessionEntrantService
  extends DbService
  implements Pick<SessionEntrantController, 'get'>
{
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
      .select(
        fieldsParam.getFilteredFieldsArrayWithPrefix(
          allSingleFields,
          'sessionEntrants.'
        )
      )
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

  get(
    obj: EntrantQueryParam
  ): Promise<PageMetadata & { data: EventEntrantDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<EventEntrants>(obj.sort || 'sessionEntrants.id');

    const mainSelect = this.db
      .selectFrom('sessionEntrants')
      .$if(obj.driverId != undefined, (qb) =>
        qb
          .innerJoin('drivers', 'drivers.id', `sessionEntrants.driverId`)
          .where('sessionEntrants.driverId', '==', obj.driverId!)
      )
      .$if(obj.season != undefined, (qb) =>
        qb
          .innerJoin(
            'seasonEntrants',
            'seasonEntrants.id',
            `sessionEntrants.seasonEntrantId`
          )
          .where('seasonEntrants.season', '==', obj.season!)
      );

    return this.paginateSelect(
      mainSelect,
      SessionEntrantService.getEventEntrantSelect(
        mainSelect,
        IncludeParam.fromFieldQueryParam(obj)
      ),
      paginator,
      sorter
    ).executeTakeFirstOrThrow();
  }
}
