import { SelectQueryBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Queries, Route, Tags } from 'tsoa';
import {
  PageMetadata,
  PageQueryParams,
  Paginator
} from '../models/paginated-items';
import { Sorter, SorterQueryParams } from '../models/sorter';
import { DB, PitStopDTO, PitStops } from '../models/types.dto';
import { DbService } from '../services/db.service';
import { EventService } from './event.controller';
import { EventEntrantService } from './eventEntrant.controller';

interface PitStopQueryParams extends PageQueryParams, SorterQueryParams {
  lap?: number;

  /** @default "eventId" */
  orderBy?: keyof PitStops;
}

@Route('races')
@Tags('Races')
export class PitStopService extends DbService {
  static getPitStopsSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'pitStops', {}>
  ) {
    return (qb as SelectQueryBuilder<DB, 'pitStops', {}>)
      .select(['annotation', 'lap', 'time', 'timeOfDay'])
      .select((eb) => [
        jsonObjectFrom(
          EventService.getEventSelect(eb.selectFrom('events')).whereRef(
            'pitStops.eventId',
            '==',
            'events.id'
          )
        ).as('event'),
        jsonObjectFrom(
          EventEntrantService.getEventEntrantSelect(
            eb.selectFrom('eventEntrants')
          ).whereRef('pitStops.entrantId', '==', 'eventEntrants.id')
        ).as('entrant')
      ]) as SelectQueryBuilder<DB, 'pitStops' | T, PitStopDTO>;
  }

  @Get('/pit-stops')
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
