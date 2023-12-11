import { SelectQueryBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Path, Queries, Res, Route, Tags, TsoaResponse } from 'tsoa';
import { FieldsParam, FieldsQueryParam } from '../../models/fields-filter';
import { PageMetadata, Paginator } from '../../models/paginated-items';
import { TimedSessionResultQueryParams } from '../../models/query-params';
import { Sorter } from '../../models/sorter';
import {
  DB,
  TimedSessionResults,
  TimedSessionResultsDTO
} from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import {
  ErrorMessage,
  sendTsoaError
} from '../../utils/custom-error/custom-error';
import { EventEntrantService } from '../eventEntrant.controller';
import { ParamsBuilderService } from '../paramsBuilder.service';
import { SessionService } from '../session.controller';

@Route('free-practices')
@Tags('Free Practices')
export class FreePracticeResultService extends DbService {
  static getFreePracticeResultSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'fpResults', {}>,
    fieldsParam?: FieldsParam
  ) {
    fieldsParam ??= new FieldsParam();

    const allSingleFields = [
      'laps',
      'positionText',
      'positionOrder',
      'time'
    ] as const;

    return (qb as SelectQueryBuilder<DB, 'fpResults', {}>)
      .select(
        fieldsParam.getFilteredFieldsArray(allSingleFields) ?? allSingleFields
      )
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
            EventEntrantService.getEventEntrantSelect(
              eb.selectFrom('eventEntrants'),
              fieldsParam?.clone('entrant')
            ).whereRef('fpResults.entrantId', '==', 'eventEntrants.id')
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
    const sorter = new Sorter<TimedSessionResults>(
      obj.orderBy || 'sessionId',
      obj.orderDir
    );

    const mainSelect = this.getResultsWithParams(obj);

    return mainSelect
      .select(({ fn, eb }) => [
        fn.countAll<number>().as('totalElements'),
        eb.val(paginator.pageSize).as('pageSize'),
        eb.val(paginator.pageNo).as('currentPage'),
        jsonArrayFrom(
          FreePracticeResultService.getFreePracticeResultSelect(
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

  /** Gets info about the results of a certain free practice */ @Get(
    '/{season}/{round}/{session}'
  )
  async getFreePracticeSessionResults(
    @Path() season: number,
    @Path() round: number,
    @Path() session: string,
    @Queries() fields: FieldsQueryParam,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ): Promise<TimedSessionResultsDTO[]> {
    const fpResultsInDB: TimedSessionResultsDTO[] =
      await FreePracticeResultService.getFreePracticeResultSelect(
        this.getResultsWithParams({ session, season, round }),
        FieldsParam.fromFieldQueryParam(fields)
      )
        .orderBy('positionOrder', 'asc')
        .execute();

    if (!fpResultsInDB || fpResultsInDB.length === 0) {
      return sendTsoaError(notFoundResponse, 404, 'results.not.found');
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
    @Queries() fields: FieldsQueryParam,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ): Promise<TimedSessionResultsDTO> {
    const fpResultInDB: TimedSessionResultsDTO | undefined =
      await FreePracticeResultService.getFreePracticeResultSelect(
        this.getResultsWithParams({ session, season, round, driverId }),
        FieldsParam.fromFieldQueryParam(fields)
      )
        .selectAll('fpResults')
        .executeTakeFirst();

    if (!fpResultInDB) {
      return sendTsoaError(notFoundResponse, 404, 'results.not.found');
    }

    return fpResultInDB;
  }
}
