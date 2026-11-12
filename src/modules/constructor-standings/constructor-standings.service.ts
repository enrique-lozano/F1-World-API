import { sql } from 'kysely';
import { IncludeParam } from '../../models/include-filter';
import { DbService } from '../../services/db.service';
import { getRoundFromIdColumn } from '../../utils/f1-sql-common-utils';
import { ConstructorService } from '../constructor/constructor.service';
import { EngineManufacturerService } from '../engine/engine.service';
import type {
  ConstructorChampResult,
  ConstructorStandingController
} from './constructor-standings.controller';

/** First season of the Constructors' Championship */
export const FIRST_CONSTRUCTORS_SEASON = 1958;

/** Until this season only the best placed car of each constructor scored in a race */
const LAST_SEASON_BEST_CAR_ONLY = 1978;

/** The Indianapolis 500 was a round of the drivers' championship in these seasons, but not of the constructors' one */
const INDIANAPOLIS_SEASONS = [1958, 1959, 1960];

/**
 * Points of the positions in the seasons whose constructors' points cannot be
 * taken from the results: the point of the fastest lap (1958-1959) and the
 * split points of the shared cars (until 1960) did not count for the constructors.
 */
const POSITION_POINTS: Record<number, number[]> = {
  1958: [8, 6, 4, 3, 2],
  1959: [8, 6, 4, 3, 2],
  1960: [8, 6, 4, 3, 2, 1]
};

/**
 * Seasons in which only the best results of the constructors counted, as
 * groups of rounds: `best` results of the rounds from `from` to `to`.
 */
type CountedResults = { from: number; to: number; best: number }[];

const all = (best: number): CountedResults => [{ from: 1, to: 99, best }];

const COUNTED_RESULTS: Record<number, CountedResults> = {
  1958: all(6),
  1959: all(5),
  1960: all(6),
  1961: all(5),
  1962: all(5),
  1963: all(6),
  1964: all(6),
  1965: all(6),
  1966: all(5),
  1967: [
    { from: 1, to: 6, best: 5 },
    { from: 7, to: 99, best: 4 }
  ]
};

type ChampionshipRow = {
  sessionId: string;
  positionText: string;
  points: number | null;
  constructorId: string;
  engineBrandId: string;
};

