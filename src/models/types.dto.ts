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
  /** The company behind the constructor (`/companies`). Today it is the same ID as the constructor */
  companyId: string;
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

export interface ConstructorCareerStats extends CareerStats {
  /** Number of Constructors' Championships won, that is, seasons in which a car of the constructor (with any engine) finished in the first position of the calculated standings (see `/championships/{season}/constructors`). Only available from 1958 */
  championships: number;
}

export interface ConstructorEngineSupplier {
  /** Who built the engines */
  engineManufacturer: EngineManufacturerDTO;

  /** Ranges of consecutive seasons in which the engines were used by the cars of the constructor */
  ranges: { from: number; to: number }[];
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

export interface Chassis {
  id: string;
  constructorId: string;
  /** Model of the chassis (`012`, `MP4/4`). `null` when it is unknown */
  name: string | null;
}

export interface ChassisDTO extends Omit<Chassis, 'constructorId'> {
  /** The constructor that designed the chassis, whatever the entrant declared */
  chassisConstructor: ConstructorDTO | null;
}

export interface EngineManufacturers {
  id: string;
  companyId: string;
  name: string;
  countryId: string;
}

export interface EngineManufacturerDTO extends Omit<
  EngineManufacturers,
  'countryId'
> {
  country: CountryDTO | null;
}

/**
 * - `NATURALLY_ASPIRATED`: no forced induction
 * - `SUPERCHARGED`: with a compressor (`c` in the old names)
 * - `TURBOCHARGED`: with a turbo (`t` in the old names)
 */
export type EngineAspiration =
  'NATURALLY_ASPIRATED' | 'SUPERCHARGED' | 'TURBOCHARGED';

export interface Engines {
  id: string;
  manufacturerId: string;
  /** Model (`DFV`, `EF4B`). `null` when only the specification is known */
  name: string | null;
  /** `V`, `L` (inline), `F` (flat), `W` or `H` */
  layout: string | null;
  cylinders: number | null;
  /** In litres (`3`, `1.5`) */
  displacement: number | null;
  aspiration: EngineAspiration;
  /** 1 if it has a hybrid system, 0 otherwise */
  hybrid: number;
}

export interface EngineDTO extends Omit<Engines, 'manufacturerId'> {
  /** Who actually built the engine (Cosworth for the Ford DFV) */
  manufacturer: EngineManufacturerDTO | null;
}

export interface Entrants {
  id: string;
  /** Clean name of the team, without sponsors */
  name: string;
  companyId: string | null;
}

export interface EntrantDTO extends Omit<Entrants, 'companyId'> {
  company: CompanyDTO | null;

  /** Nationality of the licence of the entrant in its most recent season with a known licence. The licence can change over the years (see `/entrants/{id}/seasons`) */
  licenceCountry: CountryDTO | null;

  /** First season in which the entrant had at least one entry. `null` if it has no entries */
  firstSeason: number | null;

  /** Last season in which the entrant had at least one entry. `null` if it has no entries */
  lastSeason: number | null;

  /** Registered name (sponsors included) of the most recent entry of the entrant */
  latestEntrantName: string | null;
}

export interface EntrantSeasons {
  id: string;
  entrantId: string;
  season: number;
  ownConstructorId: string | null;
  licenceCountryId: string | null;
}

type EntrantSeasonOmittedAttr =
  'entrantId' | 'ownConstructorId' | 'licenceCountryId';

export interface EntrantSeasonDTO extends Omit<
  EntrantSeasons,
  EntrantSeasonOmittedAttr
> {
  entrant: EntrantDTO | null;

  /** `WORKS` if the entrant builds its own chassis that season (`ownConstructor`), `CUSTOMER` if it uses the chassis of others */
  type: 'WORKS' | 'CUSTOMER';

  /** The constructor whose chassis the entrant builds itself that season. `null` for the customer teams */
  ownConstructor: ConstructorDTO | null;

  /** Nationality of the national authority (ASN) that issued the licence of the entrant that season. It is not where the team is based or owned. `null` when unknown */
  licenceCountry: CountryDTO | null;
}

/**
 * - `RENAME`: same organisation, new name
 * - `TAKEOVER`: sold or bought
 * - `MERGER`
 * - `REVIVAL`: returns after a gap
 */
export type SuccessionType = 'MERGER' | 'RENAME' | 'REVIVAL' | 'TAKEOVER';

export interface EntrantSuccessions {
  predecessorId: string;
  successorId: string;
  year: number;
  type: SuccessionType;
}

export interface EntrantLineageItem {
  entrant: EntrantDTO;

  /** First season of the successor in the handover */
  year: number;

  type: SuccessionType;
}

export interface EntrantLineage {
  /** Previous entrants, from the closest to the oldest. `year` and `type` describe the handover from that entrant to the next one in the chain */
  predecessors: EntrantLineageItem[];

