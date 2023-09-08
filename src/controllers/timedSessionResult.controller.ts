import { TsoaResponse } from 'tsoa';
import {
  TimedSessionResult,
  TimedSessionResultStorage,
  TimedSessions
} from '../models/classes/eventDriverData/TimedSessionResult';
import {
  PageMetadata,
  PageQueryParams,
  Paginator
} from '../models/interfaces/paginated-items';
import { Sorter, SorterQueryParams } from '../models/interfaces/sorter';
import { DbService } from '../services/db.service';
import {
  ErrorMessage,
  sendTsoaError
} from '../utils/custom-error/custom-error';
import { parseSearchQueryParams } from '../utils/objAttributesToStr';
import {
  EventEntrantQueryParamsWithoutSort,
  EventEntrantService
} from './eventEntrant.controller';

export interface TimedSessionResultQueryParams
  extends PageQueryParams,
    SorterQueryParams,
    EventEntrantQueryParamsWithoutSort {
  positionText?: number;

  /** @default eventId */
  orderBy?: keyof TimedSessionResultStorage;
}

export class TimedSessionResultService extends DbService {
  private getSelectQuery(session: TimedSessions) {
    let tableToGet: string;

    if (session == 'warm-up') {
      tableToGet = 'warmingUpResults';
    } else if (session == 'preQualifying') {
      tableToGet = 'preQualifyingResults';
    } else {
      tableToGet = `${session}_results`;
    }

    return `SELECT laps, positionText, positionOrder, time, eventEntrants.*, \
          CASE WHEN CAST(positionText as INT) > 0 \
          THEN CAST(positionText as INT) ELSE null END as position \
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

  getTimedSessionsResults(
    session: TimedSessions,
    filters: TimedSessionResultQueryParams
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
      if (params.positionText)
        searchQueries.push(`positionText = :positionText`);
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

  getDriverSessionResults(
    session: TimedSessions,
    eventId: string,
    notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ): TimedSessionResult[] {
    const raceResultInDB = this.db
      .prepare(`${this.getSelectQuery(session)} WHERE eventId = ?`)
      .all(eventId) as TimedSessionResultStorage[];

    if (!raceResultInDB) {
      return sendTsoaError(notFoundResponse, 404, 'results.not.found');
    }

    return raceResultInDB.map((x) => this.instanciateNewClass(x));
  }

  getDriverSessionResult(
    session: TimedSessions,
    eventId: string,
    driverId: string,
    notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
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
