import { Except } from 'type-fest';
import { Country } from './country';

export type TyreManufacturerStorage = Except<TyreManufacturer, 'country'> & {
  countryId: string;
};

export class TyreManufacturer {
  /** The unique identifier. */
  id: string;

  /** The name. */
  name: string;

  country: Country;

  primaryColor: string;
  secondaryColor: string;

  constructor(data: TyreManufacturerStorage, country: Country) {
    this.id = data.id;
    this.name = data.name;

    this.primaryColor = data.primaryColor;
    this.secondaryColor = data.secondaryColor;

    this.country = country;
  }
}
