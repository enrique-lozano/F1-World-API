import { SelectQueryBuilder, sql } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Queries, Route, Tags } from 'tsoa';
import { PageMetadata, Paginator } from '../models/paginated-items';
import { SessionEntrantQueryParams } from '../models/query-params';
import { Sorter } from '../models/sorter';
import { DbService } from '../services/db.service';
import { DB, LapTimeDTO, LapTimes } from './../models/types.dto';
import { EventEntrantService } from './eventEntrant.controller';
import { ParamsBuilderService } from './paramsBuilder.service';
import { SessionService } from './session.controller';

export interface LapQueryParams extends SessionEntrantQueryParams {
  pos?: number;
  lap?: number;

  /** @default sessionId */
  orderBy?: keyof LapTimes;
}

@Route('laps')
@Tags('Laps')
export class LapService extends DbService {
  static getLapsSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'lapTimes', {}>,
    getMinTime = false
  ) {
    return (qb as SelectQueryBuilder<DB, 'lapTimes', {}>)
      .select(['pos', 'lap', ...(getMinTime ? ['time'] : ([] as any))])
      .$if(getMinTime, (qb) =>
        qb.select(({ fn, eb }) => [fn.min<number>('time' as any).as('time')])
      )
      .select((eb) => [
        jsonObjectFrom(
          SessionService.getSessionSelect(eb.selectFrom('sessions')).whereRef(
            'lapTimes.sessionId',
            '==',
            'sessions.id'
          )
        ).as('session'),
        jsonObjectFrom(
          EventEntrantService.getEventEntrantSelect(
            eb.selectFrom('eventEntrants')
          ).whereRef('lapTimes.entrantId', '==', 'eventEntrants.id')
        ).as('entrant')
      ]) as SelectQueryBuilder<DB, 'lapTimes' | T, LapTimeDTO>;
  }

  /** Get lap times based on some filters */ @Get('')
  async getLaps(
    @Queries() obj: LapQueryParams
  ): Promise<PageMetadata & { data: LapTimeDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<LapTimes>(obj.orderBy || 'lap', obj.orderDir);

    const mainSelect = new ParamsBuilderService()
      .getSessionEntrantsWithParams('lapTimes', obj)
      .$if(obj.pos != undefined, (qb) => qb.where('pos', '==', obj.pos!))
      .$if(obj.lap != undefined, (qb) => qb.where('lap', '==', obj.lap!));

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

  /** Get the fastest lap times grouped by session, based on some filters.
   *
   * Please take into account that this do not return only the global fastest laps. For example if we filter here by the driver Fernando Alonso, we will get his fastest lap times of each session. */
  @Get('/fastest')
  getFastestLaps(
    @Queries() obj: LapQueryParams
  ): Promise<PageMetadata & { data: LapTimeDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);

    const mainSelect = new ParamsBuilderService()
      .getSessionEntrantsWithParams('lapTimes', obj)
      .$if(obj.pos != undefined, (qb) => qb.where('pos', '==', obj.pos!))
      .$if(obj.lap != undefined, (qb) => qb.where('lap', '==', obj.lap!));

    return mainSelect
      .select(({ fn, eb }) => [
        fn.count<number>(sql`DISTINCT sessionId`).as('totalElements'),
        eb.val(paginator.pageSize).as('pageSize'),
        eb.val(paginator.pageNo).as('currentPage'),
        jsonArrayFrom(
          LapService.getLapsSelect(mainSelect, true)
            .groupBy('sessionId')
            .limit(paginator.pageSize)
            .offset(paginator.sqlOffset)
        ).as('data')
      ])
      .executeTakeFirstOrThrow();
  }
}
