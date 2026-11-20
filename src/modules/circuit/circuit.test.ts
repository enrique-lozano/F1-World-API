import { describe, expect, test } from 'vitest';
import { PaginatedItems } from '../../models/pagination';
import { CircuitDTO, CircuitRecordsDTO, SessionDTO } from '../../models/dto';
import {
  getUrlForTesting,
  getUrlResponseForTesting
} from '../../utils/test/test-utils';

describe('Test circuits functionality', () => {
  test('A circuit has its names with the years each one was used', async () => {
    const res = await getUrlResponseForTesting<CircuitDTO>('/circuits/aida');

    expect(res.names).toEqual([
      { name: 'TI Circuit Aida', fromYear: 1990, untilYear: 2004 },
      { name: 'Okayama International Circuit', fromYear: 2005, untilYear: null }
    ]);
  });

  test('A circuit has the year it opened and whether it is in use', async () => {
    const [monza, rouen] = await Promise.all([
      getUrlResponseForTesting<CircuitDTO>('/circuits/monza'),
      getUrlResponseForTesting<CircuitDTO>('/circuits/rouen')
    ]);

    expect(monza.opened).toBe(1922);
    expect(monza.status).toBe('IN_USE');
    expect(rouen.status).toBe('HISTORIC');
  });

  test('Every circuit has a time zone', async () => {
    const res = await getUrlResponseForTesting<CircuitDTO>('/circuits/aida');

    expect(res.timeZone).toBe('Asia/Tokyo');
  });

  test('The sessions of a recent weekend have their start time in UTC', async () => {
    const res =
      await getUrlResponseForTesting<SessionDTO[]>('/sessions/2023/1');

    expect(res.find((x) => x.abbreviation == 'FP1')?.startDateTime).toBe(
      '2023-03-03T11:30:00Z'
    );
    expect(res.find((x) => x.abbreviation == 'R')?.startDateTime).toBe(
      '2023-03-05T15:00:00Z'
    );
  });

  test('A circuit knows its races, layouts and seasons', async () => {
    const res = await getUrlResponseForTesting<CircuitDTO>(
      '/circuits/silverstone'
    );

    expect(res.races).toBe(58);
    expect(res.layouts).toBeGreaterThanOrEqual(8);
    expect(res.firstSeason).toBe(1950);
    expect(res.lastSeason).toBe(2023);
  });

  test('The shape of the latest layout is only returned when it is asked for', async () => {
    const without = await getUrlResponseForTesting<CircuitDTO>(
      '/circuits/silverstone'
    );
    const withShape = await getUrlResponseForTesting<CircuitDTO>(
      '/circuits/silverstone',
      { include: 'id,geometry' }
    );
    const noShape = await getUrlResponseForTesting<CircuitDTO>(
      '/circuits/pescara',
      { include: 'id,geometry' }
    );

    expect(without.geometry).toBeUndefined();
    expect(withShape.geometry?.features[0].properties.kind).toBe('track');
    expect(noShape.geometry).toBeNull();
  });

  test('The circuits can be searched by name and filtered by country', async () => {
    const byName = await getUrlResponseForTesting<PaginatedItems<CircuitDTO>>(
      '/circuits',
      { name: 'spa' }
    );
    const byCountry = await getUrlResponseForTesting<
      PaginatedItems<CircuitDTO>
    >('/circuits', { countryId: 'IT', pageSize: '50' });

    expect(byName.data.map((x) => x.id)).toContain('spa-francorchamps');
    expect(byCountry.data.map((x) => x.id)).toEqual(
      expect.arrayContaining(['monza', 'imola', 'mugello'])
    );
  });

  test('The circuits can be sorted by their number of layouts', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<CircuitDTO>>(
      '/circuits',
      { sort: '-layouts', pageSize: '10' }
    );
    const layouts = res.data.map((x) => x.layouts);

    expect(layouts).toEqual([...layouts].sort((a, b) => b - a));
    expect(layouts[0]).toBeGreaterThan(layouts[9] - 1);
  });

  test('The records of a circuit rank the entities with more wins, from best to worst', async () => {
    const res = await getUrlResponseForTesting<CircuitRecordsDTO>(
      '/circuits/monza/records',
      { by: 'driver', limit: '3' }
    );

    expect(res.wins).toHaveLength(3);
    expect(res.wins[0].count).toBeGreaterThanOrEqual(res.wins[1].count);
    expect(res.poles.length).toBeGreaterThan(0);
    expect(res.fastestLaps.length).toBeGreaterThan(0);
    expect(res.points[0].count).toBeGreaterThan(0);
  });

  test('The records can be ranked by team and by constructor', async () => {
    const byConstructor = await getUrlResponseForTesting<CircuitRecordsDTO>(
      '/circuits/monaco/records',
      { by: 'constructor', limit: '1' }
    );
    const byEntrant = await getUrlResponseForTesting<CircuitRecordsDTO>(
      '/circuits/monaco/records',
      { by: 'entrant', limit: '1' }
    );

    expect(byConstructor.wins[0].id).toBeDefined();
    expect(byEntrant.wins[0].id).toBeDefined();
  });

  test('The records of a circuit that does not exist return 404', async () => {
    const res = await getUrlForTesting('/circuits/nowhere/records');

    expect(res.status).toBe(404);
  });
});
