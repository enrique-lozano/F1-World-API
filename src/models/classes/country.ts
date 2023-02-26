import { Except } from 'type-fest';

export interface countryCommonNames {
  countryId: string;
  [lang: string]: string;
}

export interface countryOfficialNames {
  countryId: string;
  [lang: string]: string;
}

export type CountryInDB = Except<Country, 'commonName' | 'officialName'>;

export class Country {
  alpha2Code: string;
  alpha3Code: string;
  region: string;
  subregion: string;

  commonName: string;
  officialName: string;

  constructor(data: CountryInDB, commonNames: string, officialNames: string) {
    this.alpha2Code = data.alpha2Code;
    this.alpha3Code = data.alpha3Code;
    this.region = data.region;
    this.subregion = data.subregion;

    this.commonName = commonNames;
    this.officialName = officialNames;
  }
}
