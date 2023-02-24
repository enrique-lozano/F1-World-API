import { PhotoSchema } from '../interfaces/photo.schema';
import { Modify } from './../../utils/types';

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
  Driver,
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

  /** The country of birth. */
  countryOfBirthCountryId: string;

  /** The nationality. */
  nationalityCountryId: string;

  /** The second nationality. */
  secondNationalityCountryId: string | null;

  photo?: PhotoSchema;

  constructor(data: DriverStorage) {
    this.id = data.id;
    this.name = data.name;
    this.fullName = data.fullName;
    this.lastName = data.lastName;
    this.firstName = data.firstName;
    this.gender = data.gender;
    this.permanentNumber = data.permanentNumber;
    this.abbreviation = data.abbreviation;
    this.placeOfBirth = data.placeOfBirth;
    this.countryOfBirthCountryId = data.countryOfBirthCountryId;
    this.nationalityCountryId = data.nationalityCountryId;
    this.secondNationalityCountryId = data.secondNationalityCountryId;

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
