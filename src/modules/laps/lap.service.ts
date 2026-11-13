import { SelectQueryBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam } from '../../models/include-filter';
import { PageMetadata, Paginator } from '../../models/pagination';
import { SessionEntryQueryParams } from '../../models/query-params';
import { Sorter } from '../../models/sorter';
import { DB, LapTimeDTO, LapTimes } from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { ParamsBuilderService } from '../paramsBuilder.service';
import { EntryService } from '../entries/entry.service';
import { SessionService } from '../session/session.service';
import { LapController } from './lap.controller';

export interface LapQueryParams extends SessionEntryQueryParams {
  position?: number;
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

    const allSingleFields = ['position', 'lap', 'time'] as const;

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
      .$if(fieldsParam.shouldSelectObject('entry'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            EntryService.getEntrySelect(
              eb.selectFrom('entries'),
              fieldsParam?.clone('entry')
            ).whereRef('lapTimes.entryId', '==', 'entries.id')
          ).as('entry')
        )
      ) as SelectQueryBuilder<DB, 'lapTimes' | T, LapTimeDTO>;
  }

  async getLaps(
    obj: LapQueryParams
  ): Promise<PageMetadata & { data: LapTimeDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<LapTimes>(obj.sort || 'lap');

    const mainSelect = new ParamsBuilderService()
      .getSessionEntriesWithParams('lapTimes', obj)
      .$if(obj.position != undefined, (qb) =>
        qb.where('position', '==', obj.position!)
      )
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
      .getSessionEntriesWithParams('lapTimes', obj)
      .$if(obj.position != undefined, (qb) =>
        qb.where('position', '==', obj.position!)
      )
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
