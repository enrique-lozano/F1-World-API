import { describe, expect, test } from 'vitest';
import { PaginatedItems } from '../../models/pagination';
import { WeatherPeriodDTO } from '../../models/dto';
import {
  getUrlForTesting,
  getUrlResponseForTesting
} from '../../utils/test/test-utils';

const endPoint = '/weather';

describe('Test weather functionality', () => {
  test('Invalid filters should trigger validation errors', async () => {
    await getUrlForTesting(endPoint, { weather: 'SNOWY' }).expect(422);
  });

  test('Every race of a season has a base period', async () => {
    const res = await getUrlResponseForTesting<
      PaginatedItems<WeatherPeriodDTO>
    >(endPoint, { season: '2022', pageSize: '100', include: 'lapStart' });

    expect(res.totalElements).toBe(22);
    expect(res.data.every((x) => x.lapStart === 1)).toBe(true);
  });

  test('An old race has the weather but no measured temperature of the track', async () => {
    const res = await getUrlResponseForTesting<
      PaginatedItems<WeatherPeriodDTO>
    >(endPoint, {
      season: '1976',
      round: '1',
      session: 'R',
      include: 'weather,airTemperature,trackTemperature,session.id'
    });

    expect(res.totalElements).toBe(1);
    expect(res.data[0].session?.id).toBe('1976-01-R');
    expect(res.data[0].weather).not.toBeNull();
    expect(res.data[0].trackTemperature).toBeNull();
  });

  test('Filter by weather', async () => {
    const res = await getUrlResponseForTesting<
      PaginatedItems<WeatherPeriodDTO>
    >(endPoint, {
      season: '2022',
      weather: 'HEAVY_RAIN',
      include: 'weather,session.id'
    });

    expect(res.data.map((x) => x.session?.id)).toEqual(['2022-18-R']);
  });
});