export class ConstructorStandingService
  extends DbService
  implements
    Pick<ConstructorStandingController, 'getConstructorChampionshipResults'>
{
  async getConstructorChampionshipResults(
    season: number,
    round?: number
  ): Promise<ConstructorChampResult[]> {
    if (season < FIRST_CONSTRUCTORS_SEASON) return [];

    const rows: ChampionshipRow[] = await this.db
      .selectFrom('raceResults')
      .innerJoin('entries', 'entries.id', 'raceResults.entryId')
      .innerJoin('chassis', 'chassis.id', 'entries.chassisId')
      .innerJoin('engines', 'engines.id', 'entries.engineId')
      .where(
        sql<number>`cast(substr(raceResults.sessionId, 1, 4) as INT)`,
        '==',
        season
      )
      .where('raceResults.pointsCountForWCC', '==', 1)
      .$if(round != undefined, (qb) =>
        qb.where(getRoundFromIdColumn('raceResults.sessionId'), '<=', round!)
      )
      .select([
        'raceResults.sessionId',
        'raceResults.positionText',
        'raceResults.points',
        'chassis.constructorId',
        sql<string>`COALESCE(entries.engineBrandId, engines.manufacturerId)`.as(
          'engineBrandId'
        )
      ])
      .execute();

    const excludedEvents = INDIANAPOLIS_SEASONS.includes(season)
      ? (
          await this.db
            .selectFrom('events')
            .select('id')
            .where('grandPrixId', '==', 'indianapolis')
            .where('id', 'like', `${season}-%`)
            .execute()
        ).map((e) => e.id)
      : [];

    const standings = ConstructorStandingService.calculate(
      rows.filter((r) => !excludedEvents.includes(r.sessionId.slice(0, 7))),
      season
    );

    return this.withDetails(standings);
  }

  /** Points and wins of every (chassis constructor, engine brand), applying the rules of the season */
  static calculate(rows: ChampionshipRow[], season: number) {
    const teams = new Map<
      string,
      {
        constructorId: string;
        engineBrandId: string;
        wins: number;
        /** Points scored in each race (the cars of the constructor added up, or just the best placed one) */
        races: { round: number; points: number }[];
      }
    >();
    const perRace = new Map<string, ChampionshipRow[]>();

    for (const row of rows) {
      const key = `${row.constructorId}|${row.engineBrandId}`;
      if (!teams.has(key)) {
        teams.set(key, {
          constructorId: row.constructorId,
          engineBrandId: row.engineBrandId,
          wins: 0,
          races: []
        });
      }
      perRace.set(`${row.sessionId}|${key}`, [
        ...(perRace.get(`${row.sessionId}|${key}`) ?? []),
        row
      ]);
    }

    for (const [raceAndKey, cars] of perRace) {
      const [sessionId, constructorId, engineBrandId] = raceAndKey.split('|');
      const team = teams.get(`${constructorId}|${engineBrandId}`)!;
      const round = Number(sessionId.slice(5, 7));

      if (
        sessionId.endsWith('-R') &&
        cars.some((c) => c.positionText === '1')
      ) {
        team.wins++;
      }

      team.races.push({
        round,
        points: ConstructorStandingService.racePoints(cars, season)
      });
    }

    const counted = COUNTED_RESULTS[season];

    return [...teams.values()]
      .map((team) => {
        const totalPoints = team.races.reduce((sum, r) => sum + r.points, 0);
        const points = counted
          ? counted.reduce((sum, group) => {
              const scores = team.races
                .filter((r) => r.round >= group.from && r.round <= group.to)
                .map((r) => r.points)
                .sort((a, b) => b - a)
                .slice(0, group.best);
              return sum + scores.reduce((a, b) => a + b, 0);
            }, 0)
          : totalPoints;

        return { ...team, points, totalPoints };
      })
      .sort(
        (a, b) =>
          b.points - a.points ||
          b.wins - a.wins ||
          a.constructorId.localeCompare(b.constructorId)
      );
  }

  /** Points that the cars of a constructor (with the same engine brand) score in one race */
  private static racePoints(cars: ChampionshipRow[], season: number) {
    if (season > LAST_SEASON_BEST_CAR_ONLY) {
      return cars.reduce((sum, c) => sum + (c.points ?? 0), 0);
    }

    // Only the best placed car scores. The rows of a shared car have the same position
    // (a retired car can have points too: the fastest lap point of the 1950s)
    const scoring = cars.filter(
      (c) => (c.points ?? 0) > 0 && Number.isInteger(Number(c.positionText))
    );
    if (scoring.length === 0) return 0;
    const best = Math.min(...scoring.map((c) => Number(c.positionText)));

    const positionPoints = POSITION_POINTS[season];
    if (positionPoints) return positionPoints[best - 1] ?? 0;

    return scoring
      .filter((c) => Number(c.positionText) === best)
      .reduce((sum, c) => sum + (c.points ?? 0), 0);
  }

  private async withDetails(
    standings: ReturnType<typeof ConstructorStandingService.calculate>
  ): Promise<ConstructorChampResult[]> {
    if (standings.length === 0) return [];

    const constructors = await ConstructorService.getConstructorsSelect(
      this.db.selectFrom('constructors'),
      IncludeParam.fromFieldsArray([
        'id',
        'name',
        'fullName',
        'companyId',
        'country'
      ])
    )
      .where('constructors.id', 'in', [
        ...new Set(standings.map((s) => s.constructorId))
      ])
      .execute();

    const brands = await EngineManufacturerService.getEngineManufacturersSelect(
      this.db.selectFrom('engineManufacturers')
    )
      .where('engineManufacturers.id', 'in', [
        ...new Set(standings.map((s) => s.engineBrandId))
      ])
      .execute();

    return standings.map((s, index) => {
      const constructor = constructors.find((c) => c.id === s.constructorId);
      const brand = brands.find((b) => b.id === s.engineBrandId);
      // Ferrari-Ferrari is just "Ferrari"; McLaren-Mercedes keeps both names
      const sameMaker = s.constructorId === s.engineBrandId;

      return {
        position: index + 1,
        name:
          constructor && brand && !sameMaker
            ? `${constructor.name}-${brand.name}`
            : (constructor?.name ?? s.constructorId),
        chassisConstructor: constructor ?? null,
        engineManufacturer: brand ?? null,
        points: s.points,
        totalPoints: s.totalPoints,
        wins: s.wins
      };
    });
  }
}
