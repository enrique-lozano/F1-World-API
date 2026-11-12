import { describe, expect, test } from 'vitest';
import { PaginatedItems } from '../../models/pagination';
import {
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

  test('Unknown entrants are a client error', async () => {
    await getUrlForTesting('/entrants/not-a-team').expect(400);
    await getUrlForTesting('/entrants/not-a-team/lineage').expect(400);
  });
});
