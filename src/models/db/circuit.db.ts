import type {
  CircuitLayoutDirection,
  CircuitStatus,
  CircuitType
} from '../enums/circuit.enums';

export interface CircuitNames {
  circuitId: string;
  name: string;
  /** First year the name was used */
  fromYear: number;
  /** Last year the name was used, `null` if it still is the name */
  untilYear: number | null;
}

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
