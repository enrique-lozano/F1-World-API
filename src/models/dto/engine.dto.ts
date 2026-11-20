import type { EngineManufacturers, Engines } from '../db/engine.db';
import type { CountryDTO } from './country.dto';

export interface EngineManufacturerDTO extends Omit<
  EngineManufacturers,
  'countryId'
> {
  country: CountryDTO | null;
}

export interface EngineDTO extends Omit<Engines, 'manufacturerId'> {
  /** Who actually built the engine (Cosworth for the Ford DFV) */
  manufacturer: EngineManufacturerDTO | null;
}
