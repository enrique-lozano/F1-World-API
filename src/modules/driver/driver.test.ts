import { describe, expect, test } from 'vitest';
import { PaginatedItems } from '../../models/pagination';
import { DriverCareerStats, DriverDTO } from '../../models/types.dto';
import {
  getUrlForTesting,
  getUrlResponseForTesting
} from '../../utils/test/test-utils';

describe('Test drivers functionality', () => {
  test('Drivers should trigger validation errors', async () => {
    await getUrlForTesting('/drivers', {
      birthAfter: 'ddcc'
    }).expect(422);
  });

  test('Sorting by an unknown attribute is a client error', async () => {
    const res = await getUrlForTesting('/drivers', { sort: 'foo' }).expect(400);

    expect(res.body.code).toBe('NO_SUCH_COLUMN');
  });

  test('Get all drivers without filters', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<DriverDTO>>(
      '/drivers',
      {}
    );

    expect(res.totalElements).toBeGreaterThan(11);
    expect(res.data.length).toBe(10);
  });

  test('Custom drivers pagination size works', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<DriverDTO>>(
      '/drivers',
      {
        pageSize: '20'
      }
    );

    expect(res.totalElements).toBeGreaterThan(20);
    expect(res.data.length).toBe(20);
  });

  test('Get drivers by name', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<DriverDTO>>(
      '/drivers',
      {
        name: 'alonso'
      }
    );

    expect(res.data.some((x) => x.id == 'alonso')).toBe(true);
  });

  test('Get driver by ID', async () => {
    const idToGet = 'sutil';

    const res = await getUrlResponseForTesting<DriverDTO>(
      `/drivers/${idToGet}`
    );

    expect(res.id).toBe(idToGet);
  });

  test('The permanent number of the drivers is an integer string', async () => {
    const res = await getUrlResponseForTesting<DriverDTO>(
      '/drivers/max-verstappen'
    );

    expect(res.permanentNumber).toBe('33');
  });

  test('Drivers expose their first and last season', async () => {
    const res = await getUrlResponseForTesting<DriverDTO>('/drivers/alonso');

    expect(res.firstSeason).toBe(2001);
    expect(res.lastSeason).toBeGreaterThanOrEqual(2023);
  });

  test('Sort drivers by name', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<DriverDTO>>(
      '/drivers',
      { sort: 'name', pageSize: '50', include: 'id,name' }
    );

    const names = res.data.map((x) => x.name);
    expect(res.data.length).toBe(50);
    // SQLite compares the names without case (NOCASE collation)
    expect(names).toEqual(
      [...names].sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))
    );
  });

  test('Search drivers by name and sort them by first season', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<DriverDTO>>(
      '/drivers',
      { name: 'SCHUMACHER', sort: 'firstSeason', include: 'id,firstSeason' }
    );

    expect(res.data.map((x) => x.id)).toEqual([
      'michael-schumacher',
      'ralf-schumacher',
      'mick-schumacher'
    ]);
  });

  test('Sort drivers by their first or last season', async () => {
    const first = await getUrlResponseForTesting<PaginatedItems<DriverDTO>>(
      '/drivers',
      { sort: '-lastSeason', include: 'id,lastSeason', pageSize: '1' }
    );

    const last = await getUrlResponseForTesting<PaginatedItems<DriverDTO>>(
      '/drivers',
      {
        sort: 'firstSeason',
        include: 'id,firstSeason',
        pageSize: '1'
      }
    );

    expect(first.data[0].lastSeason).toBeGreaterThanOrEqual(2023);
    expect(last.data[0].firstSeason).toBe(1950);
  });

  test('Get the career stats of a driver', async () => {
    const res = await getUrlResponseForTesting<DriverCareerStats>(
      '/drivers/michael-schumacher/stats'
    );

    expect(res).toEqual({
      races: 308,
      starts: 306,
      wins: 91,
      podiums: 155,
      // Monaco 2012: pole position in qualifying, but started 6th due to a penalty
      poles: 67,
      // Only from 1996, when the lap times are available
      fastestLaps: 54,
      points: 1566,
      championships: 7
    });
  });

  test('Championships are counted for the drivers of the 50s', async () => {
    const res = await getUrlResponseForTesting<DriverCareerStats>(
      '/drivers/fangio/stats'
    );

    expect(res.championships).toBe(5);
    expect(res.wins).toBe(24);
  });

  test('The stats of a driver that does not exist are a client error', async () => {
    await getUrlForTesting('/drivers/not-a-driver/stats').expect(404);
  });
});
