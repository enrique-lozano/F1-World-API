import { SelectQueryBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Path, Queries, Res, Route, Tags, TsoaResponse } from 'tsoa';
import { PageMetadata, Paginator } from '../../models/paginated-items';
import { ResultsFiltersQueryParams } from '../../models/results-filter';
import { Sorter } from '../../models/sorter';
import {
  DB,
  RaceResultDTO,
  RaceResults,
  SessionDTO
} from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import {
  ErrorMessage,
  sendTsoaError
} from '../../utils/custom-error/custom-error';
import { EventEntrantService } from '../eventEntrant.controller';
import { ParamsBuilderService } from '../paramsBuilder.service';
import { SessionService } from '../session.controller';

export interface RaceResultQueryParams extends ResultsFiltersQueryParams {
  maxGridPos?: number;

  minGridPos?: number;

  /** @default sessionId */
  orderBy?: keyof RaceResults;
}

@Route('races/results')
@Tags('Races')
export class RaceResultService extends DbService {
  static getRaceResultSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'raceResults', {}>,
    getSessionDTO = true
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

  private getResultsWithParams(obj: RaceResultQueryParams) {
    return new ParamsBuilderService()
      .getResultsWithParamas('raceResults', obj)
      .$if(obj.maxGridPos != undefined, (qb) =>
        qb.where('gridPosition', '<=', obj.maxGridPos!)
      )
      .$if(obj.minGridPos != undefined, (qb) =>
        qb.where('gridPosition', '>=', obj.minGridPos!)
      );
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

    const mainSelect = this.getResultsWithParams(obj);

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

  /** Gets info about the results of a certain race */ @Get(
    '/{season}/{round}/{session}'
  )
  async getRaceResults(
    @Path() season: number,
    @Path() round: number,
    @Path() session: string,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ): Promise<SessionDTO & { results: RaceResultDTO[] }> {
    const raceResultInDB: RaceResultDTO[] =
      await RaceResultService.getRaceResultSelect(
        this.getResultsWithParams({ session, season, round }),
        false
      )
        .orderBy('positionOrder', 'asc')
        .execute();

    if (!raceResultInDB || raceResultInDB.length === 0) {
      return sendTsoaError(notFoundResponse, 404, 'results.not.found');
    }

    const sessionInfo = await new SessionService().getById(
      season,
      round,
      session
    );

    if (!sessionInfo) {
      return sendTsoaError(notFoundResponse, 404, 'results.not.found');
    }

    return {
      ...sessionInfo,
      results: raceResultInDB
    };
  }

  /** Gets info about the result obtained by a driver in a certain race */ @Get(
    '/{season}/{round}/{session}/{driverId}'
  )
  async getDriverRaceResult(
    @Path() season: number,
    @Path() round: number,
    @Path() session: string,
    @Path() driverId: string,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ): Promise<RaceResultDTO> {
    const raceResultInDB: RaceResultDTO | undefined =
      await RaceResultService.getRaceResultSelect(
        this.getResultsWithParams({ session, season, round, driverId }),
        false
      )
        .selectAll('raceResults')
        .executeTakeFirst();

    if (!raceResultInDB) {
      return sendTsoaError(notFoundResponse, 404, 'results.not.found');
    }

    return raceResultInDB;
  }
}
