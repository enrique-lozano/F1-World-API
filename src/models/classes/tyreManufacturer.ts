export type TyreManufacturerStorage = TyreManufacturer;

export class TyreManufacturer {
  /** The unique identifier. */
  id: string;

  /** The name. */
  name: string;

  countryId: string;

  primaryColor: string;
  secondaryColor: string;

  constructor(data: TyreManufacturerStorage) {
    this.id = data.id;
    this.name = data.name;
    this.countryId = data.countryId;

    this.primaryColor = data.primaryColor;
    this.secondaryColor = data.secondaryColor;
  }
}
