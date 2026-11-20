export interface Constructors {
  id: string;
  /** The company behind the constructor (`/companies`). Today it is the same ID as the constructor */
  companyId: string;
  name: string;
  fullName: string;
  countryId: string;
  wikiUrl: string | null;
  photo: string | null;
}
