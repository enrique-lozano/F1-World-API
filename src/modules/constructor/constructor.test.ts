import { describe, expect, test } from 'vitest';
import { PaginatedItems } from '../../models/pagination';
import { CareerStats, ConstructorDTO } from '../../models/types.dto';
import {
  getUrlForTesting,
  getUrlResponseForTesting
} from '../../utils/test/test-utils';

const endPoint = '/constructors';

describe('Test constructors functionality', () => {
  test('Constructors should trigger validation errors', async () => {
    await getUrlForTesting(endPoint, { pageSize: 'ddcc' }).expect(422);
  });

  test('Get all constructors without filters', async () => {
    const res =
      await getUrlResponseForTesting<PaginatedItems<ConstructorDTO>>(endPoint);

    expect(res.totalElements).toBeGreaterThan(100);
    expect(res.data.length).toBe(10);
    expect(res.data[0].country?.alpha2Code).toBeDefined();
  });

  test('Search constructors by name (case-insensitive)', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<ConstructorDTO>>(
      endPoint,
      { name: 'FERRARI' }
    );

    expect(res.data.some((x) => x.id === 'ferrari')).toBe(true);
    expect(
      res.data.every((x) =>
        `${x.name} ${x.fullName}`.toLowerCase().includes('ferrari')
      )
    ).toBe(true);
  });

  test('Filter constructors by country', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<ConstructorDTO>>(
      endPoint,
      { countryId: 'IT', pageSize: '100', include: 'id,country.alpha2Code' }
    );

    expect(res.data.some((x) => x.id === 'ferrari')).toBe(true);
    expect(res.data.every((x) => x.country?.alpha2Code === 'IT')).toBe(true);
  });

  test('Sort constructors by last season', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<ConstructorDTO>>(
      endPoint,
      { sort: '-lastSeason,name', include: 'id,lastSeason', pageSize: '50' }
    );

    const seasons = res.data.map((x) => x.lastSeason!);
    expect(seasons).toEqual([...seasons].sort((a, b) => b - a));
    expect(res.data.some((x) => x.id === 'ferrari')).toBe(true);
  });

  test('Get constructor by ID', async () => {
    const res = await getUrlResponseForTesting<ConstructorDTO>(
      `${endPoint}/ferrari`,
      { locale: 'es' }
    );

    expect(res.id).toBe('ferrari');
    expect(res.country?.commonName).toBe('Italia');
    expect(res.firstSeason).toBe(1950);
    expect(res.lastSeason).toBeGreaterThanOrEqual(2023);
  });

  test('The include param works with the constructors', async () => {
    const res = await getUrlResponseForTesting<ConstructorDTO>(
      `${endPoint}/ferrari`,
      { include: 'id,firstSeason' }
    );

    expect(res).toEqual({ id: 'ferrari', firstSeason: 1950 });
  });

  test('Unknown constructors are a client error', async () => {
    await getUrlForTesting(`${endPoint}/not-a-constructor`).expect(400);
    await getUrlForTesting(`${endPoint}/not-a-constructor/stats`).expect(400);
  });

  test('Get the seasons of a constructor', async () => {
    const res = await getUrlResponseForTesting<number[]>(
      `${endPoint}/ferrari/seasons`
    );

    expect(res[0]).toBe(1950);
    expect(res).toContain(2023);
    expect(res).toEqual([...res].sort((a, b) => a - b));
  });

  test('Get the stats of a constructor', async () => {
    const res = await getUrlResponseForTesting<CareerStats>(
      `${endPoint}/ferrari/stats`
    );

    expect(res.wins).toBe(243);
    expect(res.races).toBeGreaterThan(1000);
    expect(res.starts).toBeLessThanOrEqual(res.races);
    expect(res.podiums).toBeGreaterThan(res.wins * 3);
    expect(res.poles).toBeGreaterThan(200);
    expect(res.fastestLaps).toBeGreaterThan(100);
    expect(res.points).toBeGreaterThan(10000);
  });
});
