import { SelectQueryBuilder } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam, IncludeQueryParam } from '../../models/include-filter';
import { SessionQueryParams } from '../../models/query-params';
import {
  DB,
  RaceResultDTO,
  SessionDTO,
  TimedSessionResultsDTO
} from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { HttpException } from '../../utils/custom-error';
import { EventService } from '../event/event.service';
import { LapService } from '../laps/lap.service';
import { ParamsBuilderService } from '../paramsBuilder.service';
import { FreePracticeResultService } from '../results/freePracticeResult.controller';
import { QualifyingResultService } from '../results/qualifyingResult.controller';
import { RaceResultService } from '../results/raceResult.controller';
import { SessionController } from './session.controller';

/** Sessions stored in `qualifyingResults` (pre-qualifying and sprint shootouts included) */
const QUALIFYING_SESSIONS = ['PQ', 'Q', 'Q1', 'Q2', 'Q3', 'SQ1', 'SQ2', 'SQ3'];
/** Sessions stored in `raceResults` */
const RACE_SESSIONS = ['R', 'SR'];

export class SessionService
  extends DbService
  implements
    Pick<
      SessionController,
      'getByEvent' | 'getSessionFastestLap' | 'getSessionResults' | 'getById'
    >
{
  static getSessionSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'sessions', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = ['id', 'abbreviation', 'startDateTime'] as const;

    return (qb as SelectQueryBuilder<DB, 'sessions', object>)
      .select(fieldsParam.getFilteredFieldsArray(allSingleFields))
      .$if(fieldsParam.shouldSelectObject('event'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            EventService.getEventSelect(
              eb.selectFrom('events'),
              fieldsParam?.clone('event')
            ).whereRef('sessions.eventId', '==', 'events.id')
          ).as('event')
        )
      ) as SelectQueryBuilder<DB, 'sessions' | T, SessionDTO>;
  }

  private getSessionsWithParams(obj: SessionQueryParams) {
    return new ParamsBuilderService().getSessionsWithParamas('sessions', obj);
  }

  getByEvent(season: number, round: number): Promise<SessionDTO[]> {
    return SessionService.getSessionSelect(
      this.getSessionsWithParams({ season, round })
    ).execute();
  }

  getById(season: number, round: number, session: string): Promise<SessionDTO> {
    return SessionService.getSessionSelect(
      this.getSessionsWithParams({ season, round, session })
    ).executeTakeFirstOrThrow(() => HttpException.resourceNotFound('default'));
  }

  getSessionResults(
    season: number,
    round: number,
    session: string,
    fields: IncludeQueryParam
  ): Promise<(TimedSessionResultsDTO | RaceResultDTO)[]> {
    if (QUALIFYING_SESSIONS.includes(session)) {
      return new QualifyingResultService().getQualifyingSessionResults(
        season,
        round,
        session,
        fields
      );
    } else if (RACE_SESSIONS.includes(session)) {
      return new RaceResultService().getRaceResults(
        season,
        round,
        session,
        fields
      );
    } else {
      return new FreePracticeResultService().getFreePracticeSessionResults(
        season,
        round,
        session,
        fields
      );
    }
  }

  getDriverSessionResult(
    season: number,
    round: number,
    session: string,
    driverId: string,
    fields: IncludeQueryParam
  ): Promise<TimedSessionResultsDTO | RaceResultDTO> {
    if (QUALIFYING_SESSIONS.includes(session)) {
      return new QualifyingResultService().getDriverQualifyingResult(
        season,
        round,
        session,
        driverId,
        fields
      );
    } else if (RACE_SESSIONS.includes(session)) {
      return new RaceResultService().getDriverRaceResult(
        season,
        round,
        session,
        driverId,
        fields
      );
    } else {
      return new FreePracticeResultService().getDriverFreePracticeResult(
        season,
        round,
        session,
        driverId,
        fields
      );
    }
  }

  async getSessionFastestLap(season: number, round: number, session: string) {
    const res = await new LapService().getFastestLaps({
      round,
      season,
      session
    });

    if (res.data.length == 0 || res.totalElements == 0) {
      throw HttpException.resourceNotFound('fastest_lap');
    }

    return res.data[0];
  }
}
