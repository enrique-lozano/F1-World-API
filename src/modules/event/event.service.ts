import { SelectQueryBuilder, sql } from 'kysely';
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
import { GrandPrixService } from '../grands-prix/grandPrix.service';
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
      .select(
        fieldsParam.getFilteredFieldsArrayWithPrefix(allSingleFields, 'events.')
      )
      .$if(fieldsParam.shouldSelectKey('season'), (qb) =>
        qb.select(getSeasonFromIdColumn('events.id').as('season'))
      )
      .$if(fieldsParam.shouldSelectKey('round'), (qb) =>
        qb.select(getRoundFromIdColumn('events.id').as('round'))
      )
      .$if(fieldsParam.shouldSelectObject('grandPrix'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            GrandPrixService.getGrandPrixSelect(
              eb.selectFrom('grandsPrix'),
              fieldsParam?.clone('grandPrix')
            ).whereRef('events.grandPrixId', '==', 'grandsPrix.id')
          ).as('grandPrix')
        )
      )
      .$if(fieldsParam.shouldSelectObject('circuit'), (qb) =>
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
      .$if(obj.circuitId != undefined, (qb) =>
        qb.where('events.circuitId', '==', obj.circuitId!)
      )
      .$if(obj.grandPrixId != undefined, (qb) =>
        qb.where('events.grandPrixId', '==', obj.grandPrixId!)
      )
      .$if(obj.season != undefined, (qb) =>
        qb.where(getSeasonFromIdColumn('events.id'), '==', obj.season!)
      )
      .$if(obj.name != undefined, (qb) =>
        qb.where(
          sql`LOWER(events.name)`,
          'like',
          `%${obj.name!.toLocaleLowerCase()}%`
        )
      );

    return this.paginateSelect(
      mainSelect,
      EventService.getEventSelect(
        mainSelect,
        IncludeParam.fromFieldQueryParam(obj)
      ),
      paginator,
      sorter,
      {
        id: sql.ref('events.id'),
        name: sql.ref('events.name'),
        season: getSeasonFromIdColumn('events.id'),
        round: getRoundFromIdColumn('events.id')
      }
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