  /** Following entrants, from the closest to the most recent */
  successors: EntrantLineageItem[];
}

/** A registered name of an entrant and the seasons in which it was used */
export interface EntrantNameUsage {
  name: string;
  /** Consecutive seasons ranges, e.g. `[{from: 1950, to: 1960}, {from: 1990, to: 1996}]` */
  ranges: { from: number; to: number }[];
}

type EntryOmittedAttr =
  | 'entrantSeasonId'
  | 'driverId'
  | 'chassisId'
  | 'engineId'
  | 'engineBrandId'
  | 'tyreManufacturerId';

export interface Entries {
  id: string;
  driverId: string;
  driverNumber: number;
  entrantSeasonId: string;
  /** Registered name of the entrant, sponsors included. It can change within a season */
  entrantName: string;
  chassisId: string;
  engineId: string;
  /** Brand the engine is sold under when it is not its builder (Ford for a Cosworth). `null` if it is the builder */
  engineBrandId: string | null;
  tyreManufacturerId: string | null;
  note: string | null;
}

export interface EntryDTO extends Omit<Entries, EntryOmittedAttr> {
  driver: DriverDTO | null;
  entrantSeason: EntrantSeasonDTO | null;
  chassis: ChassisDTO | null;
  engine: EngineDTO | null;
  /** Brand the engine is sold under, when it is not its builder */
  engineBrand: EngineManufacturerDTO | null;
  tyreManufacturer: TyreManufacturerDTO | null;
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
  entryId: string;
  sessionId: string;
  lap: number;
  time: number | null;
  /** Position of the driver in the race at the end of this lap */
  position: number | null;
}

export interface LapTimeDTO extends Omit<LapTimes, 'sessionId' | 'entryId'> {
  session: SessionDTO | null;
  entry: EntryDTO | null;
}

export interface PitStops {
  entryId: string;
  sessionId: string;
  lap: number;
  time: number | null;
  timeOfDay: string | null;
  annotation: string | null;
}

export interface PitStopDTO extends Omit<PitStops, 'sessionId' | 'entryId'> {
  session: SessionDTO | null;
  entry: EntryDTO | null;
}

export interface TimedSessionResults {
  entryId: string;
  sessionId: string;
  positionOrder: number | null;
  /** The finishing position (`"1"`, `"2"`...) or a code: `DNF`, `NC` (not classified), `DNS`, `DSQ`, `WD` (withdrawn), `DNQ` */
  positionText: string | null;
  laps: number | null;
  time: number | null;
}

export interface TimedSessionResultsDTO extends Omit<
  TimedSessionResults,
  'sessionId' | 'entryId'
> {
  session: SessionDTO | null;
  entry: EntryDTO | null;
}

export interface RaceResults {
  entryId: string;
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
  /** 0 if the result does not score for the Constructors' Championship (e.g. a non-eligible third car, a disqualified constructor), 1 otherwise. The championship itself is calculated by `/championships/{season}/constructors` */
  pointsCountForWCC: number;
  pointsGained: number | null;
  timePenalty: number | null;
  retirementReasonId: string | null;
}

export interface RetirementReasons {
  id: string;
  name: string;
  category:
    'ACCIDENT' | 'DISQUALIFICATION' | 'DRIVER_HEALTH' | 'MECHANICAL' | 'OTHER';
}

export interface RaceResultDTO extends Omit<
  RaceResults,
  'sessionId' | 'entryId'
> {
  /** Why the car did not finish (or was disqualified / did not start). `null` if it finished */
  reasonRetired: string | null;
  /** Category of the `reasonRetired` (`MECHANICAL`, `ACCIDENT`, `DRIVER_HEALTH`, `DISQUALIFICATION` or `OTHER`) */
  retirementCategory: RetirementReasons['category'] | null;
  session: SessionDTO | null;
  entry: EntryDTO | null;
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

export interface TyreManufacturers {
  id: string;
  companyId: string;
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
  chassis: Chassis;
  circuits: Circuits;
  companies: Companies;
  constructors: Constructors;
  countries: Countries;
  drivers: Drivers;
  driversFamilyRelationships: DriversFamilyRelationships;
  engineManufacturers: EngineManufacturers;
  engines: Engines;
  entrantSeasons: EntrantSeasons;
  entrantSuccessions: EntrantSuccessions;
  entrants: Entrants;
  entries: Entries;
  events: Events;
  sessions: Sessions;
  fpResults: TimedSessionResults;
  grandsPrix: GrandsPrix;
  lapTimes: LapTimes;
  pitStops: PitStops;
  qualifyingResults: TimedSessionResults;
  raceResults: RaceResults;
  redFlags: RedFlags;
  retirementReasons: RetirementReasons;
  safetyCars: SafetyCars;
  tyreManufacturers: TyreManufacturers;
}
