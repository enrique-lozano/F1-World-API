import { Get, Queries, Route, Tags } from 'tsoa';
import {
  PitStop,
  PitStopStorage
} from '../models/classes/eventDriverData/pitStop';
import {
  PageMetadata,
  pageQueryParams,
  Paginator
} from '../models/interfaces/paginated-items';
import { Sorter, SorterQueryParams } from '../models/interfaces/sorter';
import { parseSearchQueryParams } from '../utils/objAttributesToStr';
import { DbService } from './db.service';
import {
  EventEntrantQueryParamsWithoutSort,
  EventEntrantService
} from './eventEntrant.service';

interface PitStopQueryParams
  extends pageQueryParams,
    SorterQueryParams,
    EventEntrantQueryParamsWithoutSort {
  lap?: number;

  /** @default eventId */
  orderBy?: keyof PitStopStorage;
}

@Route('races')
@Tags('Races')
export class PitStopService extends DbService {
  private instanciateNewClass(data: PitStopStorage) {
    return new PitStop(data, this.eventEntrantService.getEntrantInfo(data));
  }

  @Get('/pit-stops')
  getPitStops(@Queries() obj: PitStopQueryParams) {
    const sorter = new Sorter<PitStopStorage>(
      obj.orderBy || 'eventId',
      obj.orderDir
    );

    const paginator = new Paginator(obj.pageNo, obj.pageSize);

    let whereStatement = '';

    const params = parseSearchQueryParams(obj);

    if (Object.values(params).length) {
      whereStatement += ' WHERE ';

      let searchQueries: string[] = [];

      if (params.eventId) searchQueries.push(`eventId = :eventId`);
      if (params.driverId) searchQueries.push(`driverId = :driverId`);
      if (params.chassisManufacturerId)
        searchQueries.push(`chassisManufacturerId = :chassisManufacturerId`);
      if (params.engineManufacturerId)
        searchQueries.push(`engineManufacturerId = :engineManufacturerId`);
      if (params.lap) searchQueries.push(`lap = :lap`);
      if (params.year)
        searchQueries.push(`cast(substr(eventId, 1, 4) as INT) = :year`);

      whereStatement += searchQueries.join(' AND ');
    }

    const pitStopsInDB = this.db
      .prepare(
        'SELECT pitStops.eventId, pitStops.driverId, pitStops.lap, pitStops.annotation, \
         pitStops.time, pitStops.timeOfDay, eventEntrants.*   \
          FROM eventEntrants    \
              INNER JOIN        \
              pitStops USING (  \
                  eventId,      \
                  driverId      \
              )' +
          `${whereStatement} ${sorter.sqlStatement} ${paginator.sqlStatement}`
      )
      .all(params) as PitStopStorage[];

    const totalElements = this.db
      .prepare(
        'SELECT COUNT(*) FROM eventEntrants    \
              INNER JOIN        \
              pitStops USING (  \
                  eventId,      \
                  driverId      \
              )' + whereStatement
      )
      .get(params)['COUNT(*)'];

    return {
      pageData: new PageMetadata(
        totalElements,
        paginator.pageNo,
        paginator.pageSize
      ),
      items: pitStopsInDB.map((x) => this.instanciateNewClass(x))
    };
  }

  private get eventEntrantService() {
    return new EventEntrantService();
  }
}
