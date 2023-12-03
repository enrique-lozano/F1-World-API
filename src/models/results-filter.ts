import { PageQueryParams } from './paginated-items';
import { SorterQueryParams } from './sorter';

export interface ResultsFiltersQueryParams
  extends PageQueryParams,
    SorterQueryParams {
  /** Look for the results where the driver achieved a position worse than or equal to this number.  */
  minPos?: number;

  /** Look for the results where the driver achieved a position better than or equal to this number.  */
  maxPos?: number;

  /** Return only the results regarding this driver */
  driverId?: string;
}
