import { sql } from 'kysely';
import { CareerStats } from '../models/types.dto';
import { DbService } from '../services/db.service';
import { getSessionIdFromIdColumn } from '../utils/f1-sql-common-utils';

/**
 * Entity (driver or constructor) whose career we want to get. A driver is
 * identified by `entries.driverId` and a constructor by `chassis.constructorId`
 * (the chassis of the entry).
 */
export type CareerEntityColumn = 'driverId' | 'constructorId';

/** Column that holds the ID of the entity */
const entityColumn = (column: CareerEntityColumn) =>
  sql.ref(column === 'driverId' ? 'entries.driverId' : 'chassis.constructorId');

/** Joins of a results table (or laps...) needed to reach the column of the entity */
const entryJoins = (table: string, column: CareerEntityColumn) =>
  sql`INNER JOIN entries ON entries.id = ${sql.ref(`${table}.entryId`)}${
    column === 'constructorId'
      ? sql` INNER JOIN chassis ON chassis.id = entries.chassisId`
      : sql``
  }`;

const resultsTables = [
  'raceResults',
  'qualifyingResults',
  'fpResults'
] as const;

/** Statistics and seasons of a driver or a constructor, calculated from the results of its entries */
export class CareerService extends DbService {
  /**
   * SQL expression with the first (`min`) or last (`max`) season in which an
   * entity had at least one entry, that is, appears in the results of a race,
   * qualifying or free practice session.
   *
   * @param column The entity: a driver or a constructor
   * @param entityIdRef Reference to the column with the ID of the entity in the outer query (e.g. `drivers.id`)
   */
  static entrySeasonExpression(
    column: CareerEntityColumn,
    entityIdRef: string,
    aggregate: 'min' | 'max'
  ) {
    const agg = sql.raw(aggregate);

    // The session IDs start with the season ("2021-01-R"), so the first/last ID is from the first/last season
    const perTable = resultsTables.map(
      (table) =>
        sql`SELECT ${agg}(${sql.ref(`${table}.sessionId`)}) AS sessionId FROM ${sql.table(table)} ${entryJoins(table, column)} WHERE ${entityColumn(column)} = ${sql.ref(entityIdRef)}`
    );

    return sql<
      number | null
    >`(SELECT CAST(substr(${agg}(sessionId), 1, 4) AS INT) FROM (${sql.join(perTable, sql` UNION ALL `)}))`;
  }

  /** Seasons in which the entity had at least one entry (race, qualifying or free practice result), in ascending order */
  async getEntrySeasons(column: CareerEntityColumn, entityId: string) {
    const perTable = resultsTables.map(
      (table) =>
        sql`SELECT DISTINCT CAST(substr(${sql.ref(`${table}.sessionId`)}, 1, 4) AS INT) AS season FROM ${sql.table(table)} ${entryJoins(table, column)} WHERE ${entityColumn(column)} = ${entityId}`
    );

    const res = await sql<{
      season: number;
    }>`SELECT season FROM (${sql.join(perTable, sql` UNION `)}) ORDER BY season`.execute(
      this.db
    );

    return res.rows.map((x) => x.season);
  }

  /** Career statistics of a driver or a constructor. See `CareerStats` for the exact definition of each value */
  async getStats(
    column: CareerEntityColumn,
    entityId: string
  ): Promise<CareerStats> {
    const isRace = sql`${getSessionIdFromIdColumn('raceResults.sessionId')} = 'R'`;

    const stats = await this.db
      .selectFrom('raceResults')
      .innerJoin('entries', 'entries.id', 'raceResults.entryId')
      .$if(column === 'constructorId', (qb) =>
        qb.innerJoin('chassis', 'chassis.id', 'entries.chassisId')
      )
      .where(entityColumn(column), '==', entityId)
      .select([
        sql<number>`COUNT(DISTINCT CASE WHEN ${isRace} THEN raceResults.sessionId END)`.as(
          'races'
        ),
        sql<number>`COUNT(DISTINCT CASE WHEN ${isRace} AND raceResults.positionText NOT IN ('DNS', 'DNQ', 'WD') THEN raceResults.sessionId END)`.as(
          'starts'
        ),
        sql<number>`COUNT(DISTINCT CASE WHEN ${isRace} AND raceResults.positionText = '1' THEN raceResults.sessionId END)`.as(
          'wins'
        ),
        // Shared drives (several drivers in the same car) have several rows with the same position
        sql<number>`COUNT(DISTINCT CASE WHEN ${isRace} AND raceResults.positionText IN ('1', '2', '3') THEN raceResults.sessionId || '/' || raceResults.positionText END)`.as(
          'podiums'
        ),
        sql<number>`COUNT(DISTINCT CASE WHEN ${isRace} AND raceResults.gridPosition = 1 THEN raceResults.sessionId END)`.as(
          'poles'
        ),
        sql<number>`TOTAL(raceResults.points)`.as('points')
      ])
      .executeTakeFirstOrThrow();

    return {
      ...stats,
      fastestLaps: await this.countFastestLaps(column, entityId)
    };
  }

  /** Number of races (session `R`) in which the entity set the fastest lap */
  private async countFastestLaps(column: CareerEntityColumn, entityId: string) {
    const res = await this.db
      .with('entityBestLaps', (db) =>
        db
          .selectFrom('lapTimes')
          .innerJoin('entries', 'entries.id', 'lapTimes.entryId')
          .$if(column === 'constructorId', (qb) =>
            qb.innerJoin('chassis', 'chassis.id', 'entries.chassisId')
          )
          .where(entityColumn(column), '==', entityId)
          .where(getSessionIdFromIdColumn('lapTimes.sessionId'), '==', 'R')
          .groupBy('lapTimes.sessionId')
          .select(({ fn }) => [
            'lapTimes.sessionId',
            fn.min<number>('lapTimes.time').as('bestTime')
          ])
      )
      .selectFrom('entityBestLaps')
      .where(({ eb, selectFrom }) =>
        eb(
          'entityBestLaps.bestTime',
          '==',
          selectFrom('lapTimes')
            .select(({ fn }) => fn.min<number>('lapTimes.time').as('minTime'))
            .whereRef('lapTimes.sessionId', '==', 'entityBestLaps.sessionId')
        )
      )
      .select(({ fn }) => fn.countAll<number>().as('fastestLaps'))
      .executeTakeFirstOrThrow();

    return res.fastestLaps;
  }
}
