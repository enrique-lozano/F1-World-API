import { SelectQueryBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Queries, Route, Tags } from 'tsoa';
import { FieldsParam } from '../models/fields-filter';
import { PageMetadata, Paginator } from '../models/paginated-items';
import { SessionEntrantQueryParams } from '../models/query-params';
import { Sorter } from '../models/sorter';
import { DB, PitStopDTO, PitStops } from '../models/types.dto';
import { DbService } from '../services/db.service';
import { EventService } from './event.controller';
import { EventEntrantService } from './eventEntrant.controller';

interface PitStopQueryParams extends SessionEntrantQueryParams {
  lap?: number;

  /** @default eventId */
  orderBy?: keyof PitStops;
}

@Route('pit-stops')
@Tags('Pit Stops')
export class PitStopService extends DbService {
  static getPitStopsSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'pitStops', object>,
    fieldsParam?: FieldsParam
  ) {
    fieldsParam ??= new FieldsParam();

    const allSingleFields = ['annotation', 'lap', 'time', 'timeOfDay'] as const;

    return (qb as SelectQueryBuilder<DB, 'pitStops', object>)
      .select(
        fieldsParam.getFilteredFieldsArray(allSingleFields) ?? allSingleFields
      )
      .$if(fieldsParam.shouldSelectObject('entrant'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            EventEntrantService.getEventEntrantSelect(
              eb.selectFrom('eventEntrants'),
              fieldsParam?.clone('entrant')
            ).whereRef('pitStops.entrantId', '==', 'eventEntrants.id')
          ).as('entrant')
        )
      )
      .$if(fieldsParam.shouldSelectObject('event'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            EventService.getEventSelect(eb.selectFrom('events')).whereRef(
              'pitStops.eventId',
              '==',
              'events.id'
            )
          ).as('event')
        )
      ) as SelectQueryBuilder<DB, 'pitStops' | T, PitStopDTO>;
  }

  @Get('/')
  async get(
    @Queries() obj: PitStopQueryParams
  ): Promise<PageMetadata & { data: PitStopDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<PitStops>(obj.orderBy || 'eventId', obj.orderDir);

    const mainSelect = this.db
      .selectFrom('pitStops')
      .selectAll()
      .$if(obj.lap != undefined, (qb) => qb.where('lap', '==', obj.lap!));

    return mainSelect
      .select(({ fn, eb }) => [
        fn.countAll<number>().as('totalElements'),
        eb.val(paginator.pageSize).as('pageSize'),
        eb.val(paginator.pageNo).as('currentPage'),
        jsonArrayFrom(
          PitStopService.getPitStopsSelect(mainSelect)
            .limit(paginator.pageSize)
            .offset(paginator.sqlOffset)
            .orderBy(`${sorter.orderBy} ${sorter.orderDir}`)
        ).as('data')
      ])
      .executeTakeFirstOrThrow();
  }
}
