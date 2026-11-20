import type { FamilyRelationship, Gender } from '../enums/driver.enums';

export interface Drivers {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  fullName: string;
  abbreviation: string;
  permanentNumber: string | null;
  gender: Gender;
  dateOfBirth: string;
  dateOfDeath: string | null;
  placeOfBirth: string;
  countryOfBirthCountryId: string;
  nationalityCountryId: string;
  secondNationalityCountryId: string | null;
  wikiUrl: string | null;
  photo: string | null;
}

export interface DriversFamilyRelationships {
  driverA: string;
  driverB: string;
  /** The relationship of `driverA` with respect to `driverB` */
  AisToB: FamilyRelationship;
}
