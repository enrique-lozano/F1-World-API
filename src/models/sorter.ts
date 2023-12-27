import { NestedKeyOf } from './../../src/utils/types/util-types';

type OrderDir = 'asc' | 'desc';

class SortItem<T extends string> {
  key: T;
  direction: OrderDir;

  constructor(data: Pick<SortItem<T>, 'direction' | 'key'>) {
    this.key = data.key;
    this.direction = data.direction;
  }

  get sqlStatement() {
    return `${this.key} ${this.direction}` as const;
  }

  get queryParam() {
    return `${this.direction == 'desc' ? '-' : ''}${this.key}` as const;
  }
}

export class Sorter<T extends object> implements SorterQueryParams {
  sort?: string;

  constructor(sort?: string) {
    this.sort = sort;
  }

  static fromSortItems<T extends object>(items: SortItem<NestedKeyOf<T>>[]) {
    return new Sorter<T>(items.map((e) => e.queryParam).join(','));
  }

  get sortItems() {
    if (!this.sort) return null;

    const arrayToReturn = this.sort.replaceAll(' ', '').split(',');

    if (arrayToReturn.length === 0) return null;

    const sortItemsArray = arrayToReturn.map((sortString) => {
      const direction: OrderDir = sortString.startsWith('-') ? 'desc' : 'asc';
      const key = (
        direction === 'desc' ? sortString.slice(1) : sortString
      ) as NestedKeyOf<T>;

      return new SortItem({ key, direction });
    });

    return sortItemsArray;
  }

  /** The list of SQL statements to sort by all the specified attributes in the `sort` query param
   *
   * #### Examples (`input` --> `output`):
   * - `'-name'` --> `['name DESC']`
   * - `'created_at,-name'` --> `['created_at ASC', 'name DESC']`
   */
  get sqlStatementList() {
    return this.sortItems?.map((e) => e.sqlStatement);
  }

  /** The SQL statement to sort by all the specified attributes in the `sort` query param
   *
   * #### Examples (`input` --> `output`):
   * - `'-name'` --> `'name DESC'`
   * - `'created_at,-name'` --> `'created_at ASC, name DESC'`
   */
  get sqlStatement() {
    return this.sqlStatementList?.join(', ');
  }
}

/**
 * Interface to define the optional `sort` query parameter according to JSON API specifications.
 * The `sort` parameter allows clients to sort the data of the responses.
 *
 * @interface SorterQueryParams
 * @see {@link https://jsonapi.org/format/#fetching-sorting | JSON API Specification - Fetching Sorting}
 * */
export interface SorterQueryParams {
  /**
   * Comma-separated list of fields/directions used to sort the primary resource's collection.
   * Each item in the list represents a field to sort by, with an optional `-` prefix for descending order (the default behavior is ascending).
   *
   * #### Examples:
   * - To sort by 'created_at' in ascending order: `sort=created_at`
   * - To sort by 'name' in descending order: `sort=-name`
   * - To sort by multiple fields: `sort=created_at,-name`
   *
   * @see {@link https://jsonapi.org/format/#fetching-sorting | JSON API Specification - Fetching Sorting}
   * */
  sort?: string;
}

export const defaultOrderDir: OrderDir = 'asc';
