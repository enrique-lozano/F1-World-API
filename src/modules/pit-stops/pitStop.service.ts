import { SelectQueryBuilder } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam } from '../../models/include-filter';
import { PageMetadata, Paginator } from '../../models/pagination';
import { Sorter } from '../../models/sorter';
import { DB, PitStopDTO, PitStops } from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { ParamsBuilderService } from '../paramsBuilder.service';
import { EntryService } from '../entries/entry.service';
import { SessionService } from '../session/session.service';
import { PitStopController, PitStopQueryParams } from './pitStop.controller';

export class PitStopService
  extends DbService
  implements Pick<PitStopController, 'get'>
{
  static getPitStopsSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'pitStops', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = ['annotation', 'lap', 'time', 'timeOfDay'] as const;

    return (qb as SelectQueryBuilder<DB, 'pitStops', object>)
      .select(fieldsParam.getFilteredFieldsArray(allSingleFields))
      .$if(fieldsParam.shouldSelectObject('entry'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            EntryService.getEntrySelect(
              eb.selectFrom('entries'),
              fieldsParam?.clone('entry')
            ).whereRef('pitStops.entryId', '==', 'entries.id')
          ).as('entry')
        )
      )
      .$if(fieldsParam.shouldSelectObject('session'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            SessionService.getSessionSelect(
              eb.selectFrom('sessions'),
              fieldsParam?.clone('session')
            ).whereRef('pitStops.sessionId', '==', 'sessions.id')
          ).as('session')
        )
      ) as SelectQueryBuilder<DB, 'pitStops' | T, PitStopDTO>;
  }

  async get(
    obj: PitStopQueryParams
  ): Promise<PageMetadata & { data: PitStopDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<PitStops>(obj.sort || 'sessionId,lap');

    const mainSelect = new ParamsBuilderService()
      .getSessionEntriesWithParams('pitStops', obj)
      .$if(obj.lap != undefined, (qb) =>
        qb.where('pitStops.lap', '==', obj.lap!)
      );

    return this.paginateSelect(
      mainSelect,
      PitStopService.getPitStopsSelect(
        mainSelect,
        IncludeParam.fromFieldQueryParam(obj)
      ),
      paginator,
      sorter
    ).executeTakeFirstOrThrow();
  }
}
