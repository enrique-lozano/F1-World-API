import { IncludeQueryParam } from './include-filter';
import { PageQueryParams } from './pagination';
import { SorterQueryParams } from './sorter';
import { TimedSessionResults } from './types.dto';

/** The optional `locale` query parameter, used to translate some content (e.g. the country names) */
export interface LocaleQueryParam {
  /**
   * Language of the translated content, as a BCP 47 tag (`en`, `es`, `pt-BR`...).
   *
   * @default "en"
   */
  locale?: string;
}

/** A interface that define the query parameters needed for pagination, sorting and including resources.
 *
 * Internally, this interface extends this 4 interfaces:
 * - `PageQueryParams`
 * - `SorterQueryParams`
 * - `IncludeQueryParams`
 * - `LocaleQueryParam`
 *
 * If you don't want to extend any of this interfaces you can always extend this interfaces individually
 */
export interface CommonQueryParams
  extends
    PageQueryParams,
    SorterQueryParams,
    IncludeQueryParam,
    LocaleQueryParam {}

export interface SessionQueryParams extends CommonQueryParams {
  season?: number;

  round?: number;

  session?: string;
}

export interface SessionEntrantQueryParams extends SessionQueryParams {
  /** Return only the items regarding this driver */
  driverId?: string;

  //TODO: Add filters by chassis, engines...
}

export interface ResultsFiltersQueryParams extends SessionEntrantQueryParams {
  /** Look for the results where the driver achieved a position worse than or equal to this number.
   *
   * @minimum 1 The minimum value of `minPos` should be 1
   * @isInt The `minPos` param should be an integer
   */
  minPos?: number;

  /** Look for the results where the driver achieved a position better than or equal to this number.
   *
   * @minimum 1 The minimum value of `maxPos` should be 1
   * @isInt The `maxPos` param should be an integer
   */
  maxPos?: number;

  /** Filter by a specific postion text, that can be `1`, `2`, `3`... or `DNF`, `DNS`... */
  positionText?: string;
}

export interface TimedSessionResultQueryParams extends ResultsFiltersQueryParams {
  /** @default "sessionId" */
  orderBy?: keyof TimedSessionResults;
}
