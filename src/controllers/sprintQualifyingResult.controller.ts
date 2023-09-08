import { Get, Path, Queries, Res, Route, Tags, TsoaResponse } from 'tsoa';
import {
  RaceResult,
  RaceResultStorage
} from '../models/classes/eventDriverData/raceResult';
import { PageMetadata, Paginator } from '../models/interfaces/paginated-items';
import { Sorter } from '../models/interfaces/sorter';
import { DbService } from '../services/db.service';
import {
  ErrorMessage,
  sendTsoaError
} from '../utils/custom-error/custom-error';
import { parseSearchQueryParams } from '../utils/objAttributesToStr';
import { EventEntrantService } from './eventEntrant.controller';
import { RaceResultQueryParams } from './raceResult.controller';

@Route('sprint-qualifyings/results')
@Tags('Sprint Qualifyings')
export class sprintQualifyingResultService extends DbService {
  private readonly selectQuery = `SELECT *, \
          CASE WHEN CAST(positionText as INT) > 0 \
          THEN CAST(positionText as INT) ELSE null END as position \
          FROM eventEntrants                                 \
                INNER JOIN                                   \
                sprintQualifyingResults USING (                          \
                    eventId,                                 \
                    driverId                                 \
                )`;

  private instanciateNewClass(elToInstanciate: RaceResultStorage) {
    return new RaceResult(
      elToInstanciate,
      this.eventEntrantService.getEntrantInfo(elToInstanciate)
    );
  }

  /** Get driver sprint qualifyings results based on some filters */ @Get('/')
  getSprintQualifyingsResults(@Queries() obj: RaceResultQueryParams) {
    const sorter = new Sorter<RaceResultStorage>(
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
      if (params.eventId) searchQueries.push(`eventId = :eventId`);
      if (params.chassisManufacturerId)
        searchQueries.push(`chassisManufacturerId = :chassisManufacturerId`);
      if (params.engineManufacturerId)
        searchQueries.push(`engineManufacturerId = :engineManufacturerId`);
      if (params.positionText)
        searchQueries.push(`positionText = :positionText`);
      if (params.gridPos) searchQueries.push(`gridPos = :gridPos`);
      if (params.year)
        searchQueries.push(`cast(substr(eventId, 1, 4) as INT) = :year`);
      if (params.maxPos) searchQueries.push(`position <= :maxPos`);
      if (params.minPos) searchQueries.push(`position >= :minPos`);

      whereStatement += searchQueries.join(' AND ');
    }

    const raceResultsInDB = this.db
      .prepare(
        this.selectQuery +
          `${whereStatement} ${sorter.sqlStatement} ${paginator.sqlStatement}`
      )
      .all(params) as RaceResultStorage[];

    const totalElements = this.db
      .prepare(`SELECT COUNT(*) FROM (${this.selectQuery}${whereStatement})`)
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

  /** Gets info about the results of a certain sprint qualifying */ @Get(
    '/{eventId}'
  )
  getSprintQualifyingResults(
    @Path() eventId: string,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ): RaceResult[] {
    const raceResultInDB = this.db
      .prepare(`${this.selectQuery} WHERE eventId = ?`)
      .all(eventId) as RaceResultStorage[];

    if (!raceResultInDB || raceResultInDB.length === 0) {
      return sendTsoaError(notFoundResponse, 404, 'results.not.found');
    }

    return raceResultInDB.map((x) => this.instanciateNewClass(x));
  }

  /** Gets info about the result obtained by a driver in a certain sprint qualifying */ @Get(
    '/{eventId}/{driverId}'
  )
  getDriverRaceResult(
    @Path() eventId: string,
    @Path() driverId: string,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ): RaceResult {
    const raceResultInDB = this.db
      .prepare(`${this.selectQuery} WHERE driverId = ? AND eventId = ?`)
      .get(driverId, eventId) as RaceResultStorage;

    if (!raceResultInDB) {
      return sendTsoaError(notFoundResponse, 404, 'driver-result.not.found');
    }

    return this.instanciateNewClass(raceResultInDB);
  }

  private get eventEntrantService() {
    return new EventEntrantService();
  }
}
