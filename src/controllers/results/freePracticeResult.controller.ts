import { SelectQueryBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Path, Queries, Route, Tags } from 'tsoa';
import { IncludeParam, IncludeQueryParam } from '../../models/fields-filter';
import { PageMetadata, Paginator } from '../../models/paginated-items';
import { TimedSessionResultQueryParams } from '../../models/query-params';
import { Sorter } from '../../models/sorter';
import {
  DB,
  TimedSessionResults,
  TimedSessionResultsDTO
} from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { HttpException } from '../../utils/custom-error';
import { ParamsBuilderService } from '../paramsBuilder.service';
import { SessionService } from '../session.controller';
import { SessionEntrantService } from '../sessionEntrant.controller';

@Route('free-practices')
@Tags('Free Practices')
export class FreePracticeResultService extends DbService {
  static getFreePracticeResultSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'fpResults', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = [
      'laps',
      'positionText',
      'positionOrder',
      'time'
    ] as const;

    return (qb as SelectQueryBuilder<DB, 'fpResults', object>)
      .select(fieldsParam.getFilteredFieldsArray(allSingleFields))
      .$if(fieldsParam.shouldSelectObject('session'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            SessionService.getSessionSelect(
              eb.selectFrom('sessions'),
              fieldsParam?.clone('session')
            ).whereRef('fpResults.sessionId', '==', 'sessions.id')
          ).as('session')
        )
      )
      .$if(fieldsParam.shouldSelectObject('entrant'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            SessionEntrantService.getEventEntrantSelect(
              eb.selectFrom('sessionEntrants'),
              fieldsParam?.clone('entrant')
            ).whereRef('fpResults.entrantId', '==', 'sessionEntrants.id')
          ).as('entrant')
        )
      ) as SelectQueryBuilder<DB, 'fpResults' | T, TimedSessionResultsDTO>;
  }

  private getResultsWithParams(obj: TimedSessionResultQueryParams) {
    return new ParamsBuilderService().getResultsWithParamas('fpResults', obj);
  }

  /** Get driver race results based on some filters */ @Get('/')
  getFreePracticesResults(
    @Queries() obj: TimedSessionResultQueryParams
  ): Promise<PageMetadata & { data: TimedSessionResultsDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<TimedSessionResults>(obj.sort || 'sessionId');

    const mainSelect = this.getResultsWithParams(obj);

    return mainSelect
      .select(({ fn, eb }) => [
        fn.countAll<number>().as('totalElements'),
        eb.val(paginator.pageSize).as('pageSize'),
        eb.val(paginator.pageNo).as('currentPage'),
        jsonArrayFrom(
          FreePracticeResultService.getFreePracticeResultSelect(
            mainSelect,
            IncludeParam.fromFieldQueryParam(obj)
          )
            .limit(paginator.pageSize)
            .offset(paginator.sqlOffset)
            .orderBy(sorter.sqlStatementList!)
        ).as('data')
      ])
      .executeTakeFirstOrThrow();
  }

  /** Gets info about the results of a certain free practice */ @Get(
    '/{season}/{round}/{session}'
  )
  async getFreePracticeSessionResults(
    @Path() season: number,
    @Path() round: number,
    @Path() session: string,
    @Queries() fields: IncludeQueryParam
  ): Promise<TimedSessionResultsDTO[]> {
    const fpResultsInDB: TimedSessionResultsDTO[] =
      await FreePracticeResultService.getFreePracticeResultSelect(
        this.getResultsWithParams({ session, season, round }),
        IncludeParam.fromFieldQueryParam(fields)
      )
        .orderBy('positionOrder', 'asc')
        .execute();

    if (!fpResultsInDB || fpResultsInDB.length === 0) {
      throw HttpException.resourceNotFound('results');
    }

    return fpResultsInDB;
  }

  /** Gets info about the result obtained by a driver in a certain free practice */ @Get(
    '/{season}/{round}/{session}/{driverId}'
  )
  async getDriverFreePracticeResult(
    @Path() season: number,
    @Path() round: number,
    @Path() session: string,
    @Path() driverId: string,
    @Queries() fields: IncludeQueryParam
  ): Promise<TimedSessionResultsDTO> {
    const fpResultInDB: TimedSessionResultsDTO | undefined =
      await FreePracticeResultService.getFreePracticeResultSelect(
        this.getResultsWithParams({ session, season, round, driverId }),
        IncludeParam.fromFieldQueryParam(fields)
      )
        .selectAll('fpResults')
        .executeTakeFirst();

    if (!fpResultInDB) {
      throw HttpException.resourceNotFound('results');
    }

    return fpResultInDB;
  }
}
