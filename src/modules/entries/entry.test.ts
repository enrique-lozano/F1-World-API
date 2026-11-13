import { describe, expect, test } from 'vitest';
import { PaginatedItems } from '../../models/pagination';
import { EntryDTO } from '../../models/types.dto';
import { getUrlResponseForTesting } from '../../utils/test/test-utils';

describe('Test entries functionality', () => {
  test('The include param is applied to the chassis and engine', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<EntryDTO>>(
      '/entries',
      {
        season: '2021',
        driverId: 'max-verstappen',
        include: 'id,chassis.chassisConstructor.id,engine.manufacturer.name'
      }
    );

    expect(res.totalElements).toBe(1);
    expect(res.data[0].chassis?.chassisConstructor).toEqual({ id: 'red-bull' });
    expect(res.data[0].engine?.manufacturer).toEqual({ name: 'Honda' });
  });

  test('A Ford-badged Cosworth engine is built by Cosworth and branded Ford', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<EntryDTO>>(
      '/entries',
      {
        season: '1985',
        driverId: 'bellof',
        include:
          'entrantName,chassis.chassisConstructor.id,engine.name,engine.manufacturer.id,engineBrand.id'
      }
    );

    expect(res.totalElements).toBeGreaterThan(0);
    const ford = res.data.find((x) => x.engineBrand?.id === 'ford');
    expect(ford?.engine?.name).toBe('DFY');
    expect(ford?.engine?.manufacturer).toEqual({ id: 'cosworth' });
    expect(ford?.chassis?.chassisConstructor).toEqual({ id: 'tyrrell' });
  });

  test('The entrant season of an entry tells the licence of the team', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<EntryDTO>>(
      '/entries',
      {
        season: '1998',
        driverId: 'damon-hill',
        include:
          'entrantSeason.type,entrantSeason.entrant.id,entrantSeason.licenceCountry.alpha2Code'
      }
    );

    expect(res.data[0].entrantSeason).toEqual({
      type: 'WORKS',
      entrant: { id: 'jordan-grand-prix' },
      licenceCountry: { alpha2Code: 'IE' }
    });
  });

  test('Filter the entries by entrant and by constructor', async () => {
    const byEntrant = await getUrlResponseForTesting<PaginatedItems<EntryDTO>>(
      '/entries',
      {
        entrantId: 'scuderia-ferrari',
        season: '2021',
        include: 'entrantName,driver.id',
        pageSize: '50'
      }
    );

    // Ferrari 2021: the same driver has several registered names (sponsor changes) in one season
    const names = byEntrant.data.filter((x) => x.driver?.id === 'leclerc');
    expect(names.length).toBeGreaterThanOrEqual(2);
    expect(
      new Set(names.map((x) => x.entrantName)).size
    ).toBeGreaterThanOrEqual(2);

    const byConstructor = await getUrlResponseForTesting<
      PaginatedItems<EntryDTO>
    >('/entries', {
      constructorId: 'tyrrell',
      season: '1985',
      include: 'id',
      pageSize: '50'
    });
    expect(byConstructor.totalElements).toBeGreaterThan(0);
  });

  test('The FP1 results without a known entry now have one (Celis, Force India 2016)', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<EntryDTO>>(
      '/entries',
      {
        driverId: 'celis',
        include: 'driverNumber,entrantName,chassis.id'
      }
    );

    expect(res.data).toEqual([
      {
        driverNumber: 34,
        entrantName: 'Sahara Force India F1 Team',
        chassis: { id: 'force-india-vjm09' }
      },
      {
        driverNumber: 34,
        entrantName: 'Sahara Force India F1 Team',
        chassis: { id: 'force-india-vjm10' }
      }
    ]);
  });
});
