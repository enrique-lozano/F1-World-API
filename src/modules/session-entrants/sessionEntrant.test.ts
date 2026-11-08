import { describe, expect, test } from 'vitest';
import { PaginatedItems } from '../../models/pagination';
import { EventEntrantDTO } from '../../models/types.dto';
import { getUrlResponseForTesting } from '../../utils/test/test-utils';

describe('Test session entrants functionality', () => {
  test('The include param is applied to the chassis and engine manufacturers', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<EventEntrantDTO>>(
      '/session-entrants',
      {
        season: '2021',
        driverId: 'max-verstappen',
        include: 'id,chassisManufacturer.id,engineManufacturer.name'
      }
    );

    expect(res.totalElements).toBe(1);
    expect(res.data[0].chassisManufacturer).toEqual({ id: 'red-bull' });
    expect(res.data[0].engineManufacturer).toEqual({ name: 'Honda' });
  });
});
