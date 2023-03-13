import { Get, Path, Queries, Res, Route, Tags, TsoaResponse } from 'tsoa';
import {
  TimedSessionResult,
  TimedSessionResultStorage
} from '../models/classes/eventDriverData/TimedSessionResult';
import {
  PageMetadata,
  pageQueryParams,
  Paginator
} from '../models/interfaces/paginated-items';
import { Sorter, SorterQueryParams } from '../models/interfaces/sorter';
import {
  ErrorMessage,
  sendTsoaError
} from '../utils/custom-error/custom-error';
import { parseSearchQueryParams } from '../utils/objAttributesToStr';
import { DbService } from './db.service';
import {
  EventEntrantQueryParamsWithoutSort,
  EventEntrantService
} from './eventEntrant.service';

export interface FreePracticesQueryParams
  extends pageQueryParams,
    SorterQueryParams,
    EventEntrantQueryParamsWithoutSort {
  driverId?: string;
  year?: number;
  pos?: number;

  /** @default eventId */
  orderBy?: keyof TimedSessionResultStorage;
}

export interface FreePracticesQueryParamsWithEvent
  extends FreePracticesQueryParams {
  eventId?: string;
}

@Route('free-practices')
@Tags('Free Practices')
export class FreePracticeService extends DbService {
  private getSelectQuery(session: 'fp1' | 'fp2' | 'fp3' | 'fp4' | 'warm-up') {
    let tableToGet: string;

    if (session == 'warm-up') {
      tableToGet = 'warmingUpResults';
    } else {
      tableToGet = `${session}_results`;
    }

    return `SELECT laps, pos, time, eventEntrants.*        \
          FROM eventEntrants                       \
              INNER JOIN                           \
              ${tableToGet} USING (                \
                  eventId,                         \
                  driverId                         \
              )`;
  }

  private instanciateNewClass(res: TimedSessionResultStorage) {
    return new TimedSessionResult(
      res,
      this.eventEntrantService.getEntrantInfo(res)
    );
  }

  /** Return driver results of a specific practice session based on some filters */ @Get(
    '/{session}/results'
  )
  get(
    @Path() session: 'fp1' | 'fp2' | 'fp3' | 'fp4' | 'warm-up',
    @Queries() filters: FreePracticesQueryParamsWithEvent
  ) {
    const sorter = new Sorter(filters.orderBy || 'eventId', filters.orderDir);
    const paginator = new Paginator(filters.pageNo, filters.pageSize);

    let whereStatement = '';

    const params = parseSearchQueryParams(filters);

    if (Object.values(params).length) {
      whereStatement += ' WHERE ';

      let searchQueries: string[] = [];

      if (params.driverId) searchQueries.push(`driverId = :driverId`);
      if (params.chassisManufacturerId)
        searchQueries.push(`chassisManufacturerId = :chassisManufacturerId`);
      if (params.engineManufacturerId)
        searchQueries.push(`engineManufacturerId = :engineManufacturerId`);
      if (params.pos) searchQueries.push(`pos = :pos`);
      if (params.year)
        searchQueries.push(`cast(substr(eventId, 1, 4) as INT) = :year`);

      whereStatement += searchQueries.join(' AND ');
    }

    const resultsInDB = this.db
      .prepare(
        this.getSelectQuery(session) +
          `${whereStatement} ${sorter.sqlStatement} ${paginator.sqlStatement}`
      )
      .all(params) as TimedSessionResultStorage[];

    const totalElements = this.db
      .prepare(
        `SELECT COUNT(*) FROM (${this.getSelectQuery(
          session
        )}${whereStatement})`
      )
      .get(params)['COUNT(*)'];

    return {
      pageData: new PageMetadata(
        totalElements,
        paginator.pageNo,
        paginator.pageSize
      ),
      items: resultsInDB.map((x) => this.instanciateNewClass(x))
    };
  }

  /** Gets info about the result obtained by a driver in a certain session of free practice
   *
   * @param notFoundResponse Register not found */ @Get(
    '/{session}/results/{eventId}/{driverId}'
  )
  getDriverSessionResult(
    @Path() session: 'fp1' | 'fp2' | 'fp3' | 'fp4' | 'warm-up',
    @Path() eventId: string,
    @Path() driverId: string,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ): TimedSessionResult {
    const raceResultInDB = this.db
      .prepare(
        `${this.getSelectQuery(session)} WHERE driverId = ? AND eventId = ?`
      )
      .get(driverId, eventId) as TimedSessionResultStorage;

    if (!raceResultInDB) {
      return sendTsoaError(notFoundResponse, 404, 'driver-result.not.found');
    }

    return this.instanciateNewClass(raceResultInDB);
  }

  private get eventEntrantService() {
    return new EventEntrantService();
  }
}
