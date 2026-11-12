/**
 * Type of circuit (keep in sync with the `CHECK` constraint in `data/schema.sql`):
 * - `RACE`: permanent racing circuit, purpose built
 * - `ROAD`: permanent course on public roads closed for the event (e.g. Reims, Pescara)
 * - `STREET`: temporary circuit built on city streets (e.g. Baku, Las Vegas)
 */
export type CircuitType =
  /** Permanent racing circuit, purpose built */
  | 'RACE'
  /** Permanent course laid out on public roads, closed for the event (e.g. Reims, Pescara) */
  | 'ROAD'
  /** Temporary circuit built on city streets (e.g. Baku, Las Vegas) */
  | 'STREET';

/** Relationship of the driver A *with respect to* the driver B. E.g. `PARENT` means "A is a parent of B" */
export type FamilyRelationship =
  | 'CHILD'
  | 'CHILD_IN_LAW'
  | 'GRANDCHILD'
  | 'GRANDPARENT'
  /** A is a sibling of B's grandparent (great-uncle/aunt) */
  | 'GRANDPARENTS_SIBLING'
  | 'HALF_SIBLING'
  | 'PARENT'
  | 'PARENT_IN_LAW'
  /** A is a sibling of B's parent (uncle/aunt) */
  | 'PARENTS_SIBLING'
  /** A is a child of B's parent's sibling (cousin) */
  | 'PARENTS_SIBLINGS_CHILD'
  | 'SIBLING'
  | 'SIBLING_IN_LAW'
  /** A is a child of B's sibling (nephew/niece) */
  | 'SIBLINGS_CHILD'
  | 'SIBLINGS_CHILD_IN_LAW'
  | 'SIBLINGS_GRANDCHILD';

/**
 * Format of the qualifying of an event:
 * - `AGGREGATE`: two sessions whose times are added up (2005)
 * - `ELIMINATION`: drivers are progressively eliminated during each session (2016)
 * - `FOUR_LAPS`: qualifying over four laps, as at the Indianapolis 500 (1950-1960)
 * - `KNOCKOUT`: Q1, Q2 and Q3 with the slowest drivers eliminated after each (2006 onwards)
 * - `ONE_LAP`: a single timed lap per driver (2003-2005)
 * - `ONE_SESSION`: one session where the best time counts (1996-2002)
 * - `SPRINT_RACE`: grid decided by a sprint race (2021-2022)
 * - `TWO_SESSION`: two sessions where the best time of both counts (1950-1995)
 */
export type QualyFormat =
  /** Two sessions whose times are added up (2005) */
  | 'AGGREGATE'
  /** Drivers are progressively eliminated during each session (2016) */
  | 'ELIMINATION'
  /** Qualifying over four laps, as used at the Indianapolis 500 (1950-1960) */
  | 'FOUR_LAPS'
  /** Q1, Q2 and Q3 sessions with the slowest drivers eliminated after each one (2006 onwards) */
  | 'KNOCKOUT'
  /** A single timed lap per driver (2003-2005) */
  | 'ONE_LAP'
  /** One session in which the best time counts (1996-2002) */
  | 'ONE_SESSION'
  /** Grid decided by a sprint race (2021-2022) */
  | 'SPRINT_RACE'
  /** Two sessions in which the best time of both counts (1950-1995) */
  | 'TWO_SESSION';

/**
 * Abbreviation of a session:
 * - `FP1`-`FP4`: free practices
 * - `WU`: warm-up
 * - `PQ`: pre-qualifying
 * - `Q`: single-session qualifying; `Q1`-`Q3`: parts of a knockout qualifying
 * - `SQ1`-`SQ3`: parts of the sprint qualifying
 * - `SR`: sprint race
 * - `R`: main race
 */
export type SessionAbbreviation =
  | 'FP1'
  | 'FP2'
  | 'FP3'
  | 'FP4'
  | 'WU'
  | 'PQ'
  | 'Q'
  | 'Q1'
  | 'Q2'
  | 'Q3'
  | 'SQ1'
  | 'SQ2'
  | 'SQ3'
  | 'SR'
  | 'R';

