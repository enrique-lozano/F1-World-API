import { SelectQueryBuilder } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Route, Tags } from 'tsoa';
import { PageQueryParams } from '../models/paginated-items';
import { SorterQueryParams } from '../models/sorter';
import { DbService } from '../services/db.service';
import { DB, SessionDTO, Sessions } from './../models/types.dto';
import { EventService } from './event.controller';

interface SessionQueryParams extends PageQueryParams, SorterQueryParams {
  circuitId?: string;

  /** @default id */
  orderBy?: keyof Sessions;
}

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

  /** Get a session by its ID
   *
   * @param id The ID of the session to get */
  @Get('{id}')
  getById(id: string): Promise<SessionDTO | undefined> {
    return SessionService.getSessionSelect(this.db.selectFrom('sessions'))
      .where('id', '==', id)
      .executeTakeFirst();
  }
}
