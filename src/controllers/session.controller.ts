import { SelectQueryBuilder } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Path, Queries, Res, Route, Tags, TsoaResponse } from 'tsoa';
import { PageQueryParams } from '../models/paginated-items';
import { SessionQueryParams } from '../models/query-params';
import { DbService } from '../services/db.service';
import {
  ErrorMessage,
  sendTsoaError
} from '../utils/custom-error/custom-error';
import {
  DB,
  RaceResultDTO,
  SessionDTO,
  TimedSessionResultsDTO
} from './../models/types.dto';
import { EventService } from './event.controller';
import { LapService } from './lap.controller';
import { ParamsBuilderService } from './paramsBuilder.service';
import { FreePracticeResultService } from './results/freePracticeResult.controller';
import { QualifyingResultService } from './results/qualifyingResult.controller';
import { RaceResultService } from './results/raceResult.controller';

@Route('/sessions')
@Tags('Sessions')
export class SessionService extends DbService {
  static getSessionSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'sessions', {}>
  ) {
    return (qb as SelectQueryBuilder<DB, 'sessions', {}>)
      .select(['id', 'abbreviation', 'startDateTime'])
      .select((eb) => [
        jsonObjectFrom(
          EventService.getEventSelect(eb.selectFrom('events')).whereRef(
            'sessions.eventId',
            '==',
            'events.id'
          )
        ).as('event')
      ]) as SelectQueryBuilder<DB, 'sessions' | T, SessionDTO>;
  }

  private getSessionsWithParams(obj: SessionQueryParams) {
    return new ParamsBuilderService().getSessionsWithParamas('sessions', obj);
  }

  /** Get a the sessions of a round or event */
  @Get('/{season}/{round}')
  getByEvent(
    @Path() season: number,
    @Path() round: number
  ): Promise<SessionDTO[]> {
    return SessionService.getSessionSelect(
      this.getSessionsWithParams({ season, round })
    ).execute();
  }

  /** Get a session */
  @Get('/{season}/{round}/{session}')
  getById(
    @Path() season: number,
    @Path() round: number,
    @Path() session: string
  ): Promise<SessionDTO | undefined> {
    return SessionService.getSessionSelect(
      this.getSessionsWithParams({ season, round, session })
    ).executeTakeFirst();
  }

  /** Get the results of a session session */
  @Get('/{season}/{round}/{session}/results')
  getSessionResults(
    @Path() season: number,
    @Path() round: number,
    @Path() session: string,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ): Promise<
    SessionDTO & {
      results: (TimedSessionResultsDTO | RaceResultDTO)[];
    }
  > {
    if (['Q1', 'Q2', 'Q3', 'Q'].some((x) => x === session)) {
      return new QualifyingResultService().getQualifyingSessionResults(
        season,
        round,
        session,
        notFoundResponse
      );
    } else if (['R', 'SR'].some((x) => x === session)) {
      return new RaceResultService().getRaceResults(
        season,
        round,
        session,
        notFoundResponse
      );
    } else {
      return new FreePracticeResultService().getFreePracticeSessionResults(
        season,
        round,
        session,
        notFoundResponse
      );
    }
  }

  /** Get info about all the laps in this session */
  @Get('/{season}/{round}/{session}/laps')
  getSessionLaps(
    @Path() season: number,
    @Path() round: number,
    @Path() session: string,
    @Queries() obj: PageQueryParams
  ) {
    return new LapService().getLaps({ round, season, session, ...obj });
  }

  /** Get info about the fastest lap of this session */
  @Get('/{season}/{round}/{session}/fastest-lap')
  async getSessionFastestLap(
    @Path() season: number,
    @Path() round: number,
    @Path() session: string,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ) {
    const res = await new LapService().getFastestLaps({
      round,
      season,
      session
    });

    if (res.data.length == 0 || res.totalElements == 0) {
      return sendTsoaError(notFoundResponse, 404, 'fastest-lap.not.found');
    }

    return res.data[0];
  }
}
