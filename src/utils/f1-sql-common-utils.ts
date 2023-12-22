import { sql } from 'kysely';

/** Get the season year number from a column with the format "YYYY-..." */
export function getSeasonFromIdColumn(columnToGet: string) {
  return sql<number>`cast(substr(${sql.ref(columnToGet)}, 1, 4) as INT)`;
}

/** Get the round number from a column with the format "YYYY-RR-..."
 *
 * A column with a value of "2020-03-XX" will return `03`
 */
export function getRoundFromIdColumn(columnToGet: string) {
  return sql<number>`cast(substr(${sql.ref(columnToGet)}, 6, 2) as INT)`;
}

/** Get the round number from a column with the format "YYYY-RR-SS"
 *
 * A column with a value of "2020-03-XX" will return `XX`
 */
export function getSessionIdFromIdColumn(columnToGet: string) {
  return sql<string>`substr(${sql.ref(columnToGet)}, 9, 20)`;
}
