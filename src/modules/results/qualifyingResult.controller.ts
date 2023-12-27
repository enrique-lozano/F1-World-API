import { SelectQueryBuilder } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Path, Queries, Route, Tags } from 'tsoa';
import { IncludeParam, IncludeQueryParam } from '../../models/include-filter';
import { PageMetadata, Paginator } from '../../models/pagination';
import { TimedSessionResultQueryParams } from '../../models/query-params';
import { Sorter } from '../../models/sorter';
import {
  DB,
  TimedSessionResults,
  TimedSessionResultsDTO
} from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { HttpException } from '../../utils/custom-error';
import { SessionEntrantService } from '../session-entrants/sessionEntrant.service';
import { SessionService } from '../session/session.service';
import { ParamsBuilderService } from './../paramsBuilder.service';

@Route('qualifyings')
@Tags('Qualifyings')
export class QualifyingResultService extends DbService {
  static getQualifyingResultSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'qualifyingResults', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = [
      'laps',
      'positionText',
      'positionOrder',
      'time'
    ] as const;

    return (qb as SelectQueryBuilder<DB, 'qualifyingResults', object>)
      .select(fieldsParam.getFilteredFieldsArray(allSingleFields))
      .$if(fieldsParam.shouldSelectObject('session'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            SessionService.getSessionSelect(
              eb.selectFrom('sessions'),
              fieldsParam?.clone('session')
            ).whereRef('qualifyingResults.sessionId', '==', 'sessions.id')
          ).as('session')
        )
      )
      .$if(fieldsParam.shouldSelectObject('entrant'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            SessionEntrantService.getEventEntrantSelect(
              eb.selectFrom('sessionEntrants'),
              fieldsParam?.clone('entrant')
            ).whereRef(
              'qualifyingResults.entrantId',
              '==',
              'sessionEntrants.id'
            )
          ).as('entrant')
        )
      ) as SelectQueryBuilder<
      DB,
      'qualifyingResults' | T,
      TimedSessionResultsDTO
    >;
  }

  private getResultsWithParams(obj: TimedSessionResultQueryParams) {
    return new ParamsBuilderService().getResultsWithParamas(
      'qualifyingResults',
      obj
    );
  }

  /** Get driver race results based on some filters */
  @Get('/')
  getQualifyingsResults(
    @Queries() obj: TimedSessionResultQueryParams
  ): Promise<PageMetadata & { data: TimedSessionResultsDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<TimedSessionResults>(obj.sort || 'sessionId');

    const mainSelect = this.getResultsWithParams(obj);

    return this.paginateSelect(
      mainSelect,
      QualifyingResultService.getQualifyingResultSelect(
        mainSelect,
        IncludeParam.fromFieldQueryParam(obj)
      ),
      paginator,
      sorter
    ).executeTakeFirstOrThrow();
  }

  /** Gets info about the results of a certain free practice */
  @Get('/{season}/{round}/{session}')
  async getQualifyingSessionResults(
    @Path() season: number,
    @Path() round: number,
    @Path() session: string,
    @Queries() fields: IncludeQueryParam
  ): Promise<TimedSessionResultsDTO[]> {
    const sessionResultsInDB: TimedSessionResultsDTO[] =
      await QualifyingResultService.getQualifyingResultSelect(
        this.getResultsWithParams({ session, season, round }),
        IncludeParam.fromFieldQueryParam(fields)
      )
        .orderBy('positionOrder', 'asc')
        .execute();

    if (!sessionResultsInDB || sessionResultsInDB.length === 0) {
      throw HttpException.resourceNotFound('results');
    }

    return sessionResultsInDB;
  }

  /** Gets info about the result obtained by a driver in a certain free practice */
  @Get('/{season}/{round}/{session}/{driverId}')
  async getDriverQualifyingResult(
    @Path() season: number,
    @Path() round: number,
    @Path() session: string,
    @Path() driverId: string,
    @Queries() fields: IncludeQueryParam
  ): Promise<TimedSessionResultsDTO> {
    return QualifyingResultService.getQualifyingResultSelect(
      this.getResultsWithParams({ session, season, round, driverId }),
      IncludeParam.fromFieldQueryParam(fields)
    ).executeTakeFirstOrThrow(() =>
      HttpException.resourceNotFound('driver_result')
    );
  }
}
