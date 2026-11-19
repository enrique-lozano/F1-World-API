import { SelectQueryBuilder } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam } from '../../models/include-filter';
import { PageMetadata, Paginator } from '../../models/pagination';
import { Sorter } from '../../models/sorter';
import {
  DB,
  RaceNeutralisationDTO,
  RaceNeutralisations
} from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { ParamsBuilderService } from '../paramsBuilder.service';
import { SessionService } from '../session/session.service';
import {
  RaceNeutralisationController,
  RaceNeutralisationQueryParams
} from './raceNeutralisation.controller';

export class RaceNeutralisationService
  extends DbService
  implements Pick<RaceNeutralisationController, 'get'>
{
  static getNeutralisationsSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'raceNeutralisations', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = [
      'number',
      'kind',
      'lapStart',
      'lapEnd',
      'cause',
      'resumed',
      'excluded',
      'description'
    ] as const;

    return (qb as SelectQueryBuilder<DB, 'raceNeutralisations', object>)
      .select(fieldsParam.getFilteredFieldsArray(allSingleFields))
      .$if(fieldsParam.shouldSelectObject('session'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            SessionService.getSessionSelect(
              eb.selectFrom('sessions'),
              fieldsParam?.clone('session')
            ).whereRef('raceNeutralisations.sessionId', '==', 'sessions.id')
          ).as('session')
        )
      ) as SelectQueryBuilder<
      DB,
      'raceNeutralisations' | T,
      RaceNeutralisationDTO
    >;
  }

  async get(
    obj: RaceNeutralisationQueryParams
  ): Promise<PageMetadata & { data: RaceNeutralisationDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<RaceNeutralisations>(
      obj.sort || 'sessionId,number'
    );

    const mainSelect = new ParamsBuilderService()
      .getSessionsWithParamas('raceNeutralisations', obj)
      .$if(obj.kind != undefined, (qb) =>
        qb.where('raceNeutralisations.kind', '==', obj.kind!)
      ) as unknown as SelectQueryBuilder<DB, 'raceNeutralisations', object>;

    return this.paginateSelect(
      mainSelect,
      RaceNeutralisationService.getNeutralisationsSelect(
        mainSelect,
        IncludeParam.fromFieldQueryParam(obj)
      ),
      paginator,
      sorter
    ).executeTakeFirstOrThrow();
  }
}
