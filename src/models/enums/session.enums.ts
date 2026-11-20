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
