import { Except } from 'type-fest';
import { Country } from './country';

export type ConstructorStorage = Except<Constructor, 'country'> & {
  countryId: string;
};

export class Constructor {
  id: string;
  name: string;
  fullName: string;
  country: Country;
  photo: string | null;
  summary: string | null;
  wikiUrl: string | null;

  constructor(data: ConstructorStorage, country: Country) {
    this.id = data.id;
    this.name = data.name;
    this.fullName = data.fullName;
    this.wikiUrl = data.wikiUrl;
    this.photo = data.photo;

    if (data.summary) {
      this.summary = data.summary
        .split('\\n')
        .map((s) => `<p>${s}</p>`)
        .join('')
        .replaceAll('<p></p>', '');
    } else {
      this.summary = null;
    }

    this.country = country;
  }
}
