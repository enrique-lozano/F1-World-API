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

export interface CompanyDTO extends Omit<Companies, 'countryId'> {
  country: CountryDTO | null;
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

export type Gender = 'MALE' | 'FEMALE';

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
  photo: string | null;
}

// ! We should create a separete type to fix the issue: https://github.com/lukeautry/tsoa/issues/1238. If we put inside the Omit multiple lines, the swagger generator will not work
type driverOmittedAttr =
  | 'countryOfBirthCountryId'
  | 'nationalityCountryId'
  | 'secondNationalityCountryId';

export interface DriverDTO extends Omit<Drivers, driverOmittedAttr> {
  countryOfBirthCountry: CountryDTO | null;
  nationalityCountry: CountryDTO | null;
  secondNationalityCountry: CountryDTO | null;
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

type EventEntrantOmittedAttr =
  | 'seasonEntrantId'
  | 'driverId'
  | 'chassisManufacturerId'
  | 'engineManufacturerId'
  | 'tyreManufacturerId';

export interface EventEntrants {
  id: string;
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

export interface EventEntrantDTO
  extends Omit<EventEntrants, EventEntrantOmittedAttr> {
  driver: DriverDTO | null;
  seasonEntrant: SeasonEntrantDTO | null;
  tyreManufacturer: TyreManufacturerDTO | null;
  chassisManufacturer: CompanyDTO | null;
  engineManufacturer: CompanyDTO | null;
}

export interface Sessions {
  id: string;
  eventId: string;
  abbreviation: string;
  startDateTime: string;
}

export interface SessionDTO extends Omit<Sessions, 'eventId'> {
  event: EventDTO | null;
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

export interface EventDTO extends Omit<Events, 'grandPrixId' | 'circuitId'> {
  grandPrix: GrandsPrix | null;
  circuit: CircuitDTO | null;
}

export interface GrandsPrix {
  id: string;
  name: string;
  fullName: string;
  shortName: string;
  countryId: string | null;
}

export interface GrandsPrixDTO extends Omit<GrandsPrix, 'countryId'> {
  country: CountryDTO | null;
}

export interface LapTimes {
  eventId: string;
  entrantId: string;
  lap: number;
  time: number | null;
  pos: number | null;
}

export interface LapTimeDTO extends Omit<LapTimes, 'eventId' | 'entrantId'> {
  event: EventDTO | null;
  entrant: EventEntrantDTO | null;
}

export interface PitStops {
  entrantId: string;
  eventId: string;
  lap: number;
  time: number | null;
  timeOfDay: string | null;
  annotation: string | null;
}

export interface PitStopDTO extends Omit<PitStops, 'eventId' | 'entrantId'> {
  event: EventDTO | null;
  entrant: EventEntrantDTO | null;
}

export interface PreviousNextConstructors {
  constructorId: string;
  parentConstructorId: string;
  yearFrom: number;
  yearTo: number | null;
}

export interface TimedSessionResults {
  entrantId: string;
  sessionId: string;
  positionOrder: number | null;
  positionText: string | null;
  laps: number | null;
  time: number | null;
}

export interface TimedSessionResultsDTO
  extends Omit<TimedSessionResults, 'sessionId' | 'entrantId'> {
  session: EventDTO | null;
  entrant: EventEntrantDTO | null;
}

export interface QualifyingResults {
  entrantId: string;
  eventId: string;
  positionOrder: number | null;
  positionText: string | null;
  time: number | null;
  laps: number | null;
  q1Time: number | null;
  q2Time: number | null;
  q3Time: number | null;
}

export interface QualifyingResultDTO
  extends Omit<QualifyingResults, 'eventId' | 'entrantId'> {
  event: EventDTO | null;
  entrant: EventEntrantDTO | null;
}

export interface RaceResults {
  entrantId: string;
  sessionId: string;
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

export interface RaceResultDTO
  extends Omit<RaceResults, 'sessionId' | 'entrantId'> {
  session: EventDTO | null;
  entrant: EventEntrantDTO | null;
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

export interface SeasonEntrantDTO extends Omit<SeasonEntrants, 'countryId'> {
  country: CountryDTO | null;
}

export interface SprintQualifyingResults {
  sessionId: string;
  entrantId: string;
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

export interface SprintQualifyingResultDTO
  extends Omit<SprintQualifyingResults, 'sessionId' | 'entrantId'> {
  session: SessionDTO | null;
  entrant: EventEntrantDTO | null;
}

export interface TyreManufacturers {
  id: string;
  name: string;
  countryId: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface TyreManufacturerDTO
  extends Omit<TyreManufacturers, 'countryId'> {
  country: CountryDTO | null;
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
  sessions: Sessions;
  fpResults: TimedSessionResults;
  grandsPrix: GrandsPrix;
  lapTimes: LapTimes;
  pitStops: PitStops;
  preQualifyingResults: TimedSessionResults;
  previousNextConstructors: PreviousNextConstructors;
  qualifying1_results: TimedSessionResults;
  raceResults: RaceResults;
  redFlags: RedFlags;
  safetyCars: SafetyCars;
  seasonEntrants: SeasonEntrants;
  sprintQualifyingResults: SprintQualifyingResults;
  tyreManufacturers: TyreManufacturers;
}
