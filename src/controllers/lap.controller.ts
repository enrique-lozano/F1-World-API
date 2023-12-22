import { SelectQueryBuilder, sql } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Queries, Route, Tags } from 'tsoa';
import { FieldsParam } from '../models/fields-filter';
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
    qb: SelectQueryBuilder<DB, T | 'lapTimes', object>,
    getMinTime = false,
    fieldsParam?: FieldsParam
  ) {
    fieldsParam ??= new FieldsParam();

    const allSingleFields = ['pos', 'lap', 'time'] as const;

    return (qb as SelectQueryBuilder<DB, 'lapTimes', object>)
      .select(
        fieldsParam.getFilteredFieldsArray(allSingleFields) ?? allSingleFields
      )
      .$if(getMinTime, (qb) =>
        qb.select(({ fn }) => [fn.min<number>('time' as any).as('time')])
      )
      .$if(fieldsParam.shouldSelectObject('session'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            SessionService.getSessionSelect(
              eb.selectFrom('sessions'),
              fieldsParam?.clone('session')
            ).whereRef('lapTimes.sessionId', '==', 'sessions.id')
          ).as('session')
        )
      )
      .$if(fieldsParam.shouldSelectObject('entrant'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            EventEntrantService.getEventEntrantSelect(
              eb.selectFrom('eventEntrants'),
              fieldsParam?.clone('entrant')
            ).whereRef('lapTimes.entrantId', '==', 'eventEntrants.id')
          ).as('entrant')
        )
      ) as SelectQueryBuilder<DB, 'lapTimes' | T, LapTimeDTO>;
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
          LapService.getLapsSelect(
            mainSelect,
            false,
            FieldsParam.fromFieldQueryParam(obj)
          )
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
          LapService.getLapsSelect(
            mainSelect,
            true,
            FieldsParam.fromFieldQueryParam(obj)
          )
            .groupBy('sessionId')
            .limit(paginator.pageSize)
            .offset(paginator.sqlOffset)
        ).as('data')
      ])
      .executeTakeFirstOrThrow();
  }
}
