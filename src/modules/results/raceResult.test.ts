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
      { include: 'positionOrder,points,entry.driver.id' }
    );

    expect(res.length).toBe(20);
    expect(res[0].positionOrder).toBe(1);
    expect(res[0].entry?.driver?.id).toBe('lewis-hamilton');
  });

  test('The locale param is accepted by the endpoints with an include param', async () => {
    const res = await getUrlResponseForTesting<RaceResultDTO[]>(
      '/races/results/2021/1/R',
      { include: 'entry.driver.nationalityCountry', locale: 'es' }
    );

    expect(res[0].entry?.driver?.nationalityCountry?.commonName).toBe(
      'Reino Unido'
    );
  });
});

describe('Shared cars', () => {
  test('A car driven by two drivers is marked as shared in both results', async () => {
    const res = await getUrlResponseForTesting<RaceResultDTO[]>(
      '/races/results/1951/4/R',
      {
        include: 'positionOrder,sharedCar,entry.driver.id,entry.driverNumber'
      }
    );

    const winners = res.filter((x) => x.positionOrder === 1);

    expect(winners.map((x) => x.entry?.driver?.id).sort()).toEqual([
      'fagioli',
      'fangio'
    ]);
    expect(winners.every((x) => x.sharedCar === 1)).toBe(true);
    expect(winners.every((x) => x.entry?.driverNumber === 8)).toBe(true);
  });

  test('A car driven by one driver is not shared', async () => {
    const res = await getUrlResponseForTesting<RaceResultDTO[]>(
      '/races/results/2021/1/R',
      { include: 'sharedCar' }
    );

    expect(res.every((x) => x.sharedCar === 0)).toBe(true);
  });

  describe('Retirement reasons', () => {
    test('The reason is returned as text, with its category', async () => {
      const res = await getUrlResponseForTesting<RaceResultDTO[]>(
        '/races/results/2021/1/R',
        {
          include:
            'positionOrder,reasonRetired,retirementCategory,retirementReasonId,entry.driver.id'
        }
      );

      const byDriver = (id: string) =>
        res.find((x) => x.entry?.driver?.id === id);

      expect(byDriver('alonso')).toMatchObject({
        retirementReasonId: 'brakes',
        reasonRetired: 'Brakes',
        retirementCategory: 'MECHANICAL'
      });
      expect(byDriver('mazepin')).toMatchObject({
        reasonRetired: 'Accident',
        retirementCategory: 'ACCIDENT'
      });
    });

    test('A car that finished has no reason', async () => {
      const res = await getUrlResponseForTesting<RaceResultDTO[]>(
        '/races/results/2021/1/R',
        { include: 'positionOrder,reasonRetired,retirementCategory' }
      );

      expect(res[0].reasonRetired).toBeNull();
      expect(res[0].retirementCategory).toBeNull();
    });
  });
});
