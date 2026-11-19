import type Database from 'better-sqlite3';
import * as fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import { tracksDirectory } from './constants';

/** Maximum difference between the length of the shape and the official length of the layout */
const MAX_LENGTH_DIFFERENCE = 0.05;

/** How far a corner can be from the track, in metres: it marks the apex, so it has to be on the line */
const MAX_CORNER_OFFSET = 20;

/** How far a point of the pit lane can be from the track, in metres */
const MAX_PIT_LANE_OFFSET = 150;

/** How far the start and the end of the pit speed limit can be from the pit lane, in metres */
const MAX_PIT_LIMIT_OFFSET = 10;

/** The biggest turn at one point of a line: more than this is a spike, not a corner (hairpins are made of several points) */
const MAX_TURN_DEGREES = 150;

/** How far the track can be from the location of its circuit, in metres: the location is a point of the circuit, not an exact one */
const MAX_CIRCUIT_OFFSET = 1000;

type Position = [number, number];

/** What the CSV tables say about the layout and its circuit, to compare it with the shape (all optional: unknown values are not checked) */
export interface LayoutExpectations {
  /** `turns` of the layout: the official number of corners, `null` when unknown */
  turns: number | null;
  /** `[longitude, latitude]` of the circuit: every circuit has one */
  location: Position;
}

/** Distance in metres between two `[lon, lat]` points (haversine) */
function distance([lon1, lat1]: Position, [lon2, lat2]: Position) {
  const rad = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) *
      Math.cos(lat2 * rad) *
      Math.sin(((lon2 - lon1) * rad) / 2) ** 2;

  return 2 * 6371008.8 * Math.asin(Math.sqrt(a));
}

/** Distance in metres from a point to a line of points (segments of a few tens of metres, so a flat projection is enough) */
function distanceToLine(point: Position, line: Position[]) {
  const k = Math.cos((point[1] * Math.PI) / 180);
  const local = ([lon, lat]: Position) => [
    (lon - point[0]) * k * 111320,
    (lat - point[1]) * 110574
  ];
  let best = Infinity;

  for (let i = 1; i < line.length; i++) {
    const [a, b] = [local(line[i - 1]), local(line[i])];
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const span = dx * dx + dy * dy;
    const t = span
      ? Math.min(Math.max(-(a[0] * dx + a[1] * dy) / span, 0), 1)
      : 0;
    best = Math.min(best, Math.hypot(a[0] + dx * t, a[1] + dy * t));
  }

  return best;
}

const isPosition = (x: unknown): x is Position =>
  Array.isArray(x) &&
  x.length === 2 &&
  typeof x[0] === 'number' &&
  typeof x[1] === 'number' &&
  Math.abs(x[0]) <= 180 &&
  Math.abs(x[1]) <= 90;

/**
 * Checks a `<circuitLayoutId>.geojson` file and returns the problems found:
 * a `FeatureCollection` with exactly one `track` (a closed `LineString` whose
 * length is close to the one of the layout) and, optionally, one `pit-lane` and
 * the `corner`s (a `Point` on the track with its `number` and, if it has one, its `name`).
 * With `expected` (what the CSV tables say), it also checks that the corners are as many as the `turns` of
 * the layout and that the track is near the location of its circuit.
 */
