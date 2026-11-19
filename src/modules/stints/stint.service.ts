import { SelectQueryBuilder } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam } from '../../models/include-filter';
import { PageMetadata, Paginator } from '../../models/pagination';
import { Sorter } from '../../models/sorter';
import { DB, StintDTO, Stints } from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { EntryService } from '../entries/entry.service';
import { ParamsBuilderService } from '../paramsBuilder.service';
import { SessionService } from '../session/session.service';
import { StintController, StintQueryParams } from './stint.controller';

export class StintService
  extends DbService
  implements Pick<StintController, 'get'>
{
  static getStintsSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'stints', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = [
      'stint',
      'lapStart',
      'compound',
      'tyreAge'
    ] as const;

    return (qb as SelectQueryBuilder<DB, 'stints', object>)
      .select(fieldsParam.getFilteredFieldsArray(allSingleFields))
      .$if(fieldsParam.shouldSelectObject('entry'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            EntryService.getEntrySelect(
              eb.selectFrom('entries'),
              fieldsParam?.clone('entry')
            ).whereRef('stints.entryId', '==', 'entries.id')
          ).as('entry')
        )
      )
      .$if(fieldsParam.shouldSelectObject('session'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            SessionService.getSessionSelect(
              eb.selectFrom('sessions'),
              fieldsParam?.clone('session')
            ).whereRef('stints.sessionId', '==', 'sessions.id')
          ).as('session')
        )
      ) as SelectQueryBuilder<DB, 'stints' | T, StintDTO>;
  }

  async get(
    obj: StintQueryParams
  ): Promise<PageMetadata & { data: StintDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<Stints>(obj.sort || 'sessionId,entryId,stint');

    const mainSelect = new ParamsBuilderService()
      .getSessionEntriesWithParams('stints', obj)
      .$if(obj.compound != undefined, (qb) =>
        qb.where('stints.compound', '==', obj.compound!)
      );

    return this.paginateSelect(
      mainSelect,
      StintService.getStintsSelect(
        mainSelect,
        IncludeParam.fromFieldQueryParam(obj)
      ),
      paginator,
      sorter
    ).executeTakeFirstOrThrow();
  }
}
