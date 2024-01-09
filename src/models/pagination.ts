export class PageMetadata {
  pageSize: number;
  totalElements: number;
  currentPage: number;

  constructor(totalElements: number, currentPage: number, pageSize: number) {
    this.totalElements = totalElements;
    this.pageSize = pageSize;
    this.currentPage = currentPage;
  }
}

export type PaginatedItems<T> = { data: T[] } & PageMetadata;

export class Paginator implements PageQueryParams {
  pageNo: number;
  pageSize: number;

  /** The offset that a SQL query with this params should have. Equivalent to `pageNo * pageSize`. */
  sqlOffset: number;

  /** Statement to put at the of a SQL query to get only certain results, that is `LIMIT x OFFSET y` */
  sqlStatement: string;

  constructor(pageNo?: number, pageSize?: number) {
    this.pageNo =
      pageNo == undefined || pageNo == null ? defaultPageNo : pageNo;

    this.pageSize =
      pageSize == undefined || pageSize == null ? defaultPageSize : pageSize;

    this.sqlOffset = this.pageSize * this.pageNo;

    this.sqlStatement = `LIMIT ${this.pageSize} OFFSET ${this.sqlOffset}`;
  }

  static fromPageQueryParams(obj: PageQueryParams) {
    return new Paginator(obj.pageNo, obj.pageSize);
  }
}

/** Query params to be passed to the paginated routes in the controllers. They are optional for the user, the pagination will be created with default params when required */
export interface PageQueryParams {
  /**
   * Page to retrieve, starting at 0
   *
   * @isInt The `pageNo` param should be an integer
   * @minimum 0 The minimum value of `pageNo` should be 0
   * @default 0
   * */
  pageNo?: number;

  /**
   * Size of the page to retrieve
   *
   * @isInt The `pageSize` param should be an integer
   * @minimum 1 The minimum value of `pageSize` should be 1
   * @default 10
   * */
  pageSize?: number;
}

export const defaultPageNo = 0;
export const defaultPageSize = 10;
