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
});