export function validateGeometry(
  geojson: unknown,
  layoutLength: number,
  expected: LayoutExpectations
): string[] {
  const problems: string[] = [];
  const collection = geojson as {
    type?: string;
    features?: {
      type?: string;
      properties?: {
        kind?: string;
        startLine?: unknown;
        number?: unknown;
        name?: unknown;
        sector?: unknown;
        from?: unknown;
        until?: unknown;
      };
      geometry?: { type?: string; coordinates?: unknown };
    }[];
  };

  if (collection?.type !== 'FeatureCollection' || !collection.features) {
    return ['it is not a FeatureCollection'];
  }

  const byKind = (kind: string) =>
    collection.features!.filter((f) => f.properties?.kind === kind);
  const [track, pitLane, corners, sectors, limitStart, limitEnd] = [
    byKind('track'),
    byKind('pit-lane'),
    byKind('corner'),
    byKind('sector'),
    byKind('pit-limit-start'),
    byKind('pit-limit-end')
  ];

  if (track.length !== 1) problems.push('it needs exactly one "track" feature');
  if (pitLane.length > 1) problems.push('it has more than one "pit-lane"');
  const startLine = track[0]?.properties?.startLine;
  if (startLine !== undefined && startLine !== true) {
    problems.push('"startLine" of the "track" can only be true');
  }
  if (
    collection.features.length !==
    track.length +
      pitLane.length +
      corners.length +
      sectors.length +
      limitStart.length +
      limitEnd.length
  ) {
    problems.push(
      'every feature needs properties.kind: "track", "pit-lane", "corner", "sector", "pit-limit-start" or "pit-limit-end"'
    );
  }
  if (limitStart.length > 1 || limitEnd.length > 1) {
    problems.push('there can be one "pit-limit-start" and one "pit-limit-end"');
  }
  if (limitStart.length + limitEnd.length > 0 && pitLane.length === 0) {
    problems.push('the pit limits need a "pit-lane"');
  }
  if (limitStart.length !== limitEnd.length) {
    problems.push('"pit-limit-start" and "pit-limit-end" go together');
  }
  for (const limit of [...limitStart, ...limitEnd]) {
    if (
      limit.geometry?.type !== 'Point' ||
      !isPosition(limit.geometry.coordinates)
    ) {
      problems.push(
        `a "${limit.properties!.kind}" is not a Point of [lon, lat]`
      );
    }
  }
  if (corners.length + sectors.length > 0 && startLine !== true) {
    problems.push(
      'the corners and the sectors need a "track" with "startLine": true'
    );
  }
  for (const sector of sectors) {
    const { sector: end, from, until } = sector.properties!;
    const isSeason = (x: unknown) =>
      Number.isInteger(x) && (x as number) >= 1950;

    if (
      sector.geometry?.type !== 'Point' ||
      !isPosition(sector.geometry.coordinates)
    ) {
      problems.push('a "sector" is not a Point of [lon, lat]');
    }
    if (end !== 1 && end !== 2) {
      problems.push('a "sector" needs "sector": 1 or 2 (where it ends)');
    }
    for (const [key, value] of [
      ['from', from],
      ['until', until]
    ]) {
      if (value !== undefined && !isSeason(value)) {
        problems.push(`"${key}" of a sector is not a season`);
      }
    }
    if (
      isSeason(from) &&
      isSeason(until) &&
      (from as number) > (until as number)
    ) {
      problems.push(`a sector of ${end} goes from ${from} until ${until}`);
    }
  }
  const numbers = new Set<unknown>();
  for (const corner of corners) {
    const { number, name } = corner.properties!;
    const coordinates = corner.geometry?.coordinates;

    if (corner.geometry?.type !== 'Point' || !isPosition(coordinates)) {
      problems.push('a "corner" is not a Point of [lon, lat]');
    }
    if (!Number.isInteger(number) || (number as number) < 1) {
      problems.push('a "corner" needs a "number", a positive integer');
    } else if (numbers.has(number)) {
      problems.push(`corner ${number} is repeated`);
    }
    numbers.add(number);
    if (name !== undefined && (typeof name !== 'string' || !name)) {
      problems.push(`the name of corner ${number} is not a text`);
    }
  }

  for (const feature of [...track, ...pitLane]) {
    const kind = feature.properties!.kind;
    const coordinates = feature.geometry?.coordinates;

    if (
      feature.geometry?.type !== 'LineString' ||
      !Array.isArray(coordinates) ||
      coordinates.length < 2 ||
      !coordinates.every(isPosition)
    ) {
      problems.push(`"${kind}" is not a LineString of [lon, lat] points`);
    }
  }

  if (problems.length > 0) return problems;

  const points = track[0].geometry!.coordinates as Position[];
  const first = points[0];
  const last = points[points.length - 1];

  if (first[0] !== last[0] || first[1] !== last[1]) {
    problems.push(
      'the "track" is not closed (its last point is not the first)'
    );
  }

  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += distance(points[i - 1], points[i]);
  }

  if (Math.abs(length - layoutLength) / layoutLength > MAX_LENGTH_DIFFERENCE) {
    problems.push(
      `the "track" is ${Math.round(length)} m long, too far from the ${layoutLength} m of the layout`
    );
  }

  for (const feature of [track[0], ...pitLane]) {
    const line = feature.geometry!.coordinates as Position[];
    const kind = feature.properties!.kind;
    const metres = ([lon, lat]: Position, [lon2, lat2]: Position) => [
      (lon2 - lon) * Math.cos((lat * Math.PI) / 180),
      lat2 - lat
    ];

    for (let i = 1; i < line.length; i++) {
      if (line[i][0] === line[i - 1][0] && line[i][1] === line[i - 1][1]) {
        problems.push(`the "${kind}" repeats its point ${i}`);
      }
    }
    for (let i = 1; i < line.length - 1; i++) {
      const [a, b] = [
        metres(line[i - 1], line[i]),
        metres(line[i], line[i + 1])
      ];
      const turn = Math.abs(
        (Math.atan2(a[0] * b[1] - a[1] * b[0], a[0] * b[0] + a[1] * b[1]) *
          180) /
          Math.PI
      );
      if (turn > MAX_TURN_DEGREES) {
        problems.push(
          `the "${kind}" doubles back on itself at its point ${i} (${Math.round(turn)} degrees)`
        );
      }
    }
  }

  if (pitLane.length === 1) {
    const offsets = (pitLane[0].geometry!.coordinates as Position[]).map(
      (point) => distanceToLine(point, points)
    );
    if (Math.max(...offsets) > MAX_PIT_LANE_OFFSET) {
      problems.push(
        `the "pit-lane" goes ${Math.round(Math.max(...offsets))} m away from the "track"`
      );
    }
  }

  // The ends of the speed limit are on the pit lane
  if (pitLane.length === 1) {
    const lane = pitLane[0].geometry!.coordinates as Position[];
    for (const limit of [...limitStart, ...limitEnd]) {
      const away = distanceToLine(
        limit.geometry!.coordinates as Position,
        lane
      );
      if (away > MAX_PIT_LIMIT_OFFSET) {
        problems.push(
          `the "${limit.properties!.kind}" is ${Math.round(away)} m away from the "pit-lane"`
        );
      }
    }
  }

  const { turns, location } = expected;
  const offset = distanceToLine(location, points);
  if (offset > MAX_CIRCUIT_OFFSET) {
    problems.push(
      `the "track" is ${Math.round(offset)} m away from the location of its circuit`
    );
  }

  // The corners are optional, but when they are given they are all of them: 1 to `turns`, with no gaps
  if (turns && corners.length > 0) {
    const numbers = corners.map((x) => x.properties!.number as number);
    if (corners.length !== turns) {
      problems.push(
        `it has ${corners.length} corners, but the layout has ${turns} turns`
      );
    } else if (Math.max(...numbers) !== turns) {
      problems.push(`its corners are not numbered from 1 to ${turns}`);
    }
  }

  if (problems.length === 0) {
    for (const marker of markersOf(geojson, 'corner')) {
      if (marker.offset > MAX_CORNER_OFFSET) {
        problems.push(
          `corner ${marker.properties.number} is ${Math.round(marker.offset)} m away from the "track"`
        );
      }
    }
    for (const marker of markersOf(geojson, 'sector')) {
      if (marker.offset > MAX_CORNER_OFFSET) {
        problems.push(
          `a sector ${marker.properties.sector} is ${Math.round(marker.offset)} m away from the "track"`
        );
      }
    }
  }

  return problems;
}

