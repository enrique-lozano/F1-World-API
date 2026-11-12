import { describe, expect, test } from 'vitest';
import { getUrlResponseForTesting } from '../../utils/test/test-utils';
import type { ConstructorChampResult } from './constructor-standings.controller';

const standings = (season: number, query?: Record<string, string>) =>
  getUrlResponseForTesting<ConstructorChampResult[]>(
    `/championships/${season}/constructors`,
    query
  );

const pointsOf = (res: ConstructorChampResult[]) =>
  Object.fromEntries(res.map((x) => [x.name, x.points]));

describe('Test the calculated constructors championship', () => {
  test('There is no championship before 1958', async () => {
    expect(await standings(1957)).toEqual([]);
  });

  test('1958: the best placed car of each constructor, best 6 results, no fastest lap point', async () => {
    const res = await standings(1958);

    expect(res[0]).toMatchObject({ name: 'Vanwall', points: 48 });
    expect(pointsOf(res)['Ferrari']).toBe(40);
    // Moss's Cooper of Walker scores for Cooper-Climax together with the works cars
    expect(pointsOf(res)['Cooper-Climax']).toBe(31);
  });

  test('1985: Tyrrell scored as two constructors, by engine', async () => {
    const res = await standings(1985);

    expect(res[8]).toMatchObject({ name: 'Tyrrell-Ford', position: 9 });
    expect(res[9]).toMatchObject({ name: 'Tyrrell-Renault', position: 10 });
  });

  test('1990: Larrousse (Lola) has no constructor points, but its drivers keep theirs', async () => {
    const res = await standings(1990);
    expect(res.some((x) => x.chassisConstructor?.id === 'lola')).toBe(false);

    const drivers = await getUrlResponseForTesting<
      { driver: { id: string }; points: number }[]
    >('/championships/1990/drivers');
    expect(drivers.find((d) => d.driver.id === 'aguri-suzuki')?.points).toBe(6);
  });

  test('1995: Benetton and Williams lost the constructors points of Brazil', async () => {
    const res = pointsOf(await standings(1995));
    expect(res['Benetton-Renault']).toBe(137);
    expect(res['Williams-Renault']).toBe(112);
  });

  test('2007: McLaren was excluded', async () => {
    const res = await standings(2007);
    expect(res[0]).toMatchObject({ name: 'Ferrari', points: 204 });
    expect(res.some((x) => x.chassisConstructor?.id === 'mclaren')).toBe(false);
  });

  test('2016: Red Bull appears as Red Bull-TAG Heuer', async () => {
    const res = await standings(2016);
    const redBull = res.find((x) => x.chassisConstructor?.id === 'red-bull');

    expect(redBull?.name).toBe('Red Bull-TAG Heuer');
    expect(redBull?.engineManufacturer?.id).toBe('tag-heuer');
  });

  test('The standings can be calculated up to a round', async () => {
    const res = await standings(2021, { round: '1' });
    expect(res[0].points).toBeLessThanOrEqual(43);
  });

  test('The champion of each season matches the official one', async () => {
    const champions: Record<number, string> = {
      1958: 'Vanwall',
      1959: 'Cooper-Climax',
      1961: 'Ferrari',
      1962: 'BRM',
      1964: 'Ferrari',
      1965: 'Lotus-Climax',
      1966: 'Brabham-Repco',
      1971: 'Tyrrell-Ford',
      1984: 'McLaren-TAG',
      1992: 'Williams-Renault',
      1995: 'Benetton-Renault',
      2004: 'Ferrari',
      2009: 'Brawn-Mercedes',
      2013: 'Red Bull-Renault',
      2021: 'Mercedes'
    };

    for (const [season, name] of Object.entries(champions)) {
      expect((await standings(Number(season)))[0].name, season).toBe(name);
    }
  });
});
