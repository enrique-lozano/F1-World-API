import { Get, Queries, Route, Tags } from 'tsoa';
import {
  PageMetadata,
  pageQueryParams,
  Paginator
} from '../models/interfaces/paginated-items';
import { Sorter, SorterQueryParams } from '../models/interfaces/sorter';
import { parseQueryParams } from '../utils/objAttributesToStr';
import {
  LapTime,
  LapTimeStorage
} from './../models/classes/eventDriverData/lapTime';
import { DbService } from './db.service';
import { DriverService } from './driver.service';
import { EventService } from './event.service';

interface LapQueryParams extends pageQueryParams, SorterQueryParams {
  raceId?: string;
  driverId?: string;
  year?: number;
  pos?: number;

  /** @default raceId */
  orderBy?: keyof LapTimeStorage;
}

@Route('laps')
@Tags('Laps')
export class LapService extends DbService {
  @Get('/')
  getLaps(
    @Queries()
    obj: LapQueryParams
  ) {
    const sorter = new Sorter(obj.orderBy || 'raceId', obj.orderDir);
    const paginator = new Paginator(obj.pageNo, obj.pageSize);

    let whereStatement = '';

    const params = parseQueryParams(obj);

    if (Object.values(params).length) {
      whereStatement += ' WHERE ';

      let searchQueries: string[] = [];

      if (params.raceId) searchQueries.push(`raceId = :raceId`);
      if (params.driverId) searchQueries.push(`driverId = :driverId`);
      if (params.pos) searchQueries.push(`pos = :pos`);
      if (params.year) searchQueries.push(`substr(raceId, 1, 4) = :year`);

      whereStatement += searchQueries.join(' AND ');
    }

    const lapTimesInDB = this.db
      .prepare(
        'SELECT * FROM lapTimes' +
          `${whereStatement} ${sorter.sqlStatement} ${paginator.sqlStatement}`
      )
      .all(params) as LapTimeStorage[];

    const totalElements = this.db
      .prepare('SELECT COUNT(*) FROM lapTimes' + whereStatement)
      .get(params)['COUNT(*)'];

    return {
      pageData: new PageMetadata(
        totalElements,
        paginator.pageNo,
        paginator.pageSize
      ),
      items: lapTimesInDB.map(
        (x) =>
          new LapTime(x, {
            driver: this.driverService.getById(x.driverId),
            race: this.eventService.getById(x.raceId),
            constructorData: undefined as any,
            engine: undefined as any,
            tyre: undefined as any
          })
      )
    };
  }

  private get eventService() {
    return new EventService();
  }

  private get driverService() {
    return new DriverService();
  }
}
