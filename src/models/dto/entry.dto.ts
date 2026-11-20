import type { Entries } from '../db/entry.db';
import type { ChassisDTO } from './chassis.dto';
import type { DriverDTO } from './driver.dto';
import type { EngineDTO, EngineManufacturerDTO } from './engine.dto';
import type { EntrantSeasonDTO } from './entrant.dto';
import type { TyreManufacturerDTO } from './tyre.dto';

type EntryOmittedAttr =
  | 'entrantSeasonId'
  | 'driverId'
  | 'chassisId'
  | 'engineId'
  | 'engineBrandId'
  | 'tyreManufacturerId';

export interface EntryDTO extends Omit<Entries, EntryOmittedAttr> {
  driver: DriverDTO | null;
  entrantSeason: EntrantSeasonDTO | null;
  chassis: ChassisDTO | null;
  engine: EngineDTO | null;
  /** Brand the engine is sold under, when it is not its builder */
  engineBrand: EngineManufacturerDTO | null;
  tyreManufacturer: TyreManufacturerDTO | null;
}
