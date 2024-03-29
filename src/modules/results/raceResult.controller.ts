import { SelectQueryBuilder } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Path, Queries, Route, Tags } from 'tsoa';
import { IncludeParam, IncludeQueryParam } from '../../models/include-filter';
import { PageMetadata, Paginator } from '../../models/pagination';
import { ResultsFiltersQueryParams } from '../../models/query-params';
import { Sorter } from '../../models/sorter';
import { DB, RaceResultDTO, RaceResults } from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { HttpException } from '../../utils/custom-error';
import { ParamsBuilderService } from '../paramsBuilder.service';
import { SessionEntrantService } from '../session-entrants/sessionEntrant.service';
import { SessionService } from '../session/session.service';

export interface RaceResultQueryParams extends ResultsFiltersQueryParams {
  maxGridPos?: number;

  minGridPos?: number;
}

@Route('races/results')
@Tags('Races')
export class RaceResultService extends DbService {
  static getRaceResultSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'raceResults', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = [
      'gridPenalty',
      'gridPosition',
      'laps',
      'points',
      'pointsCountForWDC',
      'pointsGained',
      'positionText',
      'positionOrder',
      'time',
      'timePenalty',
      'reasonRetired'
    ] as const;

    return (qb as SelectQueryBuilder<DB, 'raceResults', object>)
      .select(fieldsParam.getFilteredFieldsArray(allSingleFields))
      .$if(fieldsParam.shouldSelectObject('session'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            SessionService.getSessionSelect(
              eb.selectFrom('sessions'),
              fieldsParam?.clone('session')
            ).whereRef('raceResults.sessionId', '==', 'sessions.id')
          ).as('session')
        )
      )
      .$if(fieldsParam.shouldSelectObject('entrant'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            SessionEntrantService.getEventEntrantSelect(
              eb.selectFrom('sessionEntrants'),
              fieldsParam?.clone('entrant')
            ).whereRef('raceResults.entrantId', '==', 'sessionEntrants.id')
          ).as('entrant')
        )
      ) as SelectQueryBuilder<DB, 'raceResults' | T, RaceResultDTO>;
  }

  private getResultsWithParams(obj: RaceResultQueryParams) {
    return new ParamsBuilderService()
      .getResultsWithParamas('raceResults', obj)
      .$if(obj.maxGridPos != undefined, (qb) =>
        qb.where('gridPosition', '<=', obj.maxGridPos!)
      )
      .$if(obj.minGridPos != undefined, (qb) =>
        qb.where('gridPosition', '>=', obj.minGridPos!)
      );
  }

  /** Get driver race results based on some filters */
  @Get('/')
  async getRacesResults(
    @Queries() obj: RaceResultQueryParams
  ): Promise<PageMetadata & { data: RaceResultDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<RaceResults>(obj.sort || 'sessionId');

    const mainSelect = this.getResultsWithParams(obj);

    return this.paginateSelect(
      mainSelect,
      RaceResultService.getRaceResultSelect(
        mainSelect,
        IncludeParam.fromFieldQueryParam(obj)
      ),
      paginator,
      sorter
    ).executeTakeFirstOrThrow();
  }

  /** Gets info about the results of a certain race */
  @Get('/{season}/{round}/{session}')
  async getRaceResults(
    @Path() season: number,
    @Path() round: number,
    @Path() session: string,
    @Queries() fields: IncludeQueryParam
  ): Promise<RaceResultDTO[]> {
    const raceResultInDB: RaceResultDTO[] =
      await RaceResultService.getRaceResultSelect(
        this.getResultsWithParams({ session, season, round }),
        IncludeParam.fromFieldQueryParam(fields)
      )
        .orderBy('positionOrder', 'asc')
        .execute();

    if (!raceResultInDB || raceResultInDB.length === 0) {
      throw HttpException.resourceNotFound('results');
    }

    return raceResultInDB;
  }

  /** Gets info about the result obtained by a driver in a certain race */
  @Get('/{season}/{round}/{session}/{driverId}')
  async getDriverRaceResult(
    @Path() season: number,
    @Path() round: number,
    @Path() session: string,
    @Path() driverId: string,
    @Queries() fields: IncludeQueryParam
  ): Promise<RaceResultDTO> {
    return RaceResultService.getRaceResultSelect(
      this.getResultsWithParams({ session, season, round, driverId }),
      IncludeParam.fromFieldQueryParam(fields)
    ).executeTakeFirstOrThrow(() =>
      HttpException.resourceNotFound('driver_result')
    );
  }
}
