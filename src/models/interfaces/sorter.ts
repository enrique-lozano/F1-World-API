type OrderDir = 'ASC' | 'DESC';

export class Sorter<T> implements SorterQueryParams {
  orderBy: keyof T;
  orderDir: OrderDir;

  /** Statement to put at the of a SQL query to get only certain results, that is `ORDER BY x {ASC|DESC}` */
  sqlStatement: string;

  constructor(orderBy: keyof T, orderDir?: OrderDir) {
    this.orderBy = orderBy;
    this.orderDir = orderDir ?? defaultOrderDir;

    this.sqlStatement = `ORDER BY ${String(this.orderBy)} ${this.orderDir}`;
  }
}

export interface SorterQueryParams {
  /**
   * Order of the results
   *
   * @default ASC */
  orderDir?: OrderDir;

  // * TSOA do not accept generics by the moment, so we can not include the orderBy here. We have to include this attribute manually on each query interface
}

export const defaultOrderDir: OrderDir = 'ASC';
