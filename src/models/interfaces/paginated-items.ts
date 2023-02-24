export class PageMetadata {
  pageSize: number;
  totalElements: number;
  totalPages: number;
  currentPage: number;

  constructor(totalElements: number, currentPage: number, pageSize: number) {
    this.totalElements = totalElements;
    this.pageSize = pageSize;
    this.currentPage = currentPage;
    this.totalPages = Math.floor(this.totalElements / this.pageSize);
  }
}

export interface PaginatedItems<T> {
  items: T[];
  pageData: PageMetadata;
}

export class Paginator {
  pageNo: number;
  pageSize: number;

  /** Statement to put at the of a SQL query to get only certain results, that is `LIMIT x OFFSET y` */
  sqlStatement: string;

  constructor(pageNo?: string | number, pageSize?: string | number) {
    this.pageNo =
      pageNo == undefined || pageNo == null ? defaultPageNo : Number(pageNo);

    this.pageSize =
      pageSize == undefined || pageSize == null
        ? defaultPageSize
        : Number(pageSize);

    this.sqlStatement = `LIMIT ${this.pageSize} OFFSET ${
      this.pageSize * this.pageNo
    }`;
  }
}

export interface pageQueryParams {
  /**
   * Page to retrieve, starting at 0
   *
   * @default 0
   * */
  pageNo?: number | string;

  /**
   * Size of the page to retrieve
   *
   * @default 10
   * */ pageSize?: number | string;
}

export const defaultPageNo = 0;
export const defaultPageSize = 10;
