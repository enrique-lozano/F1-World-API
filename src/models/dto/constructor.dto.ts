import type { Constructors } from '../db/constructor.db';
import type { CountryDTO } from './country.dto';
import type { EngineManufacturerDTO } from './engine.dto';

export interface ConstructorDTO extends Omit<Constructors, 'countryId'> {
  country: CountryDTO | null;

  /** First season in which the constructor had at least one entry, that is, a car with its chassis appears in the results of a race, qualifying or free practice session. `null` if there are no results of this constructor */
  firstSeason: number | null;

  /** Last season in which the constructor had at least one entry, that is, a car with its chassis appears in the results of a race, qualifying or free practice session. `null` if there are no results of this constructor */
  lastSeason: number | null;
}

export interface ConstructorEngineSupplier {
  /** Who built the engines */
  engineManufacturer: EngineManufacturerDTO;

  /** Ranges of consecutive seasons in which the engines were used by the cars of the constructor */
  ranges: { from: number; to: number }[];
}
