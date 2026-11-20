import type { EngineAspiration } from '../enums/engine.enums';

export interface EngineManufacturers {
  id: string;
  companyId: string;
  name: string;
  countryId: string;
}

export interface Engines {
  id: string;
  manufacturerId: string;
  /** Model (`DFV`, `EF4B`). `null` when only the specification is known */
  name: string | null;
  /** `V`, `L` (inline), `F` (flat), `W` or `H` */
  layout: string | null;
  cylinders: number | null;
  /** In litres (`3`, `1.5`) */
  displacement: number | null;
  aspiration: EngineAspiration;
  /** 1 if it has a hybrid system, 0 otherwise */
  hybrid: number;
}
