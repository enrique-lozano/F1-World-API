import { SelectQueryBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { TsoaResponse } from 'tsoa';
import { PageMetadata, Paginator } from '../../models/paginated-items';
import { ResultsFiltersQueryParams } from '../../models/results-filter';
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
import { SessionService } from '../session.controller';

export interface TimedSessionResultQueryParams
  extends ResultsFiltersQueryParams {
  positionText?: string;

  /** @default eventId */
  orderBy?: keyof TimedSessionResults;
}

export type ResultsTables = 'fpResults' | 'raceResults' | 'qualifyingResults';

export class TimedSessionResultService extends DbService {
  static getTimedSessionResultSelect<
    T extends keyof DB,
    TableToGet extends ResultsTables
  >(qb: SelectQueryBuilder<DB, T | TableToGet, {}>, tableToGet: TableToGet) {
    return (qb as SelectQueryBuilder<DB, any, {}>)
      .select(['time', 'laps', 'positionOrder', 'positionText'])
      .select((eb) => [
        jsonObjectFrom(
          SessionService.getSessionSelect(eb.selectFrom('sessions')).whereRef(
            `${tableToGet}.sessionId`,
            '==',
            'sessions.id'
          )
        ).as('session'),
        jsonObjectFrom(
          EventEntrantService.getEventEntrantSelect(
            eb.selectFrom('eventEntrants')
          ).whereRef(`${tableToGet}.entrantId`, '==', 'eventEntrants.id')
        ).as('entrant')
      ]) as SelectQueryBuilder<DB, TableToGet | T, TimedSessionResultsDTO>;
  }

  getTimedSessionsResults(
    session: ResultsTables,
    filters: TimedSessionResultQueryParams
  ): Promise<PageMetadata & { data: TimedSessionResultsDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(filters);
    const sorter = new Sorter<TimedSessionResults>(
      filters.orderBy || 'sessionId',
      filters.orderDir
    );

    const mainSelect = this.db
      .selectFrom(session)
      .$if(filters.positionText != undefined, (qb) =>
        qb.where('positionText', '==', filters.positionText!)
      )
      .$if(filters.maxPos != undefined, (qb) =>
        qb.where('positionOrder', '<=', filters.maxPos!)
      )
      .$if(filters.minPos != undefined, (qb) =>
        qb.where('positionOrder', '>=', filters.minPos!)
      )
      .$if(filters.driverId != undefined, (qb) =>
        qb
          .innerJoin(
            'eventEntrants',
            'eventEntrants.id',
            `${session}.entrantId`
          )
          .where('eventEntrants.driverId', '==', filters.driverId!)
      );

    return mainSelect
      .select(({ fn, eb }) => [
        fn.countAll<number>().as('totalElements'),
        eb.val(paginator.pageSize).as('pageSize'),
        eb.val(paginator.pageNo).as('currentPage'),
        jsonArrayFrom(
          TimedSessionResultService.getTimedSessionResultSelect(
            mainSelect,
            session
          )
            .limit(paginator.pageSize)
            .offset(paginator.sqlOffset)
            .orderBy(`${sorter.orderBy} ${sorter.orderDir}`)
        ).as('data')
      ])
      .executeTakeFirstOrThrow();
  }

  async getTimedSessionResults(
    session: ResultsTables,
    eventId: string,
    notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ): Promise<TimedSessionResultsDTO[]> {
    const raceResultInDB: TimedSessionResultsDTO[] =
      await TimedSessionResultService.getTimedSessionResultSelect(
        this.db.selectFrom(session),
        session
      )
        .where('sessionId', '==', eventId)
        .orderBy('positionOrder', 'asc')
        .execute();

    if (!raceResultInDB) {
      return sendTsoaError(notFoundResponse, 404, 'results.not.found');
    }

    return raceResultInDB;
  }

  async getDriverTimedSessionResult(
    session: ResultsTables,
    eventId: string,
    driverId: string,
    notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ): Promise<TimedSessionResultsDTO> {
    const raceResultInDB: TimedSessionResultsDTO | undefined =
      await TimedSessionResultService.getTimedSessionResultSelect(
        this.db.selectFrom(session),
        session
      )
        .innerJoin('eventEntrants', 'eventEntrants.id', `${session}.entrantId`)
        .where('sessionId', '==', eventId)
        .where('eventEntrants.driverId', '==', driverId)
        .selectAll(session)
        .executeTakeFirst();

    if (!raceResultInDB) {
      return sendTsoaError(notFoundResponse, 404, 'driver-result.not.found');
    }

    return raceResultInDB;
  }
}
