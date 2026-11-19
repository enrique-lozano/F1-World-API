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

/**
 * Direction in which a circuit layout is driven (keep in sync with the `CHECK` constraint in `data/schema.sql`):
 * - `CLOCKWISE`: the cars turn to the right overall
 * - `ANTICLOCKWISE`: the cars turn to the left overall
 */
export type CircuitLayoutDirection =
  /** The cars turn to the right overall */
  | 'CLOCKWISE'
  /** The cars turn to the left overall */
  | 'ANTICLOCKWISE';

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

export type CircuitStatus = 'IN_USE' | 'HISTORIC';

export interface CircuitNames {
  circuitId: string;
  name: string;
  /** First year the name was used */
  fromYear: number;
  /** Last year the name was used, `null` if it still is the name */
  untilYear: number | null;
}

export type CircuitNameDTO = Omit<CircuitNames, 'circuitId'>;

export interface Circuits {
  id: string;
  name: string;
  fullName: string;
  type: CircuitType;
  /** Year of the first events held in the circuit */
  opened: number;
  /** `IN_USE` if the circuit still holds motorsport events of any category, `HISTORIC` if it is closed, abandoned, demolished or built over */
  status: CircuitStatus;
  placeName: string;
  countryId: string;
  latitude: string;
  longitude: string;
  /** IANA time zone of the circuit (`Europe/Madrid`), to show the sessions in the local time */
  timeZone: string;
}

// Separate type for the omitted attributes, see https://github.com/lukeautry/tsoa/issues/1238
type circuitOmittedAttr = 'countryId';

export interface CircuitDTO extends Omit<Circuits, circuitOmittedAttr> {
  country: CountryDTO | null;
  /** The names the circuit has been known by, from the oldest to the newest, with the years each one was used */
  names: CircuitNameDTO[];

  /** First season in which a race was held in the circuit */
  firstSeason: number | null;

  /** Last season in which a race was held in the circuit */
  lastSeason: number | null;

  /** Number of races held in the circuit */
  races: number;

  /** Number of layouts (configurations) that the circuit has had */
  layouts: number;

  /** The shape of the most recent layout of the circuit that has one, `null` if none has. Only returned if it is asked for in `include` (`include=geometry`), for drawing the circuit in a list */
  geometry: CircuitLayoutGeometry | null;
}

/** A stat in which an entity (driver, team or constructor) leads in a circuit */
export type CircuitRecordStat =
  'wins' | 'poles' | 'podiums' | 'fastestLaps' | 'points';

/** Who holds a record in a circuit and how many times (`points` are the total points scored) */
export interface CircuitRecordHolder {
  id: string;
  name: string;
  count: number;
}

/** The entities that have most wins, poles, podiums, fastest laps and points in a circuit, from best to worst */
export type CircuitRecordsDTO = Record<
  CircuitRecordStat,
  CircuitRecordHolder[]
>;

/** A configuration of a circuit: a new layout exists whenever the race lap (its length or its corner sequence) changes */
export interface CircuitLayouts {
  /** `<circuitId>-<first season it was used>`, e.g. `silverstone-2010` */
  id: string;
  circuitId: string;
  /** Only when the layout is known by a name (`Nordschleife`, `Outer`) */
  name: string | null;
  /** Length of the race lap, in metres */
  length: number;
  /** Official number of corners, `null` if unknown */
  turns: number | null;
  /** `null` if unknown */
  direction: CircuitLayoutDirection | null;
}

export interface CircuitLayoutGeometries {
  circuitLayoutId: string;
  /** JSON text of a `CircuitLayoutGeometry` */
  geojson: string;
}

// Separate type for the omitted attributes, see https://github.com/lukeautry/tsoa/issues/1238
type circuitLayoutOmittedAttr = 'circuitId';

export interface CircuitLayoutDTO extends Omit<
  CircuitLayouts,
  circuitLayoutOmittedAttr
> {
  circuit: CircuitDTO | null;

  /** First season in which a race was held on this layout */
  firstSeason: number;

  /** Last season in which a race was held on this layout. A layout can be used in non-consecutive seasons */
  lastSeason: number;

  /** 1 if the shape of the layout is known (`/circuit-layouts/{id}/geometry`), 0 otherwise */
  hasGeometry: number;

  /** The seasons in which a race was held on this layout, in order */
  seasons: number[];

  /** The fastest lap ever set in a race on this layout (races with lap times, 1996 onwards). `null` if there are none. Only returned if it is asked for in `include` (`include=lapRecord`), since it is expensive */
  lapRecord: CircuitLayoutRecordDTO | null;

  /** The fastest lap ever set in a qualifying session on this layout. `null` if there are none. Only returned if it is asked for in `include` (`include=trackRecord`), since it is expensive */
  trackRecord: CircuitLayoutRecordDTO | null;

  /** The corners of the layout, in the order of the race. Empty if they are not known yet */
  corners: CircuitLayoutCornerDTO[];

  /** Where the timing sectors 1 and 2 end (sector 3 ends at the start line), with the seasons in which each end is valid (normally every season the layout was raced; if the timing lines moved there is one entry per position). Empty if they are not known yet */
  sectors: CircuitLayoutSectorDTO[];
}

