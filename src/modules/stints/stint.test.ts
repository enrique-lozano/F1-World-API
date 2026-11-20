import { describe, expect, test } from 'vitest';
import { PaginatedItems } from '../../models/pagination';
import { StintDTO } from '../../models/dto';
import {
  getUrlForTesting,
  getUrlResponseForTesting
} from '../../utils/test/test-utils';

const endPoint = '/stints';

describe('Test stints functionality', () => {
  test('Invalid filters should trigger validation errors', async () => {
    await getUrlForTesting(endPoint, { compound: 'PURPLE' }).expect(422);
  });

  test('Get the stints of a driver in a race', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<StintDTO>>(
      endPoint,
      {
        season: '2022',
        round: '1',
        session: 'R',
        driverId: 'max-verstappen',
        include: 'stint,lapStart,compound,tyreAge'
      }
    );

    expect(res.totalElements).toBe(4);
    expect(res.data.map((x) => x.stint)).toEqual([1, 2, 3, 4]);
    // He started on a used set of softs, and the stints are in order of laps
    expect(res.data[0]).toMatchObject({
      lapStart: 1,
      compound: 'SOFT',
      tyreAge: 3
    });
    const laps = res.data.map((x) => x.lapStart);
    expect(laps).toEqual([...laps].sort((a, b) => a - b));
  });

  test('Filter the stints by compound', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<StintDTO>>(
      endPoint,
      {
        season: '2022',
        round: '18',
        session: 'R',
        compound: 'WET',
        pageSize: '100',
        include: 'compound'
      }
    );

    expect(res.totalElements).toBeGreaterThan(0);
    expect(res.data.every((x) => x.compound === 'WET')).toBe(true);
  });

  test('A season without stints has no results', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<StintDTO>>(
      endPoint,
      { season: '1976' }
    );

    expect(res.totalElements).toBe(0);
  });
});
