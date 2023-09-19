import { SelectQueryBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Path, Queries, Res, Route, Tags, TsoaResponse } from 'tsoa';
import {
  PageMetadata,
  PageQueryParams,
  Paginator
} from '../models/paginated-items';
import { Sorter, SorterQueryParams } from '../models/sorter';
import { DB, RaceResultDTO, RaceResults } from '../models/types.dto';
import { DbService } from '../services/db.service';
import {
  ErrorMessage,
  sendTsoaError
} from '../utils/custom-error/custom-error';
import { EventService } from './event.controller';
import { EventEntrantService } from './eventEntrant.controller';

export interface RaceResultQueryParams
  extends PageQueryParams,
    SorterQueryParams {
  /** Filter by a specific grid postion text */
  gridPos?: string;

  /** Filter by a specific postion text, that can be `1`, `2`, `3`... or `DNF`, `DNS`... */
  positionText?: string;

  /** Look for the results where the driver achieved a position worse than or equal to this number.  */
  minPos?: number;

  /** Look for the results where the driver achieved a position better than or equal to this number.  */
  maxPos?: number;

  /** @default eventId */
  orderBy?: keyof RaceResults;
}

@Route('races/results')
@Tags('Races')
export class RaceResultService extends DbService {
  static getRaceResultSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'raceResults', {}>
  ) {
    return (qb as SelectQueryBuilder<DB, 'raceResults', {}>)
      .select([
        'gap',
        'gridPenalty',
        'gridPosition',
        'laps',
        'points',
        'pointsCountForWDC',
        'pointsGained',
        'positionText',
        'positionOrder',
        'gap',
        'time',
        'timePenalty',
        'reasonRetired'
      ])
      .select((eb) => [
        jsonObjectFrom(
          EventService.getEventSelect(eb.selectFrom('events')).whereRef(
            'raceResults.eventId',
            '==',
            'events.id'
          )
        ).as('event'),
        jsonObjectFrom(
          EventEntrantService.getEventEntrantSelect(
            eb.selectFrom('eventEntrants')
          ).whereRef('raceResults.entrantId', '==', 'eventEntrants.id')
        ).as('entrant')
      ]) as SelectQueryBuilder<DB, 'raceResults' | T, RaceResultDTO>;
  }

  /** Get driver race results based on some filters */ @Get('/')
  getRacesResults(
    @Queries() obj: RaceResultQueryParams
  ): Promise<PageMetadata & { data: RaceResultDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<RaceResults>(
      obj.orderBy || 'eventId',
      obj.orderDir
    );

    const mainSelect = this.db
      .selectFrom('raceResults')
      .$if(obj.positionText != undefined, (qb) =>
        qb.where('positionText', '==', obj.positionText!)
      );

    return mainSelect
      .select(({ fn, eb }) => [
        fn.countAll<number>().as('totalElements'),
        eb.val(paginator.pageSize).as('pageSize'),
        eb.val(paginator.pageNo).as('currentPage'),
        jsonArrayFrom(
          RaceResultService.getRaceResultSelect(mainSelect)
            .limit(paginator.pageSize)
            .offset(paginator.sqlOffset)
            .orderBy(`${sorter.orderBy} ${sorter.orderDir}`)
        ).as('data')
      ])
      .executeTakeFirstOrThrow();
  }

  /** Gets info about the results of a certain race */ @Get('/{eventId}')
  async getRaceResults(
    @Path() eventId: string,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ): Promise<RaceResultDTO[]> {
    const raceResultInDB: RaceResultDTO[] =
      await RaceResultService.getRaceResultSelect(
        this.db.selectFrom('raceResults')
      )
        .where('eventId', '==', eventId)
        .execute();

    if (!raceResultInDB || raceResultInDB.length === 0) {
      return sendTsoaError(notFoundResponse, 404, 'results.not.found');
    }

    return raceResultInDB;
  }

  /** Gets info about the result obtained by a driver in a certain race */ @Get(
    '/{eventId}/{driverId}'
  )
  async getDriverRaceResult(
    @Path() eventId: string,
    @Path() driverId: string,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ): Promise<RaceResultDTO> {
    const raceResultInDB: RaceResultDTO | undefined =
      await RaceResultService.getRaceResultSelect(
        this.db.selectFrom('raceResults')
      )
        .innerJoin('eventEntrants', 'eventEntrants.id', 'raceResults.entrantId')
        .where('eventId', '==', eventId)
        .where('eventEntrants.driverId', '==', driverId)
        .selectAll('raceResults')
        .executeTakeFirst();

    if (!raceResultInDB) {
      return sendTsoaError(notFoundResponse, 404, 'results.not.found');
    }

    return raceResultInDB;
  }
}
