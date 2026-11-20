import type {
  CircuitLayoutCorners,
  CircuitLayoutSectors,
  CircuitLayouts,
  CircuitNames,
  Circuits
} from '../db/circuit.db';
import type { CircuitRecordStat } from '../enums/circuit.enums';
import type { CountryDTO } from './country.dto';

export type CircuitNameDTO = Omit<CircuitNames, 'circuitId'>;

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
