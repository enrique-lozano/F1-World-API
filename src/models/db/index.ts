import type { Chassis } from './chassis.db';
import type {
  CircuitLayoutCorners,
  CircuitLayoutGeometries,
  CircuitLayoutSectors,
  CircuitLayouts,
  CircuitNames,
  Circuits
} from './circuit.db';
import type { Companies } from './company.db';
import type { Constructors } from './constructor.db';
import type { Countries } from './country.db';
import type { Drivers, DriversFamilyRelationships } from './driver.db';
import type { EngineManufacturers, Engines } from './engine.db';
import type {
  EntrantSeasons,
  EntrantSuccessions,
  Entrants
} from './entrant.db';
import type { Entries } from './entry.db';
import type { Events, GrandsPrix } from './event.db';
import type { LapTimes, PitStops } from './lap.db';
import type { RaceNeutralisations } from './neutralisation.db';
import type {
  RaceResults,
  ResultStatuses,
  RetirementReasons
} from './result.db';
import type { Sessions, TimedSessionResults } from './session.db';
import type { Stints, TyreManufacturers } from './tyre.db';
import type { WeatherPeriods } from './weather.db';

export * from './chassis.db';
export * from './circuit.db';
export * from './company.db';
export * from './constructor.db';
export * from './country.db';
export * from './driver.db';
export * from './engine.db';
export * from './entrant.db';
export * from './entry.db';
export * from './event.db';
export * from './lap.db';
export * from './neutralisation.db';
export * from './result.db';
export * from './session.db';
export * from './tyre.db';
export * from './weather.db';

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
