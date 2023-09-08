export interface Circuits {
  id: string;
  name: string;
  fullName: string;
  previousNames: string | null;
  type: 'RACE' | 'ROAD' | 'STREET';
  placeName: string;
  countryId: string;
  latitude: string | null;
  longitude: string | null;
}

export interface CircuitDTO extends Omit<Circuits, 'countryId'> {
  country: CountryDTO | null;
}

export interface Companies {
  id: string;
  name: string;
  fullName: string;
  countryId: string;
  founder: string | null;
  yearFounded: number | null;
}

export interface Constructors {
  id: string;
  name: string;
  fullName: string;
  countryId: string;
  wikiUrl: string | null;
  summary: string | null;
  photo: string | null;
}

export interface Countries {
  alpha2Code: string;
  alpha3Code: string;
  region: string;
  subregion: string | null;
}

export interface CountryDTO extends Countries {
  commonName: string;
  officialName: string;
}

export interface CountriesCommonNames {
  countryId: string;
  en: string;
  ces: string | null;
  deu: string | null;
  est: string | null;
  fin: string | null;
  fra: string | null;
  hrv: string | null;
  hun: string | null;
  ita: string | null;
  jpn: string | null;
  kor: string | null;
  nld: string | null;
  per: string | null;
  pol: string | null;
  por: string | null;
  rus: string | null;
  slk: string | null;
  spa: string | null;
  swe: string | null;
  urd: string | null;
  zho: string | null;
  cym: string | null;
}

export interface CountriesOfficialNames {
  countryId: string;
  en: string;
  ces: string | null;
  deu: string | null;
  est: string | null;
  fin: string | null;
  fra: string | null;
  hrv: string | null;
  hun: string | null;
  ita: string | null;
  jpn: string | null;
  kor: string | null;
  nld: string | null;
  per: string | null;
  pol: string | null;
  por: string | null;
  rus: string | null;
  slk: string | null;
  spa: string | null;
  swe: string | null;
  urd: string | null;
  zho: string | null;
  cym: string | null;
}

export interface Drivers {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  fullName: string;
  abbreviation: string;
  permanentNumber: string | null;
  gender: string;
  dateOfBirth: string;
  dateOfDeath: string | null;
  placeOfBirth: string;
  countryOfBirthCountryId: string;
  nationalityCountryId: string;
  secondNationalityCountryId: string | null;
  photo: string | null;
}

export interface DriversFamilyRelationships {
  driverA: string;
  driverB: string;
  AisToB: string;
}

export interface EngineManufacturers {
  id: string;
  name: string;
  countryId: string;
}

export interface EventEntrants {
  eventId: string;
  driverId: string;
  driverNumber: number;
  seasonEntrantId: string | null;
  entrantName: string;
  chassisManufacturerId: string;
  chassisName: string | null;
  engineName: string | null;
  engineManufacturerId: string;
  tyreManufacturerId: string | null;
  note: string | null;
}

export interface Events {
  id: string;
  raceDate: string;
  grandPrixId: string;
  name: string;
  qualyFormat: string;
  circuitId: string;
  scheduledLaps: number | null;
  posterURL: string | null;
}

export interface Fp1Results {
  eventId: string;
  driverId: string;
  positionOrder: number | null;
  positionText: string | null;
  laps: number | null;
  time: number | null;
}

export interface Fp2Results {
  eventId: string;
  driverId: string;
  positionOrder: number | null;
  positionText: string | null;
  laps: number | null;
  time: number | null;
}

export interface Fp3Results {
  eventId: string;
  driverId: string;
  positionOrder: number | null;
  positionText: string | null;
  laps: number | null;
  time: number | null;
}

export interface Fp4Results {
  eventId: string;
  driverId: string;
  positionOrder: number | null;
  positionText: string | null;
  laps: number | null;
  time: number | null;
}

export interface GrandsPrix {
  id: string;
  name: string;
  fullName: string;
  shortName: string;
  countryId: string | null;
}

