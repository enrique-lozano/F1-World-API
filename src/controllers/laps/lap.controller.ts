import { SelectQueryBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Queries, Route, Tags } from 'tsoa';
import { FieldsParam } from '../../models/fields-filter';
import { PageMetadata, Paginator } from '../../models/paginated-items';
import { SessionEntrantQueryParams } from '../../models/query-params';
import { Sorter } from '../../models/sorter';
import { DB, LapTimeDTO, LapTimes } from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { ParamsBuilderService } from '../paramsBuilder.service';
import { SessionService } from '../session.controller';
import { SessionEntrantService } from '../sessionEntrant.controller';

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
    fieldsParam?: FieldsParam
  ) {
    fieldsParam ??= new FieldsParam();

    const allSingleFields = ['pos', 'lap', 'time'] as const;

    return (qb as SelectQueryBuilder<DB, 'lapTimes', object>)
      .select(
        fieldsParam.getFilteredFieldsArray(allSingleFields) ?? allSingleFields
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
            SessionEntrantService.getEventEntrantSelect(
              eb.selectFrom('sessionEntrants'),
              fieldsParam?.clone('entrant')
            ).whereRef('lapTimes.entrantId', '==', 'sessionEntrants.id')
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
            FieldsParam.fromFieldQueryParam(obj)
          )
            .limit(paginator.pageSize)
            .offset(paginator.sqlOffset)
            .orderBy(`${sorter.orderBy} ${sorter.orderDir}`)
        ).as('data')
      ])
      .executeTakeFirstOrThrow();
  }

  private filterSelectWithFastestTimes<T extends object>(
    select: SelectQueryBuilder<DB, 'lapTimes', T>
  ) {
    return select.innerJoin(
      (eb) =>
        eb
          .selectFrom('lapTimes')
          .select(['sessionId'])
          .select(({ fn }) => [fn.min<number>('time' as any).as('minTime')])
          .groupBy('sessionId')
          .as('fastestLT'),
      (join) =>
        join
          .onRef('lapTimes.sessionId', '==', 'fastestLT.sessionId')
          .onRef('lapTimes.time', '==', 'fastestLT.minTime')
    );
  }

  /** Get the fastest lap times grouped by session, based on some filters.
   *
   * Please take into account that this call return only the global fastest laps inside a session. For example if we filter here by the driver Fernando Alonso, we will get only the sessions where he score the fastest lap */
  @Get('/fastest')
  async getFastestLaps(
    @Queries() obj: LapQueryParams
  ): Promise<PageMetadata & { data: LapTimeDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);

    const mainSelect = new ParamsBuilderService()
      .getSessionEntrantsWithParams('lapTimes', obj)
      .$if(obj.pos != undefined, (qb) => qb.where('pos', '==', obj.pos!))
      .$if(obj.lap != undefined, (qb) => qb.where('lap', '==', obj.lap!));

    return this.filterSelectWithFastestTimes(mainSelect)
      .select(({ fn, eb }) => [
        fn.countAll<number>().as('totalElements'),
        eb.val(paginator.pageSize).as('pageSize'),
        eb.val(paginator.pageNo).as('currentPage'),
        jsonArrayFrom(
          this.filterSelectWithFastestTimes(
            LapService.getLapsSelect(
              mainSelect,
              FieldsParam.fromFieldQueryParam(obj)
            )
          )
            .limit(paginator.pageSize)
            .offset(paginator.sqlOffset)
        ).as('data')
      ])
      .executeTakeFirstOrThrow();
  }
}
