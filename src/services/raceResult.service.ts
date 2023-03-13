import { Get, Path, Queries, Res, Route, Tags, TsoaResponse } from 'tsoa';
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
import {
  RaceResult,
  RaceResultStorage
} from './../models/classes/eventDriverData/raceResult';
import { DbService } from './db.service';
import {
  EventEntrantQueryParamsWithoutSort,
  EventEntrantService
} from './eventEntrant.service';

export interface RaceResultQueryParams
  extends pageQueryParams,
    SorterQueryParams,
    EventEntrantQueryParamsWithoutSort {
  /** Filter by a specific grid postion text */
  gridPos?: string;

  /** Filter by a specific postion text, that can be `1`, `2`, `3`... or `DNF`, `DNS`... */
  positionText?: string;

  /** Look for the results where the driver achieved a position worse than or equal to this number.  */
  minPos?: number;

  /** Look for the results where the driver achieved a position better than or equal to this number.  */
  maxPos?: number;

  /** @default eventId */
  orderBy?: keyof RaceResultStorage;
}

@Route('races/results')
@Tags('Races')
export class RaceResultService extends DbService {
  private readonly selectQuery = `SELECT *, \
          CASE WHEN CAST(positionText as INT) > 0 \
          THEN CAST(positionText as INT) ELSE null END as position \
          FROM eventEntrants                                 \
                INNER JOIN                                   \
                raceResults USING (                          \
                    eventId,                                 \
                    driverId                                 \
                )`;

  private instanciateNewClass(elToInstanciate: RaceResultStorage) {
    return new RaceResult(
      elToInstanciate,
      this.eventEntrantService.getEntrantInfo(elToInstanciate as any)
    );
  }

  /** Get driver race results based on some filters */ @Get('/')
  getRaceResults(@Queries() obj: RaceResultQueryParams) {
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

  /** Gets info about the result obtained by a driver in a certain race */ @Get(
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
      return sendTsoaError(notFoundResponse, 404, 'result.not.found');
    }

    return this.instanciateNewClass(raceResultInDB);
  }

  private get eventEntrantService() {
    return new EventEntrantService();
  }
}
