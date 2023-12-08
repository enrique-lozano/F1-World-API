import { SelectQueryBuilder } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Path, Route, Tags } from 'tsoa';
import { SessionQueryParams } from '../models/results-filter';
import { DbService } from '../services/db.service';
import { DB, SessionDTO } from './../models/types.dto';
import { EventService } from './event.controller';
import { ParamsBuilderService } from './paramsBuilder.service';

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
}
