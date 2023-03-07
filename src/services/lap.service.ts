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
import { EventEntrantService } from './eventEntrant.service';

interface LapQueryParams extends pageQueryParams, SorterQueryParams {
  eventId?: string;
  driverId?: string;
  year?: number;
  pos?: number;

  /** @default eventId */
  orderBy?: keyof LapTimeStorage;
}

@Route('laps')
@Tags('Laps')
export class LapService extends DbService {
  private instanciateNewClass(lap: LapTimeStorage) {
    return new LapTime(
      lap,
      this.eventEntrantService.getEntrantInfo(lap.eventId, lap.driverId)
    );
  }

  @Get('/')
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
      if (params.year)
        searchQueries.push(`cast(substr(eventId, 1, 4) as INT) = :year`);

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
      items: lapTimesInDB.map((x) => this.instanciateNewClass(x))
    };
  }

  private get eventEntrantService() {
    return new EventEntrantService();
  }
}
