import { SelectQueryBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Path, Queries, Route, Tags } from 'tsoa';
import { FieldsParam, FieldsQueryParam } from '../models/fields-filter';
import {
  PageMetadata,
  PageQueryParams,
  Paginator
} from '../models/paginated-items';
import { Sorter, SorterQueryParams } from '../models/sorter';
import { DbService } from '../services/db.service';
import {
  getRoundFromIdColumn,
  getSeasonFromIdColumn
} from '../utils/f1-sql-common-utils';
import { DB, EventDTO, Events } from './../models/types.dto';
import { CircuitService } from './circuit.controller';

interface EventQueryParams
  extends PageQueryParams,
    SorterQueryParams,
    FieldsQueryParam {
  circuitId?: string;

  /** @default id */
  orderBy?: keyof Events;
}

@Route('/events')
@Tags('Events')
export class EventService extends DbService {
  static getEventSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'events', object>,
    fieldsParam?: FieldsParam
  ) {
    fieldsParam ??= new FieldsParam();

    const allSingleFields = [
      'id',
      'name',
      'posterURL',
      'qualyFormat',
      'raceDate',
      'scheduledLaps'
    ] as const;

    return (qb as SelectQueryBuilder<DB, 'events', object>)
      .select(
        fieldsParam.getFilteredFieldsArray(allSingleFields) ?? allSingleFields
      )
      .$if(fieldsParam.shouldSelectObject('session'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            CircuitService.getCircuitsSelect(
              eb.selectFrom('circuits'),
              fieldsParam?.clone('circuit')
            ).whereRef('events.circuitId', '==', 'circuits.id')
          ).as('circuit')
        )
      ) as SelectQueryBuilder<DB, 'events' | T, EventDTO>;
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
          EventService.getEventSelect(
            mainSelect,
            FieldsParam.fromFieldQueryParam(obj)
          )
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
  getById(
    @Path() season: number,
    @Path() round: number,
    @Queries() fields: FieldsQueryParam
  ): Promise<EventDTO | undefined> {
    return EventService.getEventSelect(
      this.db.selectFrom('events'),
      FieldsParam.fromFieldQueryParam(fields)
    )
      .where(getSeasonFromIdColumn('id'), '==', season)
      .where(getRoundFromIdColumn('round'), '==', round)
      .executeTakeFirst();
  }
}
