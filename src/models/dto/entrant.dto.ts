import type { EntrantSeasons, Entrants } from '../db/entrant.db';
import type { SuccessionType } from '../enums/entrant.enums';
import type { CompanyDTO } from './company.dto';
import type { ConstructorDTO } from './constructor.dto';
import type { CountryDTO } from './country.dto';

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
