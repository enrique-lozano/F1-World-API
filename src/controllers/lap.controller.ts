import { SelectQueryBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Queries, Route, Tags } from 'tsoa';
import {
  PageMetadata,
  PageQueryParams,
  Paginator
} from '../models/paginated-items';
import { Sorter, SorterQueryParams } from '../models/sorter';
import { DbService } from '../services/db.service';
import { DB, LapTimeDTO, LapTimes } from './../models/types.dto';
import { EventService } from './event.controller';
import { EventEntrantService } from './eventEntrant.controller';

interface LapQueryParams extends PageQueryParams, SorterQueryParams {
  pos?: number;
  lap?: number;

  /** @default eventId */
  orderBy?: keyof LapTimes;
}

@Route('races')
@Tags('Races')
export class LapService extends DbService {
  static getLapsSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'lapTimes', {}>
  ) {
    return (qb as SelectQueryBuilder<DB, 'lapTimes', {}>)
      .select(['pos', 'lap', 'time'])
      .select((eb) => [
        jsonObjectFrom(
          EventService.getEventSelect(eb.selectFrom('events')).whereRef(
            'lapTimes.eventId',
            '==',
            'events.id'
          )
        ).as('event'),
        jsonObjectFrom(
          EventEntrantService.getEventEntrantSelect(
            eb.selectFrom('eventEntrants')
          ).whereRef('lapTimes.entrantId', '==', 'eventEntrants.id')
        ).as('entrant')
      ]) as SelectQueryBuilder<DB, 'lapTimes' | T, LapTimeDTO>;
  }

  @Get('/laps')
  async get(
    @Queries() obj: LapQueryParams
  ): Promise<PageMetadata & { data: LapTimeDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);

    const sorter = new Sorter<LapTimes>(obj.orderBy || 'lap', obj.orderDir);

    const mainSelect = this.db
      .selectFrom('lapTimes')
      .$if(obj.pos != undefined, (qb) => qb.where('pos', '==', obj.pos!));

    return mainSelect
      .select(({ fn, eb }) => [
        fn.countAll<number>().as('totalElements'),
        eb.val(paginator.pageSize).as('pageSize'),
        eb.val(paginator.pageNo).as('currentPage'),
        jsonArrayFrom(
          LapService.getLapsSelect(mainSelect)
            .limit(paginator.pageSize)
            .offset(paginator.sqlOffset)
            .orderBy(`${sorter.orderBy} ${sorter.orderDir}`)
        ).as('data')
      ])
      .executeTakeFirstOrThrow();
  }

  @Get('/fastest-laps')
  getFastestLaps(
    @Queries() obj: LapQueryParams
  ): Promise<PageMetadata & { data: LapTimeDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);

    const mainSelect = this.db
      .selectFrom('lapTimes')
      .$if(obj.pos != undefined, (qb) => qb.where('pos', '==', obj.pos!))
      .groupBy('eventId');

    return mainSelect
      .select(({ fn, eb }) => [
        fn.countAll<number>().as('totalElements'),
        eb.val(paginator.pageSize).as('pageSize'),
        eb.val(paginator.pageNo).as('currentPage'),
        jsonArrayFrom(
          LapService.getLapsSelect(mainSelect)
            .limit(paginator.pageSize)
            .offset(paginator.sqlOffset)
        ).as('data')
      ])
      .executeTakeFirstOrThrow();
  }
}
