import { describe, expect, test } from 'vitest';
import { PaginatedItems } from '../../models/pagination';
import { PitStopDTO } from '../../models/types.dto';
import {
  getUrlForTesting,
  getUrlResponseForTesting
} from '../../utils/test/test-utils';

const endPoint = '/pit-stops';

describe('Test pit stops functionality', () => {
  test('Laps should trigger validation errors', async () => {
    await getUrlForTesting(endPoint, {
      season: 'ddcc'
    }).expect(422);
  });

  test('Get all pit stops without filters', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<PitStopDTO>>(
      endPoint,
      {}
    );

    expect(res.totalElements).toBeGreaterThan(11);
    expect(res.data.length).toBe(10);
  });

  test('Filter the pit stops of a race', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<PitStopDTO>>(
      endPoint,
      {
        season: '2020',
        round: '2',
        session: 'R',
        pageSize: '100',
        include: 'lap,session.id'
      }
    );

    expect(res.totalElements).toBe(21);
    expect(res.data.length).toBe(21);
    expect(res.data.every((x) => x.session?.id === '2020-02-R')).toBe(true);

    // Sorted by lap by default
    const laps = res.data.map((x) => x.lap);
    expect(laps).toEqual([...laps].sort((a, b) => a - b));
  });

  test('Filter the pit stops of a driver in a race', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<PitStopDTO>>(
      endPoint,
      {
        season: '2020',
        round: '2',
        session: 'R',
        driverId: 'lewis-hamilton',
        include: 'lap,entry.driver.id'
      }
    );

    expect(res.totalElements).toBe(1);
    expect(res.data[0]).toEqual({
      lap: 27,
      entry: { driver: { id: 'lewis-hamilton' } }
    });
  });

  test('Filter the pit stops by lap', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<PitStopDTO>>(
      endPoint,
      { season: '2020', round: '2', session: 'R', lap: '24' }
    );

    expect(res.totalElements).toBe(2);
    expect(res.data.every((x) => x.lap === 24)).toBe(true);
  });

  test('The pit stops of a session accept the include param', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<PitStopDTO>>(
      '/sessions/2020/2/R/pit-stops',
      { include: 'lap', pageSize: '2' }
    );

    expect(res.totalElements).toBe(21);
    expect(res.data).toEqual([{ lap: 1 }, { lap: 24 }]);
  });
});
