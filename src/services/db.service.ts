import { default as SQLite } from 'better-sqlite3';
import {
  Expression,
  Kysely,
  ParseJSONResultsPlugin,
  SelectQueryBuilder,
  sql,
  SqliteDialect
} from 'kysely';
import { jsonArrayFrom } from 'kysely/helpers/sqlite';
import { dbFilePath } from '../../data/constants';
import { getCountryName } from '../i18n/country-names';
import { Paginator } from '../models/pagination';
import { Sorter } from '../models/sorter';
import { DB } from '../models/types.dto';

let sharedDb: Kysely<DB> | undefined;

/** A single connection is shared by all the services, and opened on first use */
function getDb() {
  if (sharedDb) return sharedDb;

  const database = new SQLite(dbFilePath, { fileMustExist: true });

  // `country_name(alpha2Code)`: country name translated to the request locale
  database.function('country_name', { deterministic: false }, (code) =>
    getCountryName(String(code))
  );

  sharedDb = new Kysely<DB>({
    dialect: new SqliteDialect({ database }),
    plugins: [new ParseJSONResultsPlugin()]
  });

  return sharedDb;
}

export class DbService {
  get db(): Kysely<DB> {
    return getDb();
  }

  /**
   * Return a paginated result of a specified query
   *
   * @param selectFromAndWhere The main select with the `WHERE` filters. From this select we will calculate the number of total results
   * @param selectWithInclude Similar to the main select, with the same source and filters, but in this case with the attributes to include in the response. This select will be paginated
   * @param paginator Pagination data to paginate the `selectWithInclude` query
   * @param sorter Sort data to order the pages
   * @param sortExpressions SQL expressions to sort by some keys of the `sort` param that are not plain columns (e.g. calculated fields), with the `null` values at the end. The rest of the keys are sorted by the column with the same name
   */
  protected paginateSelect<
    TB extends keyof DB,
    ReturnType,
    SortType extends object
  >(
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    selectFromAndWhere: SelectQueryBuilder<DB, TB, {}>,
    selectWithInclude: SelectQueryBuilder<DB, TB, ReturnType>,
    paginator: Paginator,
    sorter?: Sorter<SortType>,
    sortExpressions?: Record<string, Expression<unknown>>
  ) {
    return selectFromAndWhere.select(({ fn, eb }) => [
      fn.countAll<number>().as('totalElements'),
      eb.val(paginator.pageSize).as('pageSize'),
      eb.val(paginator.pageNo).as('currentPage'),
      jsonArrayFrom(
        selectWithInclude
          .limit(paginator.pageSize)
          .offset(paginator.sqlOffset)
          .$call((qb) => {
            for (const item of sorter?.sortItems ?? []) {
              const expression = sortExpressions?.[item.key];

              qb = expression
                ? // Calculated fields can be null if there is no data, so put them at the end
                  qb.orderBy(expression, (ob) =>
                    (item.direction === 'desc'
                      ? ob.desc()
                      : ob.asc()
                    ).nullsLast()
                  )
                : qb.orderBy(sql.ref(item.key), item.direction);
            }

            return qb;
          })
      ).as('data')
    ]);
  }
}
