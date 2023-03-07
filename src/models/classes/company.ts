import { Except } from 'type-fest';
import { Country } from './country';

export type CompanyStorage = Except<Company, 'country'> & {
  countryId: string;
};

export class Company {
  id: string;
  name: string;
  fullName: string;
  country: Country;
  founder?: string;
  yearFounded?: number;

  constructor(data: CompanyStorage, country: Country) {
    this.id = data.id;
    this.name = data.name;
    this.fullName = data.fullName;

    this.founder = data.founder;
    this.yearFounded = data.yearFounded;

    this.country = country;
  }
}