export interface Circuits {
  id: string;
  name: string;
  fullName: string;
  /** JSON array with the previous names of the circuit */
  previousNames: string | null;
  type: CircuitType;
  placeName: string;
  countryId: string;
  latitude: string | null;
  longitude: string | null;
}

// Separate type for the omitted attributes, see https://github.com/lukeautry/tsoa/issues/1238
type circuitOmittedAttr = 'countryId' | 'previousNames';

export interface CircuitDTO extends Omit<Circuits, circuitOmittedAttr> {
  country: CountryDTO | null;
  /** Previous names of the circuit, from the oldest to the newest */
  previousNames: string[] | null;
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

export interface ConstructorDTO extends Omit<Constructors, 'countryId'> {
  country: CountryDTO | null;

  /** First season in which the constructor had at least one entry, that is, a car with its chassis appears in the results of a race, qualifying or free practice session. `null` if there are no results of this constructor */
  firstSeason: number | null;

  /** Last season in which the constructor had at least one entry, that is, a car with its chassis appears in the results of a race, qualifying or free practice session. `null` if there are no results of this constructor */
  lastSeason: number | null;
}

/**
 * Career statistics of a driver or a constructor. Only the main races (session `R`) are taken into account, except for the points.
 */
export interface CareerStats {
  /** Number of races (session `R`) with at least one race result entry, classified or not (it includes `DNS`, `DNQ` and `WD` results) */
  races: number;

  /** Number of races (session `R`) with at least one result different from `DNS` (did not start), `DNQ` (did not qualify) and `WD` (withdrawn) */
  starts: number;

  /** Number of races (session `R`) won, that is, with a result in the first position (`positionText` = `1`). Sprint races are not counted */
  wins: number;

  /** Number of podium positions (`positionText` = `1`, `2` or `3`) obtained in the races (session `R`). A disqualified result is not a podium. For the constructors, each podium position of its cars counts */
  podiums: number;

  /** Number of races (session `R`) started from the first position of the grid (`gridPosition` = `1` in the race results). This is the pole position in almost all the races, but it may differ from the qualifying result if there were grid penalties */
  poles: number;

  /** Number of races (session `R`) in which the fastest lap of the race was set (`time` of the lap equal to the minimum of the session). Only available for the races with lap times (from 1996 onwards) */
  fastestLaps: number;

  /** Sum of the points of all the race results (main races and sprint races), including the results that were dropped from the championship. For the constructors this is the sum of the points of its drivers, which is not the same as the points of the constructors' championship */
  points: number;
}

export interface DriverCareerStats extends CareerStats {
  /** Number of drivers' world championships won, that is, seasons that the driver finished in the first position of the standings (see `/championships/{season}/drivers`). A season still in progress is counted if the driver leads it */
  championships: number;
}

export interface Countries {
  alpha2Code: string;
  alpha3Code: string;
  region: string;
  subregion: string | null;
}

export interface CountryDTO extends Countries {
  /** Name of the country in the requested `locale` (English by default) */
  commonName: string;
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

  /** First season in which the driver had at least one entry, that is, appears in the results of a race, qualifying or free practice session. `null` if there are no results of this driver.
   *
   * Only returned by the `/drivers` endpoints, not when the driver is nested inside other resources */
  firstSeason?: number | null;