/** The fastest lap of a layout */
export interface CircuitLayoutRecordDTO {
  /** Milliseconds */
  time: number;
  driverId: string;
  driverName: string;
  season: number;
  round: number;
  /** Name of the event, e.g. `2023 Italian Grand Prix` */
  eventName: string;
}

export interface CircuitLayoutCorners {
  circuitLayoutId: string;
  /** Number of the corner in the official track map */
  number: number;
  /** Only when the corner is known by a name (`Eau Rouge`, `Parabolica`) */
  name: string | null;
  /** Metres from the start line, along the track in the direction of the race */
  distance: number;
}

export interface CircuitLayoutSectors {
  circuitLayoutId: string;
  /** The sector that ends at this distance: 1 or 2 */
  sector: number;
  /** First season in which the sector ended there */
  fromSeason: number;
  /** Last season in which the sector ended there */
  untilSeason: number;
  /** Metres from the start line, along the track in the direction of the race */
  distance: number;
}

export type CircuitLayoutCornerDTO = Omit<
  CircuitLayoutCorners,
  'circuitLayoutId'
>;

export type CircuitLayoutSectorDTO = Omit<
  CircuitLayoutSectors,
  'circuitLayoutId'
>;

/** A line of a layout: its `track` (a closed loop, in the direction of the race when the layout has one) or its `pit-lane` */
export interface CircuitLayoutLine {
  type: 'Feature';
  properties: {
    kind: 'track' | 'pit-lane';
    /** Only in the `track`: `true` if its first point is the start line, so the distances of the sectors and the corners can be placed on it */
    startLine?: boolean;
  };
  geometry: {
    type: 'LineString';
    /** `[longitude, latitude]` points (WGS84) */
    coordinates: number[][];
  };
}

/** The shape of a circuit layout, as a GeoJSON `FeatureCollection` */
export interface CircuitLayoutGeometry {
  type: 'FeatureCollection';
  features: CircuitLayoutLine[];
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
  /** Number of race entries: races (session `R`) with at least one result that is a position or a code with `raceEntry` = 1 in `/result-statuses` (it includes `DNS`, `DNQ`, `DNPQ`, `EX` and `DNP`, but not `WD` and `DNA`) */
  races: number;

  /** Number of races (session `R`) started: with at least one result that is a position or a code with `started` = 1 in `/result-statuses` (`DNF`, `NC`, `DSQ`) */
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
  wikiUrl: string | null;
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

/** An entrant that raced the chassis of a constructor */
export interface ConstructorEntrantUsage {
  entrant: EntrantDTO;

  /** Ranges of consecutive seasons in which the entrant raced the chassis of the constructor */
  ranges: { from: number; to: number }[];

  /** `true` if the entrant built the chassis itself (`WORKS`) in at least one of those seasons: the constructor is its own constructor */
  works: boolean;
}

/** A constructor whose chassis was raced by an entrant */
export interface EntrantConstructorUsage {
  chassisConstructor: ConstructorDTO;

  /** Ranges of consecutive seasons in which the entrant raced the chassis of the constructor */
  ranges: { from: number; to: number }[];

  /** `true` if the entrant built the chassis itself (`WORKS`) in at least one of those seasons: the constructor is its own constructor */
  works: boolean;
}

export interface EntrantChampionshipConstructor {
  id: string;
  name: string;
}

/** Result of the own constructor of an entrant in the Constructors' Championship of a season */
export interface EntrantChampionship {
  season: number;

  /** Position of the own constructor of the entrant in the standings (1 = champion) */
  position: number;

  /** Points in the Constructors' Championship */
  points: number;

  /** Races won by the cars of the constructor (with the engine brand of the row) */
  wins: number;

