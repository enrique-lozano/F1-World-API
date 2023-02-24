export type CircuitStorage = Circuit;

export class Circuit {
  id: string;
  name: string;
  fullName: string;
  previousNames: string;
  type: 'RACE' | 'ROAD' | 'STREET';
  placeName: string;
  countryId: string;

  /** The latitude of the location */
  latitude: number;

  /** The longitude of the location */
  longitude: number;

  constructor(data: CircuitStorage) {
    this.id = data.id;
    this.name = data.name;
    this.fullName = data.fullName;
    this.previousNames = data.previousNames;
    this.type = data.type;
    this.placeName = data.placeName;
    this.countryId = data.countryId;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
  }
}
