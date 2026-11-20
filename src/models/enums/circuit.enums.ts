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

export type CircuitStatus = 'IN_USE' | 'HISTORIC';

/** A stat in which an entity (driver, team or constructor) leads in a circuit */
export type CircuitRecordStat =
  'wins' | 'poles' | 'podiums' | 'fastestLaps' | 'points';