/**
 * The points of a kind (`corner`, `sector`) of a valid geometry, with their
 * distance in metres from the start line along the track (the closest point of
 * the line to each `Point`) and how far the `Point` is from it
 */
function markersOf(geojson: unknown, kind: string) {
  type Properties = {
    kind: string;
    number?: number;
    name?: string;
    sector?: number;
    from?: number;
    until?: number;
  };
  const features = (
    geojson as {
      features: {
        properties: Properties;
        geometry: { coordinates: unknown };
      }[];
    }
  ).features;
  const points = features.find((f) => f.properties.kind === 'track')!.geometry
    .coordinates as Position[];

  return features
    .filter((f) => f.properties.kind === kind)
    .map((f) => {
      const target = f.geometry.coordinates as Position;
      // Planar metres around the point: enough for segments of a few tens of metres
      const k = Math.cos((target[1] * Math.PI) / 180);
      const local = ([lon, lat]: Position) => [
        (lon - target[0]) * k * 111320,
        (lat - target[1]) * 110574
      ];
      let along = 0;
      let best = { offset: Infinity, distance: 0 };

      for (let i = 1; i < points.length; i++) {
        const [a, b] = [local(points[i - 1]), local(points[i])];
        const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
        const span = Math.hypot(dx, dy);
        const t = span
          ? Math.min(Math.max(-(a[0] * dx + a[1] * dy) / span ** 2, 0), 1)
          : 0;
        const offset = Math.hypot(a[0] + dx * t, a[1] + dy * t);

        if (offset < best.offset) {
          best = { offset, distance: along + span * t };
        }
        along += span;
      }

      return {
        properties: f.properties,
        distance: Math.round(best.distance),
        offset: best.offset
      };
    });
}

