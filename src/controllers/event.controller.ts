import { SelectQueryBuilder, sql } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Queries, Route, Tags } from 'tsoa';
import {
  PageMetadata,
  PageQueryParams,
  Paginator
} from '../models/paginated-items';
import { Sorter, SorterQueryParams } from '../models/sorter';
import { DbService } from '../services/db.service';
import { DB, EventDTO, Events } from './../models/types.dto';
import { CircuitService } from './circuit.controller';

interface EventQueryParams extends PageQueryParams, SorterQueryParams {
  circuitId?: string;

  /** @default id */
  orderBy?: keyof Events;
}

@Route('/events')
@Tags('Events')
export class EventService extends DbService {
  static getEventSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'events', {}>
  ) {
    return (qb as SelectQueryBuilder<DB, 'events', {}>)
      .select([
        'id',
        'name',
        'posterURL',
        'qualyFormat',
        'raceDate',
        'scheduledLaps'
      ])
      .select((eb) => [
        jsonObjectFrom(
          CircuitService.getCircuitsSelect(eb.selectFrom('circuits')).whereRef(
            'events.circuitId',
            '==',
            'circuits.id'
          )
        ).as('circuit')
      ]) as SelectQueryBuilder<DB, 'events' | T, EventDTO>;
  }

  @Get('/')
  async get(
    @Queries() obj: EventQueryParams
  ): Promise<PageMetadata & { data: EventDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<Events>(obj.orderBy || 'raceDate', obj.orderDir);

    const mainSelect = this.db
      .selectFrom('events')
      .where(
        'events.circuitId',
        obj.circuitId ? '=' : 'like',
        obj.circuitId ? obj.circuitId : '%%'
      );

    return mainSelect
      .select(({ fn, eb }) => [
        fn.countAll<number>().as('totalElements'),
        eb.val(paginator.pageSize).as('pageSize'),
        eb.val(paginator.pageNo).as('currentPage'),
        jsonArrayFrom(
          EventService.getEventSelect(mainSelect)
            .limit(paginator.pageSize)
            .offset(paginator.sqlOffset)
            .orderBy(`${sorter.orderBy} ${sorter.orderDir}`)
        ).as('data')
      ])
      .executeTakeFirstOrThrow();
  }

  /** Get a event by its ID
   *
   * @param id The ID of the event to get */
  /*   @Get('{id}')
  getById(id: string): Promise<EventDTO | undefined> {
    return EventService.getEventSelect(this.db.selectFrom('events'))
      .where('id', '==', id)
      .executeTakeFirst();
  } */

  /** Get a event by its season and its round */
  @Get('{season}/{round}')
  getById(season: number, round: number): Promise<EventDTO | undefined> {
    return EventService.getEventSelect(this.db.selectFrom('events'))
      .where(sql`cast(substr(id, 1, 4) as INT)`, '==', season)
      .where(sql`cast(substr(id, 6, 8) as INT)`, '==', round)
      .executeTakeFirst();
  }
}
