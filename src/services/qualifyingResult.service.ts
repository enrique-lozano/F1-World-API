import { Get, Path, Queries, Res, Route, Tags, TsoaResponse } from 'tsoa';
import {
  QualifyingResult,
  QualifyingResultStorage
} from '../models/classes/eventDriverData/qualifyingResult';
import { PageMetadata, Paginator } from '../models/interfaces/paginated-items';
import { Sorter } from '../models/interfaces/sorter';
import {
  ErrorMessage,
  sendTsoaError
} from '../utils/custom-error/custom-error';
import { parseSearchQueryParams } from '../utils/objAttributesToStr';
import { DbService } from './db.service';
import { EventEntrantService } from './eventEntrant.service';
import {
  TimedSessionResultQueryParams,
  TimedSessionResultService
} from './timedSessionResult.service';

@Route('qualifyings')
@Tags('Qualifyings')
export class QualifyingResultService extends DbService {
  private readonly selectQuery =
    'SELECT qualifyingResults.laps,  qualifyingResults.positionText,     qualifyingResults.positionOrder,    qualifyingResults.time,  qualifying1_results.time AS qualy1Time,       qualifying1_results.positionText AS qualy1Pos,qualifying2_results.time AS qualy2Time,       qualifying2_results.positionText AS qualy2Pos,q1Time,       q2Time,       q3Time,       eventEntrants.*, \
          CASE WHEN CAST(qualifyingResults.positionText as INT) > 0 \
          THEN CAST(qualifyingResults.positionText as INT) ELSE null END as position \
     FROM qualifyingResults        LEFT JOIN     qualifying1_results USING (           eventId,          driverId      )       LEFT JOIN       qualifying2_results USING (eventId, driverId )  INNER JOIN  eventEntrants USING (eventId, driverId )';

  private instanciateNewClass(res: QualifyingResultStorage) {
    return new QualifyingResult(
      res,
      this.eventEntrantService.getEntrantInfo(res)
    );
  }

  /** Return a resume with info about all the sessions of qualifyings */ @Get(
    '/results/resume'
  )
  getQualifyingsResults(@Queries() filters: TimedSessionResultQueryParams) {
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
        this.selectQuery +
          `${whereStatement} ${sorter.sqlStatement} ${paginator.sqlStatement}`
      )
      .all(params) as QualifyingResultStorage[];

    const totalElements = this.db
      .prepare(`SELECT COUNT(*) FROM (${this.selectQuery}${whereStatement})`)
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

  /** Return a resume with info about all the sessions of qualifyings in an event */ @Get(
    '/results/resume/{eventId}'
  )
  getQualifyingResults(
    @Path() eventId: string,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ): QualifyingResult[] {
    const raceResultInDB = this.db
      .prepare(`${this.selectQuery} WHERE eventId = ?`)
      .all(eventId) as QualifyingResultStorage[];

    if (!raceResultInDB) {
      return sendTsoaError(notFoundResponse, 404, 'results.not.found');
    }

    return raceResultInDB.map((x) => this.instanciateNewClass(x));
  }

  /** Return a resume with info about all the sessions of qualifyings in an event */ @Get(
    '/results/resume/{eventId}/{driverId}'
  )
  getQualifyingResult(
    @Path() eventId: string,
    @Path() driverId: string,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ): QualifyingResult {
    const raceResultInDB = this.db
      .prepare(`${this.selectQuery} WHERE driverId = ? AND eventId = ?`)
      .get(driverId, eventId) as QualifyingResultStorage;

    if (!raceResultInDB) {
      return sendTsoaError(notFoundResponse, 404, 'driver-result.not.found');
    }

    return this.instanciateNewClass(raceResultInDB);
  }

  /** Return driver results of a specific qualifying session based on some filters */ @Get(
    '/{session}/results'
  )
  getSessionsResults(
    @Path() session: 'qualifying1' | 'qualifying2',
    @Queries() filters: TimedSessionResultQueryParams
  ) {
    return this.timedSessionResultService.getTimedSessionsResults(
      session,
      filters
    );
  }

  /** Gets the results of a certain session of qualifying
   *
   * @param notFoundResponse Register not found */ @Get(
    '/{session}/results/{eventId}'
  )
  getSessionResults(
    @Path() session: 'qualifying1' | 'qualifying2',
    @Path() eventId: string,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ) {
    return this.timedSessionResultService.getDriverSessionResults(
      session,
      eventId,
      notFoundResponse
    );
  }

  /** Gets info about the result obtained by a driver in a certain session of qualifying
   *
   * @param notFoundResponse Register not found */ @Get(
    '/{session}/results/{eventId}/{driverId}'
  )
  getDriverSessionResult(
    @Path() session: 'qualifying1' | 'qualifying2',
    @Path() eventId: string,
    @Path() driverId: string,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ) {
    return this.timedSessionResultService.getDriverSessionResult(
      session,
      eventId,
      driverId,
      notFoundResponse
    );
  }

  private get timedSessionResultService() {
    return new TimedSessionResultService();
  }

  private get eventEntrantService() {
    return new EventEntrantService();
  }
}
