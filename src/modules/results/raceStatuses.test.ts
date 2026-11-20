import { describe, expect, test } from 'vitest';
import { ResultStatusCode } from '../../models/enums';
import { ResultStatuses } from '../../models/db';
import {
  DriverEventResultDTO,
  EventEntryDTO,
  RaceResultDTO
} from '../../models/dto';
import {
  getUrlForTesting,
  getUrlResponseForTesting
} from '../../utils/test/test-utils';

describe('Drivers that did not take the start', () => {
  test('Every code of the race results is documented', async () => {
    const res =
      await getUrlResponseForTesting<ResultStatuses[]>('/result-statuses');

    // The enum documents each code, it has to match the table
    expect(res.map((x) => x.code)).toEqual(Object.values(ResultStatusCode));
    expect(res.find((x) => x.code === 'DNQ')).toMatchObject({
      raceEntry: 1,
      started: 0
    });
  });

  test('The non-qualifiers and non-pre-qualifiers are in the race results', async () => {
    const res = await getUrlResponseForTesting<RaceResultDTO[]>(
      '/sessions/1989/1/R/results',
      { include: 'positionText' }
    );

    const codes = res.map((x) => x.positionText);
    expect(codes.filter((x) => x === 'DNQ')).toHaveLength(4);
    expect(codes.filter((x) => x === 'DNPQ')).toHaveLength(8);
    // after the drivers that took the start, and before the ones that did not arrive (Streiff and Tarquini, AGS)
    expect(codes.slice(-14)).toEqual([
      ...Array(4).fill('DNQ'),
      ...Array(8).fill('DNPQ'),
      'DNA',
      'DNA'
    ]);
  });

  test('A season of Masten Gregory, as in Wikipedia', async () => {
    const res = await getUrlResponseForTesting<DriverEventResultDTO[]>(
      '/drivers/gregory/results',
      { season: '1961' }
    );

    const byRound = Object.fromEntries(
      res.map((x) => [x.round, x.positionText])
    );
    expect(byRound).toMatchObject({
      1: 'DNQ',
      2: 'DNS',
      3: '10',
      6: 'DNA'
    });
  });

  test('A driver replaced after practice is withdrawn, not a test driver', async () => {
    const res = await getUrlResponseForTesting<DriverEventResultDTO[]>(
      '/drivers/massa/results',
      { season: '2017' }
    );

    expect(res.find((x) => x.round === 11)?.positionText).toBe('WD');
  });

  test('A test driver has TD in the GPs without a race result', async () => {
    const res = await getUrlResponseForTesting<DriverEventResultDTO[]>(
      '/drivers/celis/results'
    );

    expect(res).toHaveLength(9);
    expect(res.every((x) => x.positionText === 'TD')).toBe(true);
    expect(res[0]).toMatchObject({
      season: 2016,
      round: 2,
      constructorId: 'force-india'
    });
  });

  test('The entry of a test driver says it', async () => {
    const res = await getUrlResponseForTesting<EventEntryDTO[]>(
      '/events/2016/2/entries',
      { include: 'entry.id,entry.testDriver' }
    );

    expect(res.find((x) => x.entry.id === '2016-CEL')?.entry.testDriver).toBe(
      1
    );
    expect(res.find((x) => x.entry.id === '2016-HAM')?.entry.testDriver).toBe(
      0
    );
  });

  test('A driver withdrawn after qualifying is WD (Mick Schumacher, Saudi Arabia 2022)', async () => {
    const res = await getUrlResponseForTesting<RaceResultDTO[]>(
      '/sessions/2022/2/R/results',
      { include: 'positionText,entry.driver.id' }
    );

    expect(
      res.slice(-2).map((x) => [x.entry?.driver?.id, x.positionText])
    ).toEqual([
      ['tsunoda', 'DNS'],
      ['mick-schumacher', 'WD']
    ]);
  });

  test('The entries of an event include the test drivers', async () => {
    const res = await getUrlResponseForTesting<EventEntryDTO[]>(
      '/events/2016/2/entries',
      { include: 'entry.id,entry.driver.id' }
    );

    expect(res.find((x) => x.entry.driver?.id === 'celis')?.participation).toBe(
      'TD'
    );
    expect(res[0].participation).toBe('1');
  });

  test('The starts do not count the drivers that did not take the start', async () => {
    const res = await getUrlResponseForTesting<{
      races: number;
      starts: number;
    }>('/drivers/celis/stats');

    expect(res).toMatchObject({ races: 0, starts: 0 });
  });
});

describe('Not found', () => {
  test.each([
    '/drivers/not-a-driver',
    '/drivers/not-a-driver/results',
    '/events/1900/1',
    '/events/1900/1/entries',
    '/sessions/2021/1/XX',
    '/circuits/not-a-circuit'
  ])('%s is a 404', async (url) => {
    await getUrlForTesting(url).expect(404);
  });
});
