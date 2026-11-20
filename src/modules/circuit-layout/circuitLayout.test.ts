import { describe, expect, test } from 'vitest';
import {
  cornersOf,
  validateGeometry,
  type LayoutExpectations
} from '../../../data/db-geometry';
import { PaginatedItems } from '../../models/pagination';
import {
  CircuitLayoutDTO,
  CircuitLayoutGeometry,
  EventDTO
} from '../../models/dto';
import {
  getUrlForTesting,
  getUrlResponseForTesting
} from '../../utils/test/test-utils';

describe('Test circuit layouts functionality', () => {
  test('Silverstone has a layout for each configuration of its history', async () => {
    const res = await getUrlResponseForTesting<
      PaginatedItems<CircuitLayoutDTO>
    >('/circuit-layouts', { circuitId: 'silverstone' });

    const ids = res.data.map((x) => x.id);

    // The first and the latest layouts, in chronological order
    expect(ids[0]).toBe('silverstone-1950');
    expect(ids.at(-1)).toBe('silverstone-2010');
    expect(ids).toEqual([...ids].sort());
  });

  test('A layout has its length in metres and the seasons it was used', async () => {
    const res = await getUrlResponseForTesting<CircuitLayoutDTO>(
      '/circuit-layouts/silverstone-2010'
    );

    expect(res.length).toBe(5891);
    expect(res.turns).toBe(18);
    expect(res.direction).toBe('CLOCKWISE');
    expect(res.firstSeason).toBe(2010);
    expect(res.lastSeason).toBe(2023);
    expect(res.circuit?.id).toBe('silverstone');
  });

  test('The Nordschleife and the Grand Prix layouts of the Nürburgring are different layouts', async () => {
    const nordschleife = await getUrlResponseForTesting<CircuitLayoutDTO>(
      '/circuit-layouts/nurburgring-1951'
    );
    const grandPrix = await getUrlResponseForTesting<CircuitLayoutDTO>(
      '/circuit-layouts/nurburgring-2002'
    );

    expect(nordschleife.name).toBe('Nordschleife');
    expect(nordschleife.length).toBe(22800);
    expect(grandPrix.length).toBe(5148);
    // It was raced again after other layouts, so its seasons are not consecutive
    expect(grandPrix.lastSeason).toBe(2020);
  });

  test('An event knows the layout that was raced, and its circuit', async () => {
    const res = await getUrlResponseForTesting<EventDTO>('/events/2023/10', {
      include: 'id,circuit.id,circuitLayout.id,circuitLayout.circuit.id'
    });

    expect(res).toEqual({
      id: '2023-10',
      circuit: { id: 'silverstone' },
      circuitLayout: { id: 'silverstone-2010', circuit: { id: 'silverstone' } }
    });
  });

  test('The events can be filtered by circuit and by layout', async () => {
    const byCircuit = await getUrlResponseForTesting<PaginatedItems<EventDTO>>(
      '/events',
      { circuitId: 'nurburgring', pageSize: '100' }
    );
    const byLayout = await getUrlResponseForTesting<PaginatedItems<EventDTO>>(
      '/events',
      { circuitLayoutId: 'nurburgring-2002', pageSize: '100' }
    );

    expect(byCircuit.totalElements).toBe(41);
    expect(byLayout.totalElements).toBe(10);
  });

  test('A layout that does not exist returns 404', async () => {
    const res = await getUrlForTesting('/circuit-layouts/nowhere-1');

    expect(res.status).toBe(404);
  });

  test('A layout knows the seasons it was used and its records', async () => {
    const res = await getUrlResponseForTesting<CircuitLayoutDTO>(
      '/circuit-layouts/silverstone-2010',
      { include: 'seasons,lapRecord,trackRecord' }
    );

    expect(res.seasons[0]).toBe(2010);
    expect(res.seasons.at(-1)).toBe(2023);
    expect(res.lapRecord?.time).toBeGreaterThan(80000);
    expect(res.lapRecord?.driverName).toBeTruthy();
    expect(res.trackRecord?.time).toBeLessThan(res.lapRecord!.time);
  });

  test('A layout from before the lap times has no lap record', async () => {
    const res = await getUrlResponseForTesting<CircuitLayoutDTO>(
      '/circuit-layouts/silverstone-1950',
      { include: 'lapRecord,trackRecord' }
    );

    expect(res.lapRecord).toBeNull();
    expect(res.trackRecord?.time).toBeGreaterThan(0);
  });

  test('The layouts with a known shape say so', async () => {
    const known = await getUrlResponseForTesting<CircuitLayoutDTO>(
      '/circuit-layouts/silverstone-2010'
    );
    const unknown = await getUrlResponseForTesting<CircuitLayoutDTO>(
      '/circuit-layouts/silverstone-1950'
    );

    expect(known.hasGeometry).toBe(1);
    expect(unknown.hasGeometry).toBe(0);
  });

  test('The corners and the sectors are lists, empty while they are not known', async () => {
    const res = await getUrlResponseForTesting<CircuitLayoutDTO>(
      '/circuit-layouts/silverstone-1950'
    );

    expect(res.corners).toEqual([]);
    expect(res.sectors).toEqual([]);
  });

  test('The sectors are two ends, with the seasons they are valid for', async () => {
    const res = await getUrlResponseForTesting<CircuitLayoutDTO>(
      '/circuit-layouts/silverstone-2010'
    );
    // One row for each end, valid for all the seasons raced on the layout (2010-2023)
    const [first, second] = res.sectors;

    expect(res.sectors).toHaveLength(2);
    expect([first.fromSeason, first.untilSeason]).toEqual([2010, 2023]);
    expect(first.sector).toBe(1);
    expect(second.sector).toBe(2);
    expect(first.distance).toBeGreaterThan(1000);
    expect(second.distance).toBeGreaterThan(first.distance);
    expect(second.distance).toBeLessThan(res.length);
  });

  test('The shape of a layout is a GeoJSON with a closed track', async () => {
    const res = await getUrlForTesting(
      '/circuit-layouts/silverstone-2010/geometry'
    );
    // supertest only parses `application/json` into `body`
    const geometry = JSON.parse(res.text) as CircuitLayoutGeometry;
    const track = geometry.features.find((x) => x.properties.kind === 'track');
    const points = track!.geometry.coordinates;

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/geo+json');
    expect(res.headers['cache-control']).toContain('max-age=86400');
    expect(geometry.type).toBe('FeatureCollection');
    expect(points.length).toBeGreaterThan(50);
    expect(points[0]).toEqual(points[points.length - 1]);
    expect(track!.properties.startLine).toBe(true);
    expect(
      geometry.features.filter((x) => x.properties.kind == 'pit-lane')
    ).toHaveLength(1);
  });

  test('A layout without a known shape has no geometry', async () => {
    const res = await getUrlForTesting(
      '/circuit-layouts/silverstone-1950/geometry'
    );

    expect(res.status).toBe(404);
  });
});

