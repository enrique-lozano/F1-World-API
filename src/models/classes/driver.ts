import { Except } from 'type-fest';
import { PhotoSchema } from '../interfaces/photo.schema';
import { Modify } from './../../utils/types';
import { Country } from './country';

/**
 * The family relationship type.
 */
export type FamilyRelationshipType =
  | 'PARENT'
  | 'PARENT_IN_LAW'
  | 'CHILD'
  | 'CHILD_IN_LAW'
  | 'SPOUSE'
  | 'SIBLING'
  | 'SIBLING_IN_LAW'
  | 'HALF_SIBLING'
  | 'GRANDPARENT'
  | 'GRANDCHILD'
  | 'PARENTS_SIBLING'
  | 'PARENTS_SIBLINGS_CHILD'
  | 'SIBLINGS_CHILD'
  | 'SIBLINGS_CHILD_IN_LAW'
  | 'SIBLINGS_GRANDCHILD'
  | 'GRANDPARENTS_SIBLING';

/** Driver object stored in the DB */
export type DriverStorage = Modify<
  Except<
    Driver,
    'countryOfBirth' | 'nationalityCountry' | 'secondNationalityCountry'
  > & {
    /** The country of birth. */
    countryOfBirthCountryId: string;

    /** The nationality. */
    nationalityCountryId: string;

    /** The second nationality. */
    secondNationalityCountryId: string | null;
  },
  {
    dateOfBirth: string;
    dateOfDeath: string | null;
  }
>;

/** Object that contains all the basic info about a driver */
export class Driver {
  /** The unique identifier. */
  id: string;

  /** The name. */
  name: string;

  /** The first name. */
  firstName: string;

  /** The last name. */
  lastName: string;

  /** The full name. */
  fullName: string;

  /** The abbreviation. */
  abbreviation: string;

  /** The permanent number. */
  permanentNumber: string | null;

  /** The gender. */
  gender: 'MALE' | 'FEMALE';

  /** The date of birth. */
  dateOfBirth: Date;

  /** The date of death. */
  dateOfDeath: Date | null;

  /** The place of birth. */
  placeOfBirth: string;

  countryOfBirth: Country;
  nationalityCountry: Country;
  secondNationalityCountry?: Country;

  photo?: PhotoSchema;

  constructor(
    data: DriverStorage,
    countryOfBirth: Country,
    nationalityCountry: Country,
    secondNationalityCountry?: Country
  ) {
    this.id = data.id;
    this.name = data.name;
    this.fullName = data.fullName;
    this.lastName = data.lastName;
    this.firstName = data.firstName;
    this.gender = data.gender;
    this.permanentNumber = data.permanentNumber;
    this.abbreviation = data.abbreviation;
    this.placeOfBirth = data.placeOfBirth;

    this.countryOfBirth = countryOfBirth;
    this.nationalityCountry = nationalityCountry;
    this.secondNationalityCountry = secondNationalityCountry;

    this.dateOfBirth = new Date(data.dateOfBirth);
    this.dateOfDeath = data.dateOfDeath ? new Date(data.dateOfDeath) : null;

    //  if (data.photo) this.photo = new Photo(data.photo);
  }
}

export type DriverFamilyRelationshipInStorage = Modify<
  DriverFamilyRelationship,
  {
    /** ID of a driver in the database */ driverA: string;
    /** ID of a driver in the database */ driverB: string;
  }
>;

export class DriverFamilyRelationship {
  driverA: Driver;
  driverB: Driver;
  AisToB: FamilyRelationshipType;

  constructor(
    data: DriverFamilyRelationshipInStorage,
    driverA: Driver,
    driverB: Driver
  ) {
    this.AisToB = data.AisToB;
    this.driverA = driverA;
    this.driverB = driverB;
  }
}
