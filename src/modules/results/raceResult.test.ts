import { describe, expect, test } from 'vitest';
import { RaceResultDTO } from '../../models/types.dto';
import {
  getUrlForTesting,
  getUrlResponseForTesting
} from '../../utils/test/test-utils';

describe('Test race results functionality', () => {
  test('Sorting by an unknown attribute is a client error', async () => {
    const res = await getUrlForTesting('/races/results', {
      sort: 'foo'
    }).expect(400);

    expect(res.body.code).toBe('NO_SUCH_COLUMN');
  });

  test('Get the results of a race', async () => {
    const res = await getUrlResponseForTesting<RaceResultDTO[]>(
      '/races/results/2021/1/R',
      { include: 'positionOrder,points,entrant.driver.id' }
    );

    expect(res.length).toBe(20);
    expect(res[0].positionOrder).toBe(1);
    expect(res[0].entrant?.driver?.id).toBe('lewis-hamilton');
  });

  test('The locale param is accepted by the endpoints with an include param', async () => {
    const res = await getUrlResponseForTesting<RaceResultDTO[]>(
      '/races/results/2021/1/R',
      { include: 'entrant.driver.nationalityCountry', locale: 'es' }
    );

    expect(res[0].entrant?.driver?.nationalityCountry?.commonName).toBe(
      'Reino Unido'
    );
  });
});
