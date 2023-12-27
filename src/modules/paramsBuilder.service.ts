import { SelectQueryBuilder } from 'kysely';
import {
  ResultsFiltersQueryParams,
  SessionEntrantQueryParams,
  SessionQueryParams
} from '../models/query-params';
import { DB } from '../models/types.dto';
import { DbService } from '../services/db.service';
import {
  getRoundFromIdColumn,
  getSeasonFromIdColumn,
  getSessionIdFromIdColumn
} from '../utils/f1-sql-common-utils';

type resultsTables = 'qualifyingResults' | 'raceResults' | 'fpResults';

type sessionEntrantsTables = resultsTables | 'lapTimes' | 'pitStops';

export class ParamsBuilderService extends DbService {
  getSessionsWithParamas<T extends sessionEntrantsTables | 'sessions'>(
    fromTable: T,
    obj: SessionQueryParams
  ) {
    let columnToGet = `${fromTable}.sessionId`;

    if (fromTable == 'sessions') columnToGet = 'id';

    return this.db
      .selectFrom(fromTable)
      .$if(obj.season != undefined, (qb) =>
        qb.where(getSeasonFromIdColumn(columnToGet), '==', obj.season!)
      )
      .$if(obj.round != undefined, (qb) =>
        qb.where(getRoundFromIdColumn(columnToGet), '==', obj.round!)
      )
      .$if(obj.session != undefined, (qb) =>
        qb.where(getSessionIdFromIdColumn(columnToGet), '=', obj.session!)
      );
  }

  getSessionEntrantsWithParams<T extends sessionEntrantsTables>(
    fromTable: T,
    obj: SessionEntrantQueryParams
  ): SelectQueryBuilder<DB, T, Partial<unknown>> {
    return this.getSessionsWithParamas(fromTable as any, obj).$if(
      obj.driverId != undefined,
      (qb) =>
        qb
          .innerJoin(
            'sessionEntrants',
            'sessionEntrants.id',
            `${fromTable}.entrantId`
          )
          .where('sessionEntrants.driverId', '==', obj.driverId!)
    );
  }

  getResultsWithParamas<T extends resultsTables>(
    fromTable: T,
    obj: ResultsFiltersQueryParams
  ): SelectQueryBuilder<DB, T, Partial<unknown>> {
    return this.getSessionEntrantsWithParams(fromTable as any, obj)
      .$if(obj.maxPos != undefined, (qb) =>
        qb.where('positionOrder', '<=', obj.maxPos!)
      )
      .$if(obj.minPos != undefined, (qb) =>
        qb.where('positionOrder', '>=', obj.minPos!)
      )
      .$if(obj.positionText != undefined, (qb) =>
        qb.where('positionText', '==', obj.positionText!)
      ) as any;
  }
}
