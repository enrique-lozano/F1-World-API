import { SelectQueryBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Path, Queries, Res, Route, Tags, TsoaResponse } from 'tsoa';
import { PageMetadata, Paginator } from '../models/paginated-items';
import { ResultsFiltersQueryParams } from '../models/results-filter';
import { Sorter } from '../models/sorter';
import { DB, RaceResultDTO, RaceResults } from '../models/types.dto';
import { DbService } from '../services/db.service';
import {
  ErrorMessage,
  sendTsoaError
} from '../utils/custom-error/custom-error';
import { EventEntrantService } from './eventEntrant.controller';
import { SessionService } from './session.controller';

export interface RaceResultQueryParams extends ResultsFiltersQueryParams {
  /** Filter by a specific grid postion text */
  gridPos?: string;

  /** Filter by a specific postion text, that can be `1`, `2`, `3`... or `DNF`, `DNS`... */
  positionText?: string;

  /** @default eventId */
  orderBy?: keyof RaceResults;
}

@Route('races/results')
@Tags('Races')
export class RaceResultService extends DbService {
  static getRaceResultSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'raceResults', {}>
  ) {
    return (qb as SelectQueryBuilder<DB, 'raceResults', {}>)
      .select([
        'gap',
        'gridPenalty',
        'gridPosition',
        'laps',
        'points',
        'pointsCountForWDC',
        'pointsGained',
        'positionText',
        'positionOrder',
        'gap',
        'time',
        'timePenalty',
        'reasonRetired'
      ])
      .select((eb) => [
        jsonObjectFrom(
          SessionService.getSessionSelect(eb.selectFrom('sessions')).whereRef(
            'raceResults.sessionId',
            '==',
            'sessions.id'
          )
        ).as('session'),
        jsonObjectFrom(
          EventEntrantService.getEventEntrantSelect(
            eb.selectFrom('eventEntrants')
          ).whereRef('raceResults.entrantId', '==', 'eventEntrants.id')
        ).as('entrant')
      ]) as SelectQueryBuilder<DB, 'raceResults' | T, RaceResultDTO>;
  }

  /** Get driver race results based on some filters */ @Get('/')
  getRacesResults(
    @Queries() obj: RaceResultQueryParams
  ): Promise<PageMetadata & { data: RaceResultDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<RaceResults>(
      obj.orderBy || 'sessionId',
      obj.orderDir
    );

    const mainSelect = this.db
      .selectFrom('raceResults')
      .$if(obj.positionText != undefined, (qb) =>
        qb.where('positionText', '==', obj.positionText!)
      )
      .$if(obj.maxPos != undefined, (qb) =>
        qb.where('positionOrder', '<=', obj.maxPos!)
      )
      .$if(obj.minPos != undefined, (qb) =>
        qb.where('positionOrder', '>=', obj.minPos!)
      )
      .$if(obj.driverId != undefined, (qb) =>
        qb
          .innerJoin(
            'eventEntrants',
            'eventEntrants.id',
            'raceResults.entrantId'
          )
          .where('eventEntrants.driverId', '==', obj.driverId!)
      );

    return mainSelect
      .select(({ fn, eb }) => [
        fn.countAll<number>().as('totalElements'),
        eb.val(paginator.pageSize).as('pageSize'),
        eb.val(paginator.pageNo).as('currentPage'),
        jsonArrayFrom(
          RaceResultService.getRaceResultSelect(mainSelect)
            .limit(paginator.pageSize)
            .offset(paginator.sqlOffset)
            .orderBy(`${sorter.orderBy} ${sorter.orderDir}`)
        ).as('data')
      ])
      .executeTakeFirstOrThrow();
  }

  /** Gets info about the results of a certain race */ @Get('/{sessionId}')
  async getRaceResults(
    @Path() sessionId: string,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ): Promise<RaceResultDTO[]> {
    const raceResultInDB: RaceResultDTO[] =
      await RaceResultService.getRaceResultSelect(
        this.db.selectFrom('raceResults')
      )
        .where('sessionId', '==', sessionId)
        .orderBy('positionOrder', 'asc')
        .execute();

    if (!raceResultInDB || raceResultInDB.length === 0) {
      return sendTsoaError(notFoundResponse, 404, 'results.not.found');
    }

    return raceResultInDB;
  }

  /** Gets info about the result obtained by a driver in a certain race */ @Get(
    '/{sessionId}/{driverId}'
  )
  async getDriverRaceResult(
    @Path() sessionId: string,
    @Path() driverId: string,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ): Promise<RaceResultDTO> {
    const raceResultInDB: RaceResultDTO | undefined =
      await RaceResultService.getRaceResultSelect(
        this.db.selectFrom('raceResults')
      )
        .innerJoin('eventEntrants', 'eventEntrants.id', 'raceResults.entrantId')
        .where('sessionId', '==', sessionId)
        .where('eventEntrants.driverId', '==', driverId)
        .selectAll('raceResults')
        .executeTakeFirst();

    if (!raceResultInDB) {
      return sendTsoaError(notFoundResponse, 404, 'results.not.found');
    }

    return raceResultInDB;
  }
}