/** The corners of a valid geometry, in the order of their numbers, with their distance from the start line */
export function cornersOf(geojson: unknown) {
  return markersOf(geojson, 'corner')
    .map((x) => ({
      number: x.properties.number!,
      name: x.properties.name ?? null,
      distance: x.distance,
      offset: x.offset
    }))
    .sort((a, b) => a.number - b.number);
}

/**
 * The ends of the sectors 1 and 2 of a valid geometry, with their distance from
 * the start line. They are valid for every season of the layout, or only from
 * `from` and/or until `until` if the timing lines moved
 */
export function sectorsOf(geojson: unknown) {
  return markersOf(geojson, 'sector').map((x) => ({
    sector: x.properties.sector!,
    from: x.properties.from ?? -Infinity,
    until: x.properties.until ?? Infinity,
    distance: x.distance
  }));
}

/**
 * Loads `data/tracks/*.geojson` into `circuitLayoutGeometries` and its corners into `circuitLayoutCorners` and `circuitLayoutSectors`. Every file must
 * belong to a layout and be valid, or the import fails (it lists all the
 * problems at once).
 */
export function importGeometries(db: Database.Database) {
  if (!fs.existsSync(tracksDirectory)) return 0;

  const layouts = new Map(
    (
      db
        .prepare(
          `SELECT l.id, l.length, l.turns, c.longitude, c.latitude
           FROM circuitLayouts l JOIN circuits c ON c.id = l.circuitId`
        )
        .all() as {
        id: string;
        length: number;
        turns: number | null;
        longitude: number;
        latitude: number;
      }[]
    ).map((x) => [x.id.toLowerCase(), x])
  );
  const insert = db.prepare(
    'INSERT INTO circuitLayoutGeometries (circuitLayoutId, geojson) VALUES (?, ?)'
  );
  const insertCorner = db.prepare(
    'INSERT INTO circuitLayoutCorners (circuitLayoutId, number, name, distance) VALUES (?, ?, ?, ?)'
  );
  const insertSector = db.prepare(
    'INSERT INTO circuitLayoutSectors (circuitLayoutId, sector, fromSeason, untilSeason, distance) VALUES (?, ?, ?, ?, ?)'
  );
  const racedOf = db.prepare(
    'SELECT MIN(CAST(SUBSTR(id, 1, 4) AS INT)) AS first, MAX(CAST(SUBSTR(id, 1, 4) AS INT)) AS last FROM events WHERE circuitLayoutId = ?'
  );
  const errors: string[] = [];
  let inserted = 0;

  const files = fs
    .readdirSync(tracksDirectory)
    .filter((x) => x.endsWith('.geojson'))
    .sort();

  db.transaction(() => {
    for (const file of files) {
      const id = path.basename(file, '.geojson');
      const layout = layouts.get(id.toLowerCase());

      if (layout === undefined) {
        errors.push(`${file}: there is no circuit layout "${id}"`);
        continue;
      }

      let geojson: unknown;
      try {
        geojson = JSON.parse(
          fs.readFileSync(path.join(tracksDirectory, file), 'utf8')
        );
      } catch {
        errors.push(`${file}: it is not valid JSON`);
        continue;
      }

      const problems = validateGeometry(geojson, layout.length, {
        turns: layout.turns,
        location: [layout.longitude, layout.latitude]
      });
      if (problems.length > 0) {
        errors.push(...problems.map((x) => `${file}: ${x}`));
        continue;
      }

      // Stored without whitespace: the files are formatted for the diffs, the database is not
      insert.run(id, JSON.stringify(geojson));
      inserted++;

      // The corners are not a CSV table either: they are the `corner` points of the file
      for (const corner of cornersOf(geojson)) {
        insertCorner.run(id, corner.number, corner.name, corner.distance);
      }

      // The sectors are not a CSV table either: a row per point, valid for the seasons raced on the layout unless it says `from` or `until`
      const raced = racedOf.get(id) as {
        first: number | null;
        last: number | null;
      };
      for (const end of sectorsOf(geojson)) {
        if (raced.first === null) continue; // a layout without events is rejected later
        insertSector.run(
          id,
          end.sector,
          Math.max(end.from, raced.first),
          Math.min(end.until, raced.last!),
          end.distance
        );
      }
    }
  })();

  if (errors.length > 0) {
    throw new Error(`Invalid track files:\n - ${errors.join('\n - ')}`);
  }

  console.log(
    pc.green('[OK]: ') +
      `circuitLayoutGeometries: ${pc.bold(inserted)} rows from ${files.length} files`
  );

  return inserted;
}
