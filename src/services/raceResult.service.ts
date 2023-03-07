import { Get, Path, Queries, Route, Tags } from 'tsoa';
import {
  PageMetadata,
  pageQueryParams,
  Paginator
} from '../models/interfaces/paginated-items';
import { Sorter, SorterQueryParams } from '../models/interfaces/sorter';
import { parseSearchQueryParams } from '../utils/objAttributesToStr';
import {
  RaceResult,
  RaceResultStorage
} from './../models/classes/eventDriverData/raceResult';
import { DbService } from './db.service';
import { EventEntrantService } from './eventEntrant.service';

export interface RaceResultQueryParams
  extends pageQueryParams,
    SorterQueryParams {
  driverId?: string;
  year?: number;

  /** Filter by a specific postion text, that can be `1`, `2`, `3`... or `DNF`, `DNS`... */
  positionText?: string;

  /** Look for the results where the driver achieved a position worse than or equal to this number.  */
  minPos?: number;

  /** Look for the results where the driver achieved a position better than or equal to this number.  */
  maxPos?: number;

  /** @default eventId */
  orderBy?: keyof RaceResultStorage;
}

@Route('race-results')
@Tags('RaceResults')
export class RaceResultService extends DbService {
  private instanciateNewClass(elToInstanciate: RaceResultStorage) {
    return new RaceResult(
      elToInstanciate,
      this.eventEntrantService.getEntrantInfo(
        elToInstanciate.eventId,
        elToInstanciate.driverId
      )
    );
  }

  @Get('/')
  getAllRaceResults(@Queries() obj: RaceResultQueryParams) {
    const sorter = new Sorter(obj.orderBy || 'eventId', obj.orderDir);
    const paginator = new Paginator(obj.pageNo, obj.pageSize);

    let whereStatement = '';

    const params = parseSearchQueryParams(obj);

    if (Object.values(params).length) {
      whereStatement += ' WHERE ';

      let searchQueries: string[] = [];

      if (params.driverId) searchQueries.push(`driverId = :driverId`);
      if (params.positionText)
        searchQueries.push(`positionText = :positionText`);
      if (params.year)
        searchQueries.push(`cast(substr(eventId, 1, 4) as INT) = :year`);
      if (params.maxPos) searchQueries.push(`position <= :maxPos`);
      if (params.minPos) searchQueries.push(`position >= :minPos`);

      whereStatement += searchQueries.join(' AND ');
    }

    const raceResultsInDB = this.db
      .prepare(
        'SELECT *, \
          CASE WHEN CAST(positionText as INT) > 0 \
          THEN CAST(positionText as INT) ELSE null END as position \
        FROM raceResults' +
          `${whereStatement} ${sorter.sqlStatement} ${paginator.sqlStatement}`
      )
      .all(params) as RaceResultStorage[];

    const totalElements = this.db
      .prepare(
        'SELECT COUNT(*), \
          CASE WHEN CAST(positionText as INT) > 0 \
          THEN CAST(positionText as INT) ELSE null END as position \
        FROM raceResults' + whereStatement
      )
      .get(params)['COUNT(*)'];

    return {
      pageData: new PageMetadata(
        totalElements,
        paginator.pageNo,
        paginator.pageSize
      ),
      items: raceResultsInDB.map((x) => this.instanciateNewClass(x))
    };
  }

  /** Gets the results of a specific race */ @Get('/{eventId}')
  getRaceResults(@Path() eventId: string) {
    return this.db
      .prepare('SELECT * FROM raceResults WHERE eventId = ?')
      .all(eventId)
      .map((x: RaceResultStorage) => this.instanciateNewClass(x));
  }

  /** Gets the result obteined by a driver in a certain race */ @Get(
    '/{eventId}/{driverId}'
  )
  getRaceResult(@Path() driverId: string, @Path() eventId: string) {
    const raceResultInDB = this.db
      .prepare('SELECT * FROM raceResults WHERE driverId = ? AND eventId = ?')
      .get(driverId, eventId) as RaceResultStorage;

    return this.instanciateNewClass(raceResultInDB);
  }

  private get eventEntrantService() {
    return new EventEntrantService();
  }
}
