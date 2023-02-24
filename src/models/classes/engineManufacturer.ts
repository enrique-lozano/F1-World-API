export type EngineManufacturerStorage = EngineManufacturer;

export class EngineManufacturer {
  /** The unique identifier. */
  id: string;

  /** The name. */
  name: string;

  countryId: string;

  constructor(data: EngineManufacturerStorage) {
    this.id = data.id;
    this.name = data.name;
    this.countryId = data.countryId;
  }
}
