import { Except } from 'type-fest';
import { Country } from './country';

export type CircuitStorage = Except<Circuit, 'country'> & {
  countryId: string;
};

export class Circuit {
  id: string;
  name: string;
  fullName: string;
  previousNames: string;
  type: 'RACE' | 'ROAD' | 'STREET';
  placeName: string;
  country: Country;

  /** The latitude of the location */
  latitude: number;

  /** The longitude of the location */
  longitude: number | null;

  constructor(data: CircuitStorage, country: Country) {
    this.id = data.id;
    this.name = data.name;
    this.fullName = data.fullName;
    this.previousNames = data.previousNames;
    this.type = data.type;
    this.placeName = data.placeName;
    this.latitude = data.latitude;
    this.longitude = data.longitude;

    this.country = country;
  }
}
