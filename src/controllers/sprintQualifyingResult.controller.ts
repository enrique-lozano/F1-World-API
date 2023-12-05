import { SelectQueryBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Path, Queries, Res, Route, Tags, TsoaResponse } from 'tsoa';
import { PageMetadata, Paginator } from '../models/paginated-items';
import { DB, SprintQualifyingResultDTO } from '../models/types.dto';
import { DbService } from '../services/db.service';
import {
  ErrorMessage,
  sendTsoaError
} from '../utils/custom-error/custom-error';
import { EventEntrantService } from './eventEntrant.controller';
import { RaceResultQueryParams } from './raceResult.controller';
import { SessionService } from './session.controller';

@Route('sprint-qualifyings/results')
@Tags('Sprint Qualifyings')
export class sprintQualifyingResultService extends DbService {
  static getSprintRaceResultSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'sprintQualifyingResults', {}>
  ) {
    return (qb as SelectQueryBuilder<DB, 'sprintQualifyingResults', {}>)
      .select([
        'gap',
        'gridPos',
        'laps',
        'points',
        'positionText',
        'positionOrder',
        'gap',
        'time',
        'timePenalty',
        'reasonRetired'
      ])
      .select((eb) => [
        jsonObjectFrom(
          SessionService.getSessionSelect(eb.selectFrom('sessions')).whereRef(
            'sprintQualifyingResults.sessionId',
            '==',
            'sessions.id'
          )
        ).as('session'),
        jsonObjectFrom(
          EventEntrantService.getEventEntrantSelect(
            eb.selectFrom('eventEntrants')
          ).whereRef(
            'sprintQualifyingResults.entrantId',
            '==',
            'eventEntrants.id'
          )
        ).as('entrant')
      ]) as SelectQueryBuilder<
      DB,
      'sprintQualifyingResults' | T,
      SprintQualifyingResultDTO
    >;
  }

  /** Get driver race results based on some filters */ @Get('/')
  getRacesResults(
    @Queries() obj: RaceResultQueryParams
  ): Promise<PageMetadata & { data: SprintQualifyingResultDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);

    const mainSelect = this.db
      .selectFrom('sprintQualifyingResults')
      .$if(obj.positionText != undefined, (qb) =>
        qb.where('positionText', '==', obj.positionText!)
      );

    return mainSelect
      .select(({ fn, eb }) => [
        fn.countAll<number>().as('totalElements'),
        eb.val(paginator.pageSize).as('pageSize'),
        eb.val(paginator.pageNo).as('currentPage'),
        jsonArrayFrom(
          sprintQualifyingResultService
            .getSprintRaceResultSelect(mainSelect)
            .limit(paginator.pageSize)
            .offset(paginator.sqlOffset)
        ).as('data')
      ])
      .executeTakeFirstOrThrow();
  }

  /** Gets info about the results of a certain race */ @Get('/{sessionId}')
  async getRaceResults(
    @Path() sessionId: string,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ): Promise<SprintQualifyingResultDTO[]> {
    const raceResultInDB: SprintQualifyingResultDTO[] =
      await sprintQualifyingResultService
        .getSprintRaceResultSelect(
          this.db.selectFrom('sprintQualifyingResults')
        )
        .where('sessionId', '==', sessionId)
        .execute();

    if (!raceResultInDB || raceResultInDB.length === 0) {
      return sendTsoaError(notFoundResponse, 404, 'results.not.found');
    }

    return raceResultInDB;
  }

  /** Gets info about the result obtained by a driver in a certain race */ @Get(
    '/{sessionId}/{driverId}'
  )
  async getDriverRaceResult(
    @Path() sessionId: string,
    @Path() driverId: string,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ): Promise<SprintQualifyingResultDTO> {
    const raceResultInDB: SprintQualifyingResultDTO | undefined =
      await sprintQualifyingResultService
        .getSprintRaceResultSelect(
          this.db.selectFrom('sprintQualifyingResults')
        )
        .innerJoin(
          'eventEntrants',
          'eventEntrants.id',
          'sprintQualifyingResults.entrantId'
        )
        .where('sessionId', '==', sessionId)
        .where('eventEntrants.driverId', '==', driverId)
        .selectAll('sprintQualifyingResults')
        .executeTakeFirst();

    if (!raceResultInDB) {
      return sendTsoaError(notFoundResponse, 404, 'results.not.found');
    }

    return raceResultInDB;
  }
}
