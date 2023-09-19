import { SelectQueryBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { TsoaResponse } from 'tsoa';
import {
  PageMetadata,
  PageQueryParams,
  Paginator
} from '../models/paginated-items';
import { Sorter, SorterQueryParams } from '../models/sorter';
import {
  DB,
  TimedSessionResults,
  TimedSessionResultsDTO
} from '../models/types.dto';
import { DbService } from '../services/db.service';
import {
  ErrorMessage,
  sendTsoaError
} from '../utils/custom-error/custom-error';
import { EventService } from './event.controller';
import { EventEntrantService } from './eventEntrant.controller';

export interface TimedSessionResultQueryParams
  extends PageQueryParams,
    SorterQueryParams {
  positionText?: number;

  /** @default eventId */
  orderBy?: keyof TimedSessionResults;
}

export type TimedSessionTables =
  | 'fp1_results'
  | 'fp2_results'
  | 'fp3_results'
  | 'fp4_results'
  | 'warmingUpResults'
  | 'preQualifyingResults'
  | 'qualifying1_results'
  | 'qualifying2_results';

export class TimedSessionResultService extends DbService {
  static getRaceResultSelect<
    T extends keyof DB,
    TableToGet extends TimedSessionTables
  >(qb: SelectQueryBuilder<DB, T | TableToGet, {}>, tableToGet: TableToGet) {
    return (qb as SelectQueryBuilder<DB, any, {}>)
      .select(['time', 'laps', 'positionOrder', 'positionText'])
      .select((eb) => [
        jsonObjectFrom(
          EventService.getEventSelect(eb.selectFrom('events')).whereRef(
            `${tableToGet}.eventId`,
            '==',
            'events.id'
          )
        ).as('event'),
        jsonObjectFrom(
          EventEntrantService.getEventEntrantSelect(
            eb.selectFrom('eventEntrants')
          ).whereRef(`${tableToGet}.entrantId`, '==', 'eventEntrants.id')
        ).as('entrant')
      ]) as SelectQueryBuilder<DB, TableToGet | T, TimedSessionResultsDTO>;
  }

  getTimedSessionsResults(
    session: TimedSessionTables,
    filters: TimedSessionResultQueryParams
  ): Promise<PageMetadata & { data: TimedSessionResultsDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(filters);
    const sorter = new Sorter<TimedSessionResults>(
      filters.orderBy || 'eventId',
      filters.orderDir
    );

    const mainSelect = this.db.selectFrom(session);

    return mainSelect
      .select(({ fn, eb }) => [
        fn.countAll<number>().as('totalElements'),
        eb.val(paginator.pageSize).as('pageSize'),
        eb.val(paginator.pageNo).as('currentPage'),
        jsonArrayFrom(
          TimedSessionResultService.getRaceResultSelect(mainSelect, session)
            .limit(paginator.pageSize)
            .offset(paginator.sqlOffset)
            .orderBy(`${sorter.orderBy} ${sorter.orderDir}`)
        ).as('data')
      ])
      .executeTakeFirstOrThrow();
  }

  async getTimedSessionResults(
    session: TimedSessionTables,
    eventId: string,
    notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ): Promise<TimedSessionResultsDTO[]> {
    const raceResultInDB: TimedSessionResultsDTO[] =
      await TimedSessionResultService.getRaceResultSelect(
        this.db.selectFrom(session),
        session
      )
        .where('eventId', '==', eventId)
        .execute();

    if (!raceResultInDB) {
      return sendTsoaError(notFoundResponse, 404, 'results.not.found');
    }

    return raceResultInDB;
  }

  async getDriverTimedSessionResult(
    session: TimedSessionTables,
    eventId: string,
    driverId: string,
    notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ): Promise<TimedSessionResultsDTO> {
    const raceResultInDB: TimedSessionResultsDTO | undefined =
      await TimedSessionResultService.getRaceResultSelect(
        this.db.selectFrom(session),
        session
      )
        .innerJoin('eventEntrants', 'eventEntrants.id', `${session}.entrantId`)
        .where('eventId', '==', eventId)
        .where('eventEntrants.driverId', '==', driverId)
        .selectAll(session)
        .executeTakeFirst();

    if (!raceResultInDB) {
      return sendTsoaError(notFoundResponse, 404, 'driver-result.not.found');
    }

    return raceResultInDB;
  }
}
