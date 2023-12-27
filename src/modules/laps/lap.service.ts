import { SelectQueryBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam } from '../../models/include-filter';
import { PageMetadata, Paginator } from '../../models/pagination';
import { SessionEntrantQueryParams } from '../../models/query-params';
import { Sorter } from '../../models/sorter';
import { DB, LapTimeDTO, LapTimes } from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { ParamsBuilderService } from '../paramsBuilder.service';
import { SessionService } from '../session/session.service';
import { SessionEntrantService } from '../sessionEntrant.controller';
import { LapController } from './lap.controller';

export interface LapQueryParams extends SessionEntrantQueryParams {
  pos?: number;
  lap?: number;
}

export class LapService
  extends DbService
  implements Pick<LapController, 'getLaps' | 'getFastestLaps'>
{
  static getLapsSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'lapTimes', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = ['pos', 'lap', 'time'] as const;

    return (qb as SelectQueryBuilder<DB, 'lapTimes', object>)
      .select(fieldsParam.getFilteredFieldsArray(allSingleFields))
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

  async getLaps(
    obj: LapQueryParams
  ): Promise<PageMetadata & { data: LapTimeDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<LapTimes>(obj.sort || 'lap');

    const mainSelect = new ParamsBuilderService()
      .getSessionEntrantsWithParams('lapTimes', obj)
      .$if(obj.pos != undefined, (qb) => qb.where('pos', '==', obj.pos!))
      .$if(obj.lap != undefined, (qb) => qb.where('lap', '==', obj.lap!));

    return this.paginateSelect(
      mainSelect,
      LapService.getLapsSelect(
        mainSelect,
        IncludeParam.fromFieldQueryParam(obj)
      ),
      paginator,
      sorter
    ).executeTakeFirstOrThrow();
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

  async getFastestLaps(
    obj: LapQueryParams
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
              IncludeParam.fromFieldQueryParam(obj)
            )
          )
            .limit(paginator.pageSize)
            .offset(paginator.sqlOffset)
        ).as('data')
      ])
      .executeTakeFirstOrThrow();
  }
}
