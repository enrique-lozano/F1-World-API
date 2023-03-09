import { Get, Queries, Route, Tags } from 'tsoa';
import {
  PageMetadata,
  pageQueryParams,
  Paginator
} from '../models/interfaces/paginated-items';
import { Sorter, SorterQueryParams } from '../models/interfaces/sorter';
import { parseSearchQueryParams } from '../utils/objAttributesToStr';
import {
  LapTime,
  LapTimeStorage
} from './../models/classes/eventDriverData/lapTime';
import { DbService } from './db.service';
import {
  EventEntrantQueryParams,
  EventEntrantService
} from './eventEntrant.service';

interface LapQueryParams
  extends pageQueryParams,
    SorterQueryParams,
    EventEntrantQueryParams {
  pos?: number;
  lap?: number;

  /** @default eventId */
  orderBy?: keyof LapTimeStorage;
}

@Route('races')
@Tags('Races')
export class LapService extends DbService {
  private readonly selectQueryFastestLaps =
    'SELECT lap, pos, MIN(time) AS time, eventEntrants.*   \
          FROM eventEntrants                               \
              INNER JOIN                                   \
              lapTimes USING (                             \
                  eventId,                                 \
                  driverId                                 \
              )';

  private readonly selectQuery =
    'SELECT lap, pos, time, eventEntrants.*        \
          FROM eventEntrants                       \
              INNER JOIN                           \
              lapTimes USING (                     \
                  eventId,                         \
                  driverId                         \
              )';

  private instanciateNewClass(lap: LapTimeStorage) {
    return new LapTime(lap, this.eventEntrantService.getEntrantInfo(lap));
  }

  @Get('/laps')
  getLaps(@Queries() obj: LapQueryParams) {
    const sorter = new Sorter<LapTimeStorage>(
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
      if (params.pos) searchQueries.push(`pos = :pos`);
      if (params.chassisManufacturerId)
        searchQueries.push(`chassisManufacturerId = :chassisManufacturerId`);
      if (params.engineManufacturerId)
        searchQueries.push(`engineManufacturerId = :engineManufacturerId`);
      if (params.lap) searchQueries.push(`lap = :lap`);
      if (params.year)
        searchQueries.push(`cast(substr(eventId, 1, 4) as INT) = :year`);

      whereStatement += searchQueries.join(' AND ');
    }

    const lapTimesInDB = this.db
      .prepare(
        this.selectQuery +
          `${whereStatement} ${sorter.sqlStatement} ${paginator.sqlStatement}`
      )
      .all(params) as LapTimeStorage[];

    const totalElements = this.db
      .prepare(`SELECT COUNT(*) FROM (${this.selectQuery}${whereStatement})`)
      .get(params)['COUNT(*)'];

    return {
      pageData: new PageMetadata(
        totalElements,
        paginator.pageNo,
        paginator.pageSize
      ),
      items: lapTimesInDB.map((x) => this.instanciateNewClass(x))
    };
  }

  @Get('/fastest-laps')
  getFastestLaps(@Queries() obj: LapQueryParams) {
    const sorter = new Sorter<LapTimeStorage>(
      obj.orderBy || 'eventId',
      obj.orderDir
    );

    const paginator = new Paginator(obj.pageNo, obj.pageSize);

    let whereStatement = '';

    const params = parseSearchQueryParams(obj);

    if (Object.values(params).length) {
      whereStatement += ' WHERE ';

      let searchQueries: string[] = [];

      if (params.driverId) searchQueries.push(`driverId = :driverId`);
      if (params.pos) searchQueries.push(`pos = :pos`);
      if (params.chassisManufacturerId)
        searchQueries.push(`chassisManufacturerId = :chassisManufacturerId`);
      if (params.engineManufacturerId)
        searchQueries.push(`engineManufacturerId = :engineManufacturerId`);
      if (params.lap) searchQueries.push(`lap = :lap`);
      if (params.year)
        searchQueries.push(`cast(substr(eventId, 1, 4) as INT) = :year`);

      whereStatement += searchQueries.join(' AND ');
    }

    const groupByQuery = `SELECT * FROM (${this.selectQueryFastestLaps} GROUP BY eventId) ${whereStatement}`;

    const lapTimesInDB = this.db
      .prepare(
        groupByQuery + ` ${sorter.sqlStatement} ${paginator.sqlStatement}`
      )
      .all(params) as LapTimeStorage[];

    const totalElements = this.db
      .prepare(`SELECT COUNT(*) FROM (${groupByQuery})`)
      .get(params)['COUNT(*)'];

    return {
      pageData: new PageMetadata(
        totalElements,
        paginator.pageNo,
        paginator.pageSize
      ),
      items: lapTimesInDB.map((x) => this.instanciateNewClass(x))
    };
  }

  /** Get the fastest lap of a race event */ @Get('/fastest-laps/{eventId}')
  getEventFastestLap(eventId: string) {
    const fastestLap = this.db
      .prepare(
        `${this.selectQueryFastestLaps} WHERE eventId = ? GROUP BY eventId`
      )
      .get(eventId) as LapTimeStorage;

    return this.instanciateNewClass(fastestLap);
  }

  private get eventEntrantService() {
    return new EventEntrantService();
  }
}
