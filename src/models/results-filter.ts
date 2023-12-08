import { PageQueryParams } from './paginated-items';
import { SorterQueryParams } from './sorter';
import { TimedSessionResults } from './types.dto';

export interface SessionQueryParams extends PageQueryParams, SorterQueryParams {
  season?: number;

  round?: number;

  session?: string;
}

export interface SessionEntrantQueryParams extends SessionQueryParams {
  /** Return only the items regarding this driver */
  driverId?: string;
}

export interface ResultsFiltersQueryParams extends SessionEntrantQueryParams {
  /** Look for the results where the driver achieved a position worse than or equal to this number.  */
  minPos?: number;

  /** Look for the results where the driver achieved a position better than or equal to this number.  */
  maxPos?: number;

  /** Filter by a specific postion text, that can be `1`, `2`, `3`... or `DNF`, `DNS`... */
  positionText?: string;
}

export interface TimedSessionResultQueryParams
  extends ResultsFiltersQueryParams {
  positionText?: string;

  /** @default eventId */
  orderBy?: keyof TimedSessionResults;
}