  /** The own constructor of the entrant that season */
  constructor: EntrantChampionshipConstructor;
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
  /** 1 if the driver was entered as a third, reserve or test driver: he can only take part in free practice, and his result of a GP without a race result is `TD` */
  testDriver: number;
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
  /** ISO 8601 date and time in UTC. The sessions of the oldest seasons only have the date, with the time `00:00:00Z`. `null` if unknown */
  startDateTime: string | null;
}

export interface SessionDTO extends Omit<Sessions, 'eventId'> {
  event: EventDTO | null;
}

export interface Events {
  id: string;
  grandPrixId: string;
  name: string;
  qualyFormat: QualyFormat;
  circuitLayoutId: string;
  scheduledLaps: number | null;
  posterURL: string | null;
}

/** An entry of an event (GP) and what it did in it */
export interface EventEntryDTO {
  /** The race result (a finishing position or a `ResultStatusCode`), `TD` for a test driver (`entry.testDriver`) that only took part in free practice, or `null` if the entry has results of other sessions but none in the race */
  participation: string | null;
  entry: EntryDTO;
}

/** The result of a driver in one event (GP), as in the season tables of Wikipedia: one row per race result, plus the events in which he was only a test driver */
export interface DriverEventResultDTO {
  eventId: string;
  season: number;
  round: number;
  grandPrixId: string;
  /** Country of the grand prix (alpha-2 code) */
  grandPrixCountryId: string | null;
  scheduledLaps: number | null;
  entryId: string;
  driverNumber: number;
  constructorId: string;
  constructorName: string;
  /** The finishing position or a `ResultStatusCode` (`TD` if he was a test driver, `entries.testDriver`, in a GP without a race result) */
  positionText: string;
  points: number | null;
  laps: number | null;
}

export interface EventDTO extends Omit<
  Events,
  'grandPrixId' | 'circuitLayoutId'
> {
  /** Season (year) of the event, deduced from its ID */
  season: number;

  /** Round of the event inside its season, deduced from its ID */
  round: number;

  grandPrix: GrandsPrixDTO | null;
  /** The circuit where the event was held. It is also available inside `circuitLayout`, with the rest of the data of the layout */
  circuit: CircuitDTO | null;
  /** The layout of the circuit that was raced in this event */
  circuitLayout: CircuitLayoutDTO | null;
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
  /** The finishing position (`"1"`, `"2"`...) or a `ResultStatusCode` */
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
  /** The finishing position (`"1"`, `"2"`...) or a `ResultStatusCode` (never `TD`). Every driver entered for the race has a result, also the ones that did not take the start */
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

/** The codes that a result can have in `positionText` instead of a finishing position (`"1"`, `"2"`...).
 *
 * These codes represent special result statuses such as Did Not Finish (DNF), Did Not Start (DNS), Disqualified (DSQ), etc.
 * Many of them are extracted from this Wikipedia legend: https://en.wikipedia.org/wiki/Template:F1_driver_results_legend_2 (some of them have been merged for this API)
 */
export enum ResultStatusCode {
  /** Took the start but retired and was not classified */
  DNF = 'DNF',
  /** Took the start and was running at the end but did not complete enough laps to be classified */
  NC = 'NC',
  /** Took the start but was disqualified from the race */
  DSQ = 'DSQ',
  /** Was due to take the start but did not take it: a failure or an accident on the way to the grid, the formation lap or the warm-up... (Tsunoda, Saudi Arabia 2022). In the old races, also the drivers that qualified and did not start, as the sources give it */
  DNS = 'DNS',
  /** Took part in qualifying but did not get a place on the grid */
  DNQ = 'DNQ',
  /** Took part in pre-qualifying but did not get through to qualifying */
  DNPQ = 'DNPQ',
  /** Was excluded from the event before the race */
  EX = 'EX',
  /** Was at the event but did not take part in any session */
  DNP = 'DNP',
  /** Was withdrawn from the event by the team or the driver, before the race: before the weekend, or after taking part in practice or qualifying (injured, ill, replaced, car not repaired...). E.g. Mick Schumacher, Saudi Arabia 2022, or Massa, Hungary 2017 */
  WD = 'WD',
  /** Was entered but did not arrive at the event */
  DNA = 'DNA',
  /** Only took part in free practice as a third or test driver. Calculated by the API: it is never stored in the race results */
  TD = 'TD'
}

export interface ResultStatuses {
  /** The code, as stored in `positionText` */
  code: ResultStatusCode;
  name: string;
  /** 1 if a result with this code counts as a race entry in the statistics (`races`) */
  raceEntry: number;
  /** 1 if the driver took the start of the race (`starts`) */
  started: number;
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

/** Sky and rain at the start of the race, as a person would describe it */
export enum Weather {
  /** Sunny, or with hardly any clouds */
  CLEAR = 'CLEAR',
  /** Sun and clouds */
  PARTLY_CLOUDY = 'PARTLY_CLOUDY',
  /** Mostly covered sky, no rain */
  CLOUDY = 'CLOUDY',
  /** Intermittent rain, with dry spells */
  SHOWERS = 'SHOWERS',
  /** Rain that does not stop the race */
  LIGHT_RAIN = 'LIGHT_RAIN',
  /** Rain heavy enough to compromise the race */
  HEAVY_RAIN = 'HEAVY_RAIN'
}

export interface WeatherPeriods {
  sessionId: string;
  /** Leader's lap on which this period starts. The period with `lapStart` 1 is the base of the session; later ones only exist when something changed */
  lapStart: number;
  weather: Weather | null;
  /** Celsius */
  airTemperature: number | null;
  /** Celsius */
  trackTemperature: number | null;
}

export interface WeatherPeriodDTO extends Omit<WeatherPeriods, 'sessionId'> {
  session: SessionDTO | null;
}

/** What happened to the pace of the race */
export enum RaceNeutralisationKind {
  /** The field follows a pace car and bunches up (F1 safety car, IndyCar full-course caution) */
  SAFETY_CAR = 'SAFETY_CAR',
  /** Every car slows down to a limit and keeps its gaps, without a pace car (F1 virtual safety car, FCY of WEC and Formula E) */
  FULL_COURSE_YELLOW = 'FULL_COURSE_YELLOW',
  /** The race is stopped */
  RED_FLAG = 'RED_FLAG'
}

export enum RaceNeutralisationCause {
  /** One or more cars crashed */
  ACCIDENT = 'ACCIDENT',
  /** Rain, mist or any other weather */
  WEATHER = 'WEATHER',
  /** Pieces of a car or of something else on the track */
  DEBRIS = 'DEBRIS',
  /** A car stopped in a dangerous place, or a vehicle on the track */
  STRANDED_CAR = 'STRANDED_CAR',
  /** The track or its barriers needed repair (loose drain cover, damaged barrier) */
  TRACK_DAMAGE = 'TRACK_DAMAGE',
  /** Any other cause (a person on the track, a vehicle...) */
  OTHER = 'OTHER'
}

export interface RaceNeutralisations {
  sessionId: string;
  /** Order inside the session */
  number: number;
  kind: RaceNeutralisationKind;
  /** Leader's lap on which it starts. 0 = before the first lap */
  lapStart: number;
  /** Leader's lap on which racing resumes (for a safety car, the lap after the one in which it comes in). `null` if unknown or if the race did not resume */
  lapEnd: number | null;
  /** Main cause. `null` if unknown */
  cause: RaceNeutralisationCause | null;
  /** `RED_FLAG` only: `Y`, `N`, `R` or `S`, as in the source. `N` is the race that ended with the stop */
  resumed: string | null;
  /** `RED_FLAG` only: who was not allowed to restart, as free text */
  excluded: string | null;
  description: string | null;
}

export interface RaceNeutralisationDTO extends Omit<
  RaceNeutralisations,
  'sessionId'
> {
  session: SessionDTO | null;
}

/** Tyre compound, relative to the dry ones of the weekend: `SOFT` is the softest. With only two dry compounds they are `SOFT` and `HARD` */
export enum TyreCompound {
  /** The softest dry compound of the weekend */
  SOFT = 'SOFT',
  /** The middle dry compound */
  MEDIUM = 'MEDIUM',
  /** The hardest dry compound of the weekend */
  HARD = 'HARD',
  /** For a damp track */
  INTERMEDIATE = 'INTERMEDIATE',
  /** For a very wet track */
  WET = 'WET'
}

export interface Stints {
  entryId: string;
  sessionId: string;
  /** 1, 2, 3... in order */
  stint: number;
  /** First lap on this set. The last lap is the `lapStart` of the next stint minus 1, or the laps of the race result for the last stint */
  lapStart: number;
  compound: TyreCompound | null;
  /** Laps already done on the set when the stint started (0 = new) */
  tyreAge: number | null;
}

export interface StintDTO extends Omit<Stints, 'sessionId' | 'entryId'> {
  session: SessionDTO | null;
  entry: EntryDTO | null;
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
  circuitLayouts: CircuitLayouts;
  circuitLayoutCorners: CircuitLayoutCorners;
  circuitLayoutGeometries: CircuitLayoutGeometries;
  circuitLayoutSectors: CircuitLayoutSectors;
  circuitNames: CircuitNames;
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
  raceNeutralisations: RaceNeutralisations;
  stints: Stints;
  weatherPeriods: WeatherPeriods;
  qualifyingResults: TimedSessionResults;
  raceResults: RaceResults;
  retirementReasons: RetirementReasons;
  resultStatuses: ResultStatuses;
  tyreManufacturers: TyreManufacturers;
}