  /** Last season in which the driver had at least one entry, that is, appears in the results of a race, qualifying or free practice session. `null` if there are no results of this driver.
   *
   * Only returned by the `/drivers` endpoints, not when the driver is nested inside other resources */
  lastSeason?: number | null;
}

export interface DriversFamilyRelationships {
  driverA: string;
  driverB: string;
  /** The relationship of `driverA` with respect to `driverB` */
  AisToB: FamilyRelationship;
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

export interface EventEntrantDTO extends Omit<
  EventEntrants,
  EventEntrantOmittedAttr
> {
  driver: DriverDTO | null;
  seasonEntrant: SeasonEntrantDTO | null;
  tyreManufacturer: TyreManufacturerDTO | null;
  chassisManufacturer: CompanyDTO | null;
  engineManufacturer: CompanyDTO | null;
}

export interface Sessions {
  id: string;
  eventId: string;
  abbreviation: SessionAbbreviation;
  startDateTime: string;
}

export interface SessionDTO extends Omit<Sessions, 'eventId'> {
  event: EventDTO | null;
}

export interface Events {
  id: string;
  grandPrixId: string;
  name: string;
  qualyFormat: QualyFormat;
  circuitId: string;
  scheduledLaps: number | null;
  posterURL: string | null;
}

export interface EventDTO extends Omit<Events, 'grandPrixId' | 'circuitId'> {
  /** Season (year) of the event, deduced from its ID */
  season: number;

  /** Round of the event inside its season, deduced from its ID */
  round: number;

  grandPrix: GrandsPrixDTO | null;
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
  entrantId: string;
  sessionId: string;
  lap: number;
  time: number | null;
  pos: number | null;
}

export interface LapTimeDTO extends Omit<LapTimes, 'sessionId' | 'entrantId'> {
  session: SessionDTO | null;
  entrant: EventEntrantDTO | null;
}

export interface PitStops {
  entrantId: string;
  sessionId: string;
  lap: number;
  time: number | null;
  timeOfDay: string | null;
  annotation: string | null;
}

export interface PitStopDTO extends Omit<PitStops, 'sessionId' | 'entrantId'> {
  session: SessionDTO | null;
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
  /** The finishing position (`"1"`, `"2"`...) or a code: `DNF`, `NC` (not classified), `DNS`, `DSQ`, `WD` (withdrawn), `DNQ` */
  positionText: string | null;
  laps: number | null;
  time: number | null;
}

export interface TimedSessionResultsDTO extends Omit<
  TimedSessionResults,
  'sessionId' | 'entrantId'
> {
  session: SessionDTO | null;
  entrant: EventEntrantDTO | null;
}

export interface RaceResults {
  entrantId: string;
  sessionId: string;
  positionOrder: number;
  /** The finishing position (`"1"`, `"2"`...) or a code: `DNF`, `NC` (not classified), `DNS`, `DSQ`, `WD` (withdrawn), `DNQ` */
  positionText: string;
  time: number | null;
  gridPosition: number | null;
  gridPenalty: string | null;
  laps: number | null;
  points: number | null;
  pointsCountForWDC: number;
  pointsGained: number | null;
  timePenalty: number | null;
  reasonRetired: string | null;
}

export interface RaceResultDTO extends Omit<
  RaceResults,
  'sessionId' | 'entrantId'
> {
  session: SessionDTO | null;
  entrant: EventEntrantDTO | null;
  /** 1 if the car was shared with other drivers (another result of this race has the same position and car number), 0 otherwise */
  sharedCar: number;
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

export interface TyreManufacturers {
  id: string;
  name: string;
  countryId: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface TyreManufacturerDTO extends Omit<
  TyreManufacturers,
  'countryId'
> {
  country: CountryDTO | null;
}

export interface DB {
  circuits: Circuits;
  companies: Companies;
  constructors: Constructors;
  countries: Countries;
  drivers: Drivers;
  driversFamilyRelationships: DriversFamilyRelationships;
  engineManufacturers: EngineManufacturers;
  sessionEntrants: EventEntrants;
  events: Events;
  sessions: Sessions;
  fpResults: TimedSessionResults;
  grandsPrix: GrandsPrix;
  lapTimes: LapTimes;
  pitStops: PitStops;
  previousNextConstructors: PreviousNextConstructors;
  qualifyingResults: TimedSessionResults;
  raceResults: RaceResults;
  redFlags: RedFlags;
  safetyCars: SafetyCars;
  seasonEntrants: SeasonEntrants;
  tyreManufacturers: TyreManufacturers;
}
