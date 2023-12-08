import { SelectQueryBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Path, Queries, Res, Route, Tags, TsoaResponse } from 'tsoa';
import { PageMetadata, Paginator } from '../../models/paginated-items';
import { TimedSessionResultQueryParams } from '../../models/results-filter';
import { Sorter } from '../../models/sorter';
import {
  DB,
  SessionDTO,
  TimedSessionResults,
  TimedSessionResultsDTO
} from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import {
  ErrorMessage,
  sendTsoaError
} from '../../utils/custom-error/custom-error';
import { EventEntrantService } from '../eventEntrant.controller';
import { ParamsBuilderService } from '../paramsBuilder.service';
import { SessionService } from '../session.controller';

@Route('free-practices')
@Tags('Free Practices')
export class FreePracticeResultService extends DbService {
  static getFreePracticeResultSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'fpResults', {}>,
    getSessionDTO = true
  ) {
    return (qb as SelectQueryBuilder<DB, 'fpResults', {}>)
      .select(['laps', 'positionText', 'positionOrder', 'time'])
      .select((eb) => [
        jsonObjectFrom(
          SessionService.getSessionSelect(eb.selectFrom('sessions')).whereRef(
            'fpResults.sessionId',
            '==',
            'sessions.id'
          )
        ).as('session'),
        jsonObjectFrom(
          EventEntrantService.getEventEntrantSelect(
            eb.selectFrom('eventEntrants')
          ).whereRef('fpResults.entrantId', '==', 'eventEntrants.id')
        ).as('entrant')
      ]) as SelectQueryBuilder<DB, 'fpResults' | T, TimedSessionResultsDTO>;
  }

  private getResultsWithParams(obj: TimedSessionResultQueryParams) {
    return new ParamsBuilderService().getResultsWithParamas('fpResults', obj);
  }

  /** Get driver race results based on some filters */ @Get('/')
  getFreePracticesResults(
    @Queries() obj: TimedSessionResultQueryParams
  ): Promise<PageMetadata & { data: TimedSessionResultsDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<TimedSessionResults>(
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
          FreePracticeResultService.getFreePracticeResultSelect(mainSelect)
            .limit(paginator.pageSize)
            .offset(paginator.sqlOffset)
            .orderBy(`${sorter.orderBy} ${sorter.orderDir}`)
        ).as('data')
      ])
      .executeTakeFirstOrThrow();
  }

  /** Gets info about the results of a certain free practice */ @Get(
    '/{season}/{round}/{session}'
  )
  async getFreePracticeSessionResults(
    @Path() season: number,
    @Path() round: number,
    @Path() session: string,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ): Promise<SessionDTO & { results: TimedSessionResultsDTO[] }> {
    const raceResultInDB: TimedSessionResultsDTO[] =
      await FreePracticeResultService.getFreePracticeResultSelect(
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

  /** Gets info about the result obtained by a driver in a certain free practice */ @Get(
    '/{season}/{round}/{session}/{driverId}'
  )
  async getDriverFreePracticeResult(
    @Path() season: number,
    @Path() round: number,
    @Path() session: string,
    @Path() driverId: string,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ): Promise<TimedSessionResultsDTO> {
    const raceResultInDB: TimedSessionResultsDTO | undefined =
      await FreePracticeResultService.getFreePracticeResultSelect(
        this.getResultsWithParams({ session, season, round, driverId }),
        false
      )
        .selectAll('fpResults')
        .executeTakeFirst();

    if (!raceResultInDB) {
      return sendTsoaError(notFoundResponse, 404, 'results.not.found');
    }

    return raceResultInDB;
  }
}
