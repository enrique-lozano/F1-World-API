import { default as SQLite } from 'better-sqlite3';
import {
  Kysely,
  ParseJSONResultsPlugin,
  SelectQueryBuilder,
  SqliteDialect
} from 'kysely';
import { jsonArrayFrom } from 'kysely/helpers/sqlite';
import { Paginator } from '../models/pagination';
import { Sorter } from '../models/sorter';
import { DB } from '../models/types.dto';

export class DbService {
  db: Kysely<DB>;

  constructor() {
    const dialect = new SqliteDialect({
      database: new SQLite('data/db/test.db')
    });

    this.db = new Kysely<DB>({
      dialect,
      plugins: [new ParseJSONResultsPlugin()]
    });
  }

  /**
   * Return a paginated result of a specified query
   *
   * @param selectFromAndWhere The main select with the `WHERE` filters. From this select we will calculate the number of total results
   * @param selectWithInclude Similar to the main select, with the same source and filters, but in this case with the attributes to include in the response. This select will be paginated
   * @param paginator Pagination data to paginate the `selectWithInclude` query
   * @param sorter Sort data to order the pages
   */
  protected paginateSelect<
    TB extends keyof DB,
    ReturnType,
    SortType extends object
  >(
    // eslint-disable-next-line @typescript-eslint/ban-types
    selectFromAndWhere: SelectQueryBuilder<DB, TB, {}>,
    selectWithInclude: SelectQueryBuilder<DB, TB, ReturnType>,
    paginator: Paginator,
    sorter?: Sorter<SortType>
  ) {
    return selectFromAndWhere.select(({ fn, eb }) => [
      fn.countAll<number>().as('totalElements'),
      eb.val(paginator.pageSize).as('pageSize'),
      eb.val(paginator.pageNo).as('currentPage'),
      jsonArrayFrom(
        selectWithInclude
          .limit(paginator.pageSize)
          .offset(paginator.sqlOffset)
          .$if(
            sorter != undefined && sorter.sqlStatementList != undefined,
            (qb) => qb.orderBy(sorter!.sqlStatementList!)
          )
      ).as('data')
    ]);
  }
}
