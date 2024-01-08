import { Kysely, sql } from 'kysely';
import { OrderByDirection } from 'kysely/dist/cjs/parser/order-by-parser';
import { DB } from './../models/types.dto';

/** Support for order with nulls (see [this GitHub issue](https://github.com/kysely-org/kysely/issues/714)) */
export const orderNullsLast = (direction: OrderByDirection) =>
  sql`${sql.raw(direction)} nulls last`;

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

export async function isColumnInTable(
  db: Kysely<DB>,
  column: string,
  table: keyof DB
) {
  const res = await db
    .selectFrom(`pragma_table_info('${table}')` as any)
    .select(({ fn }) => fn.countAll<number>().as('totalElements'))
    .where('name', '==', column)
    .executeTakeFirstOrThrow();

  return res.totalElements === 1;
}

export async function tableColumnNames(db: Kysely<DB>, table: keyof DB) {
  const res = await db
    .selectFrom(`pragma_table_info('${table}')` as any)
    .select(['name'])
    .execute();

  return res.map((e) => e.name);
}

type SQLiteErrorCodes = 'SQLITE_ERROR';

export interface KyselyExecutionError extends Error {
  code?: SQLiteErrorCodes;
}
