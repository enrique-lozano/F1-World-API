export type GrandPrixStorage = GrandPrix;

export class GrandPrix {
  /** The unique identifier. */
  id: string;

  /** The name. */
  name: string;

  fullName: string;
  shortName: string;
  countryId: string;

  constructor(data: GrandPrixStorage) {
    this.id = data.id;
    this.name = data.name;
    this.countryId = data.countryId;
    this.fullName = data.fullName;
    this.shortName = data.shortName;
  }
}
