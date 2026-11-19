import { describe, expect, test } from 'vitest';
import { PaginatedItems } from '../../models/pagination';
import {
  CareerStats,
  EntrantChampionship,
  EntrantDTO,
  EntrantLineage,
  EntrantNameUsage,
  EntrantSeasonDTO
} from '../../models/types.dto';
import {
  getUrlForTesting,
  getUrlResponseForTesting
} from '../../utils/test/test-utils';

describe('Test entrants functionality', () => {
  test('Get entrants filtered by name and season', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<EntrantDTO>>(
      '/entrants',
      { name: 'ferrari', season: '2021' }
    );

    expect(res.data.map((x) => x.id)).toContain('scuderia-ferrari');
  });

  test('Tyrrell spans 1966-1998 and has its own lineage', async () => {
    const res = await getUrlResponseForTesting<EntrantDTO>(
      '/entrants/tyrrell-racing'
    );

    expect(res.firstSeason).toBe(1966);
    expect(res.lastSeason).toBe(1998);
    expect(res.latestEntrantName).toBe('PIAA Tyrrell');
    expect(res.licenceCountry?.alpha2Code).toBe('GB');
  });

  test('The lineage of Tyrrell reaches Mercedes', async () => {
    const res = await getUrlResponseForTesting<EntrantLineage>(
      '/entrants/tyrrell-racing/lineage'
    );

    expect(res.predecessors).toEqual([]);
    expect(res.successors.map((x) => x.entrant.id)).toEqual([
      'bar',
      'honda-racing',
      'brawn-gp',
      'mercedes'
    ]);
    expect(res.successors[0]).toMatchObject({ year: 1999, type: 'TAKEOVER' });
  });

  test('The lineage of Alpine goes back to Toleman', async () => {
    const res = await getUrlResponseForTesting<EntrantLineage>(
      '/entrants/alpine/lineage'
    );

    expect(res.predecessors.map((x) => x.entrant.id)).toEqual([
      'renault-sport-f1-team',
      'lotus-f1-team',
      'renault-f1-team',
      'benetton',
      'toleman'
    ]);
    expect(res.predecessors[0]).toMatchObject({ type: 'RENAME', year: 2021 });
  });

  test('Seasons: works or customer team and licence', async () => {
    const res = await getUrlResponseForTesting<EntrantSeasonDTO[]>(
      '/entrants/tyrrell-racing/seasons',
      { include: 'season,type,ownConstructor.id,licenceCountry.alpha2Code' }
    );

    expect(res.find((x) => x.season === 1968)).toMatchObject({
      type: 'CUSTOMER',
      ownConstructor: null
    });
    expect(res.find((x) => x.season === 1975)).toMatchObject({
      type: 'WORKS',
      ownConstructor: { id: 'tyrrell' },
      licenceCountry: { alpha2Code: 'GB' }
    });
  });

  test('Ferrari 2021 is one season with several registered names', async () => {
    const seasons = await getUrlResponseForTesting<EntrantSeasonDTO[]>(
      '/entrants/scuderia-ferrari/seasons',
      { include: 'id,season' }
    );
    expect(seasons.filter((x) => x.season === 2021).length).toBe(1);

    const names = await getUrlResponseForTesting<EntrantNameUsage[]>(
      '/entrants/scuderia-ferrari/names'
    );
    const winnow = names.find((x) => x.name.includes('Mission Winnow'));
    expect(winnow).toBeDefined();
    expect(names.find((x) => x.name === 'Scuderia Ferrari')?.ranges[0]).toEqual(
      { from: 1950, to: 1960 }
    );
  });

  test('Stats of Ferrari', async () => {
    const res = await getUrlResponseForTesting<CareerStats>(
      '/entrants/scuderia-ferrari/stats'
    );

    expect(res.wins).toBeGreaterThanOrEqual(200);
    expect(res.races).toBeGreaterThan(1000);
    expect(res.starts).toBeLessThanOrEqual(res.races);
    expect(res.podiums).toBeGreaterThan(res.wins);
    expect(res.fastestLaps).toBeGreaterThan(100);
  });

  test('Stats can include the predecessors of the lineage', async () => {
    const own = await getUrlResponseForTesting<CareerStats>(
      '/entrants/aston-martin/stats'
    );
    const all = await getUrlResponseForTesting<CareerStats>(
      '/entrants/aston-martin/stats',
      { includePredecessors: 'true' }
    );

    expect(all.races).toBeGreaterThan(own.races);
    expect(all.wins).toBeGreaterThan(own.wins);
    expect(all.points).toBeGreaterThan(own.points);

    const ferrari = await getUrlResponseForTesting<CareerStats>(
      '/entrants/scuderia-ferrari/stats',
      { includePredecessors: 'true' }
    );
    const ferrariOwn = await getUrlResponseForTesting<CareerStats>(
      '/entrants/scuderia-ferrari/stats'
    );
    expect(ferrari).toEqual(ferrariOwn);
  });

  test('Championships of Ferrari: own constructor position per season', async () => {
    const res = await getUrlResponseForTesting<EntrantChampionship[]>(
      '/entrants/scuderia-ferrari/championships'
    );

    expect(res[0].season).toBe(1958);
    expect(res.map((x) => x.season)).toEqual(
      [...res.map((x) => x.season)].sort((a, b) => a - b)
    );
    expect(res.find((x) => x.season === 2008)).toMatchObject({
      position: 1,
      points: 172,
      wins: 8,
      constructor: { id: 'ferrari', name: 'Ferrari' }
    });
    expect(res.filter((x) => x.position === 1).length).toBeGreaterThanOrEqual(
      16
    );
  });

  test('Customer seasons and seasons before 1958 have no championship result', async () => {
    const res = await getUrlResponseForTesting<EntrantChampionship[]>(
      '/entrants/aston-martin/championships'
    );

    expect(res.map((x) => x.season)).toContain(2022);
    expect(res.every((x) => x.season >= 1958)).toBe(true);
    expect(res.every((x) => x.constructor.id.length > 0)).toBe(true);
  });

  test('Unknown entrants are a client error', async () => {
    await getUrlForTesting('/entrants/not-a-team').expect(404);
    await getUrlForTesting('/entrants/not-a-team/lineage').expect(404);
    await getUrlForTesting('/entrants/not-a-team/stats').expect(404);
    await getUrlForTesting('/entrants/not-a-team/stats', {
      includePredecessors: 'true'
    }).expect(404);
    await getUrlForTesting('/entrants/not-a-team/championships').expect(404);
  });
});