export interface LapTimes {
  driverId: string;
  eventId: string;
  lap: number;
  time: number | null;
  pos: number | null;
}

export interface PitStops {
  eventId: string;
  driverId: string;
  lap: number;
  time: number | null;
  timeOfDay: string | null;
  annotation: string | null;
}

export interface PreQualifyingResults {
  eventId: string;
  driverId: string;
  positionOrder: number | null;
  positionText: string | null;
  laps: number | null;
  time: number | null;
}

export interface PreviousNextConstructors {
  constructorId: string;
  parentConstructorId: string;
  yearFrom: number;
  yearTo: number | null;
}

export interface Qualifying1Results {
  eventId: string;
  driverId: string;
  positionOrder: number | null;
  positionText: string | null;
  laps: number | null;
  time: number | null;
}

export interface Qualifying2Results {
  eventId: string;
  driverId: string;
  positionOrder: number | null;
  positionText: string | null;
  laps: number | null;
  time: number | null;
}

export interface QualifyingResults {
  eventId: string;
  driverId: string;
  positionOrder: number | null;
  positionText: string | null;
  time: number | null;
  laps: number | null;
  q1Time: number | null;
  q2Time: number | null;
  q3Time: number | null;
}

export interface RaceResults {
  eventId: string;
  driverId: string;
  positionOrder: number;
  positionText: string;
  time: number | null;
  gridPosition: number | null;
  gridPenalty: string | null;
  laps: number | null;
  points: number | null;
  pointsCountForWDC: number | null;
  pointsGained: number | null;
  gap: string | null;
  timePenalty: number | null;
  reasonRetired: string | null;
}

export interface RedFlags {
  eventId: string;
  lap: number;
  incident: string;
  excluded: string | null;
  resumed: string | null;
}

export interface SafetyCars {
  eventId: string;
  deployed: number;
  fullLaps: number | null;
  retreated: number | null;
  cause: string | null;
}

export interface SeasonEntrants {
  id: string;
  season: number;
  name: string;
  countryId: string;
}

export interface SprintQualifyingResults {
  eventId: string;
  driverId: string;
  positionText: string;
  positionOrder: number;
  time: number | null;
  gridPos: number | null;
  laps: number | null;
  points: number | null;
  gap: string | null;
  timePenalty: number | null;
  reasonRetired: string | null;
}

export interface TyreManufacturers {
  id: string;
  name: string;
  countryId: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface WarmingUpResults {
  eventId: string;
  driverId: string;
  positionOrder: number | null;
  positionText: string | null;
  laps: number | null;
  time: number | null;
}

export interface WarmingUpResults2 {
  eventId: string;
  driverId: string;
  positionOrder: number | null;
  positionText: string | null;
  laps: number | null;
  time: number | null;
}

export interface DB {
  circuits: Circuits;
  companies: Companies;
  constructors: Constructors;
  countries: Countries;
  countriesCommonNames: CountriesCommonNames;
  countriesOfficialNames: CountriesOfficialNames;
  drivers: Drivers;
  driversFamilyRelationships: DriversFamilyRelationships;
  engineManufacturers: EngineManufacturers;
  eventEntrants: EventEntrants;
  events: Events;
  fp1_results: Fp1Results;
  fp2_results: Fp2Results;
  fp3_results: Fp3Results;
  fp4_results: Fp4Results;
  grandsPrix: GrandsPrix;
  lapTimes: LapTimes;
  pitStops: PitStops;
  preQualifyingResults: PreQualifyingResults;
  previousNextConstructors: PreviousNextConstructors;
  qualifying1_results: Qualifying1Results;
  qualifying2_results: Qualifying2Results;
  qualifyingResults: QualifyingResults;
  raceResults: RaceResults;
  redFlags: RedFlags;
  safetyCars: SafetyCars;
  seasonEntrants: SeasonEntrants;
  sprintQualifyingResults: SprintQualifyingResults;
  tyreManufacturers: TyreManufacturers;
  warming_up_results: WarmingUpResults2;
  warmingUpResults: WarmingUpResults;
}
