import { SelectQueryBuilder } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam } from '../../models/include-filter';
import { PageMetadata, Paginator } from '../../models/pagination';
import { Sorter } from '../../models/sorter';
import { DB, Entries, EntryDTO } from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { ChassisService } from '../chassis/chassis.service';
import { DriverService } from '../driver/driver.service';
import {
  EngineManufacturerService,
  EngineService
} from '../engine/engine.service';
import { EntrantSeasonService } from '../entrant/entrantSeason.service';
import { TyreManufacturerService } from '../tyreManufacturer.controller';
import type { EntryController, EntryQueryParams } from './entry.controller';

export class EntryService
  extends DbService
  implements Pick<EntryController, 'get'>
{
  static getEntrySelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'entries', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = [
      'id',
      'driverNumber',
      'entrantName',
      'note'
    ] as const;

    return (qb as SelectQueryBuilder<DB, 'entries', object>)
      .select(
        fieldsParam.getFilteredFieldsArrayWithPrefix(
          allSingleFields,
          'entries.'
        )
      )
      .$if(fieldsParam.shouldSelectObject('driver'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            DriverService.getDriversSelect(
              eb.selectFrom('drivers'),
              fieldsParam?.clone('driver')
            ).whereRef('entries.driverId', '==', 'drivers.id')
          ).as('driver')
        )
      )
      .$if(fieldsParam.shouldSelectObject('entrantSeason'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            EntrantSeasonService.getEntrantSeasonsSelect(
              eb.selectFrom('entrantSeasons'),
              fieldsParam?.clone('entrantSeason')
            ).whereRef('entries.entrantSeasonId', '==', 'entrantSeasons.id')
          ).as('entrantSeason')
        )
      )
      .$if(fieldsParam.shouldSelectObject('chassis'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            ChassisService.getChassisSelect(
              eb.selectFrom('chassis'),
              fieldsParam?.clone('chassis')
            ).whereRef('entries.chassisId', '==', 'chassis.id')
          ).as('chassis')
        )
      )
      .$if(fieldsParam.shouldSelectObject('engine'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            EngineService.getEnginesSelect(
              eb.selectFrom('engines'),
              fieldsParam?.clone('engine')
            ).whereRef('entries.engineId', '==', 'engines.id')
          ).as('engine')
        )
      )
      .$if(fieldsParam.shouldSelectObject('engineBrand'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            EngineManufacturerService.getEngineManufacturersSelect(
              eb.selectFrom('engineManufacturers'),
              fieldsParam?.clone('engineBrand')
            ).whereRef('entries.engineBrandId', '==', 'engineManufacturers.id')
          ).as('engineBrand')
        )
      )
      .$if(fieldsParam.shouldSelectObject('tyreManufacturer'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            TyreManufacturerService.getTyreManufacturerSelect(
              eb.selectFrom('tyreManufacturers'),
              fieldsParam?.clone('tyreManufacturer')
            ).whereRef(
              'entries.tyreManufacturerId',
              '==',
              'tyreManufacturers.id'
            )
          ).as('tyreManufacturer')
        )
      ) as SelectQueryBuilder<DB, 'entries' | T, EntryDTO>;
  }

  get(obj: EntryQueryParams): Promise<PageMetadata & { data: EntryDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<Entries>(obj.sort || 'entries.id');

    const mainSelect = this.db
      .selectFrom('entries')
      .$if(obj.driverId != undefined, (qb) =>
        qb.where('entries.driverId', '==', obj.driverId!)
      )
      .$if(obj.entrantId != undefined || obj.season != undefined, (qb) =>
        qb
          .innerJoin(
            'entrantSeasons',
            'entrantSeasons.id',
            'entries.entrantSeasonId'
          )
          .$if(obj.entrantId != undefined, (qb) =>
            qb.where('entrantSeasons.entrantId', '==', obj.entrantId!)
          )
          .$if(obj.season != undefined, (qb) =>
            qb.where('entrantSeasons.season', '==', obj.season!)
          )
      )
      .$if(obj.constructorId != undefined, (qb) =>
        qb
          .innerJoin('chassis', 'chassis.id', 'entries.chassisId')
          .where('chassis.constructorId', '==', obj.constructorId!)
      );

    return this.paginateSelect(
      mainSelect,
      EntryService.getEntrySelect(
        mainSelect,
        IncludeParam.fromFieldQueryParam(obj)
      ),
      paginator,
      sorter
    ).executeTakeFirstOrThrow();
  }
}