describe('Test the validation of the track files', () => {
  const square = (side: number): [number, number][] => [
    [0, 0],
    [side, 0],
    [side, side],
    [0, side],
    [0, 0]
  ];
  const collection = (coordinates: unknown, kind = 'track') => ({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { kind },
        geometry: { type: 'LineString', coordinates }
      }
    ]
  });
  // A square of 0.01 degrees on the equator has a perimeter of about 4,448 m
  const metres = 4448;
  // The centre of the square: every test file needs the location of its circuit
  const circuit: LayoutExpectations = { turns: null, location: [0.005, 0.005] };
  const validate = (
    file: unknown,
    length: number,
    expected: Partial<LayoutExpectations> = {}
  ) => validateGeometry(file, length, { ...circuit, ...expected });

  test('A closed track of the right length is valid', () => {
    expect(validate(collection(square(0.01)), metres)).toEqual([]);
  });

  test('A track that is not closed is rejected', () => {
    expect(validate(collection(square(0.01).slice(0, -1)), metres)).toContain(
      'the "track" is not closed (its last point is not the first)'
    );
  });

  test('A track whose length is far from the one of the layout is rejected', () => {
    const [problem] = validate(collection(square(0.01)), 6000);

    expect(problem).toContain('too far from the 6000 m of the layout');
  });

  test('A file without a track is rejected', () => {
    expect(validate(collection(square(0.01), 'pit-lane'), metres)).toContain(
      'it needs exactly one "track" feature'
    );
  });

  test('Points out of the range of a lat/lon are rejected', () => {
    expect(
      validate(
        collection([
          [0, 0],
          [0, 100],
          [0, 0]
        ]),
        metres
      )
    ).toEqual(['"track" is not a LineString of [lon, lat] points']);
  });

  test('A corner is a point on the track, and its distance is found from the start line', () => {
    const withCorner = (point: [number, number]) => {
      const file = collection(square(0.01));
      file.features[0].properties = { kind: 'track', startLine: true } as never;
      file.features.push({
        type: 'Feature',
        properties: { kind: 'corner', number: 1 },
        geometry: { type: 'Point', coordinates: point }
      } as never);
      return file;
    };

    expect(validate(withCorner([0.01, 0]), metres)).toEqual([]);
    // The second corner of the square, a side (1,112 m) from the start line
    expect(cornersOf(withCorner([0.01, 0]))[0].distance).toBeCloseTo(1112, -1);
    // Half a kilometre away from the line it is not a point of the track
    expect(validate(withCorner([0.005, 0.005]), metres)[0]).toContain(
      'corner 1 is'
    );
  });

  test('A repeated point, a spike and a pit lane far from the track are rejected', () => {
    const track = square(0.01);
    const repeated = [track[0], track[1], track[1], ...track.slice(2)];
    expect(validate(collection(repeated), metres)[0]).toContain(
      'repeats its point'
    );

    const spike = [track[0], [0.005, 0], [0.002, 0], ...track.slice(1)];
    expect(validate(collection(spike), 5000)[0]).toContain('doubles back');

    const file = collection(track);
    file.features.push({
      type: 'Feature',
      properties: { kind: 'pit-lane' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [0.005, 0.0],
          [0.005, -0.02]
        ]
      }
    } as never);
    expect(validate(file, metres)[0]).toContain('"pit-lane" goes');
  });

  test('The corners are as many as the turns of the layout, and numbered from 1', () => {
    const withCorners = (numbers: number[]) => {
      const file = collection(square(0.01));
      file.features[0].properties = { kind: 'track', startLine: true } as never;
      for (const number of numbers) {
        file.features.push({
          type: 'Feature',
          properties: { kind: 'corner', number },
          geometry: { type: 'Point', coordinates: [0.01, 0] }
        } as never);
      }
      return file;
    };

    expect(validate(withCorners([1, 2]), metres, { turns: 2 })).toEqual([]);
    expect(validate(withCorners([1, 2]), metres, { turns: 3 })).toEqual([
      'it has 2 corners, but the layout has 3 turns'
    ]);
    expect(validate(withCorners([1, 3]), metres, { turns: 2 })).toEqual([
      'its corners are not numbered from 1 to 2'
    ]);
    // Without corners in the file, or without turns in the layout, there is nothing to compare
    expect(validate(collection(square(0.01)), metres, { turns: 5 })).toEqual(
      []
    );
    expect(validate(withCorners([1, 2]), metres, { turns: null })).toEqual([]);
  });

  test('The track is near the location of its circuit', () => {
    // The centre of the square, 700 m from its sides: near enough
    expect(
      validate(collection(square(0.01)), metres, {
        location: [0.005, 0.005]
      })
    ).toEqual([]);
    // Ten kilometres away
    expect(
      validate(collection(square(0.01)), metres, {
        location: [0.1, 0]
      })[0]
    ).toContain('away from the location of its circuit');
  });

  test('The ends of the pit speed limit have to be on the pit lane', () => {
    const file = collection(square(0.01));
    const feature = (kind: string, geometry: unknown) =>
      ({ type: 'Feature', properties: { kind }, geometry }) as never;
    file.features.push(
      feature('pit-lane', {
        type: 'LineString',
        coordinates: [
          [0.003, 0.0002],
          [0.006, 0.0002]
        ]
      }),
      feature('pit-limit-start', {
        type: 'Point',
        coordinates: [0.003, 0.0002]
      }),
      feature('pit-limit-end', { type: 'Point', coordinates: [0.006, 0.0002] })
    );
    expect(validate(file, metres)).toEqual([]);

    file.features[3].geometry = {
      type: 'Point',
      coordinates: [0.006, 0.004]
    } as never;
    expect(validate(file, metres)[0]).toContain('m away from the "pit-lane"');
  });
});
