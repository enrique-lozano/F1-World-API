import { Except } from 'type-fest';
import { Country } from './country';

export type SeasonEntrantStorage = Except<SeasonEntrant, 'country'> & {
  countryId: string;
};

export class SeasonEntrant {
  id: string;
  season: number;
  country: Country;

  constructor(data: SeasonEntrantStorage, country: Country) {
    this.id = data.id;
    this.season = data.season;

    this.country = country;
  }
}
