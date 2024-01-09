import { SelectQueryBuilder } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam, IncludeQueryParam } from '../../models/include-filter';
import { PageMetadata, Paginator } from '../../models/pagination';
import { Sorter } from '../../models/sorter';
import { DB, EventDTO, Events } from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import {
  getRoundFromIdColumn,
  getSeasonFromIdColumn
} from '../../utils/f1-sql-common-utils';
import { CircuitService } from '../circuit/circuit.service';
import { EventController, EventQueryParams } from './event.controller';

export class EventService
  extends DbService
  implements Pick<EventController, 'get' | 'getById'>
{
  static getEventSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'events', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = [
      'id',
      'name',
      'posterURL',
      'qualyFormat',
      'scheduledLaps'
    ] as const;

    return (qb as SelectQueryBuilder<DB, 'events', object>)
      .select(fieldsParam.getFilteredFieldsArray(allSingleFields))
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

  async get(
    obj: EventQueryParams
  ): Promise<PageMetadata & { data: EventDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<Events>(obj.sort || 'id');

    const mainSelect = this.db
      .selectFrom('events')
      .where(
        'events.circuitId',
        obj.circuitId ? '=' : 'like',
        obj.circuitId ? obj.circuitId : '%%'
      );

    return this.paginateSelect(
      mainSelect,
      EventService.getEventSelect(
        mainSelect,
        IncludeParam.fromFieldQueryParam(obj)
      ),
      paginator,
      sorter
    ).executeTakeFirstOrThrow();
  }

  getById(
    season: number,
    round: number,
    fields: IncludeQueryParam
  ): Promise<EventDTO | undefined> {
    return EventService.getEventSelect(
      this.db.selectFrom('events'),
      IncludeParam.fromFieldQueryParam(fields)
    )
      .where(getSeasonFromIdColumn('id'), '==', season)
      .where(getRoundFromIdColumn('id'), '==', round)
      .executeTakeFirst();
  }
}
