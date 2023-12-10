import { SelectQueryBuilder, sql } from 'kysely';
import { ResultsFiltersQueryParams } from '../models/results-filter';
import { DB } from '../models/types.dto';
import { DbService } from '../services/db.service';

type resultsTables = 'qualifyingResults' | 'raceResults' | 'fpResults';

type sessionEntrantsTables = resultsTables | 'lapTimes' | 'pitStops';

export class ParamsBuilderService extends DbService {
  getSessionsWithParamas<T extends sessionEntrantsTables | 'sessions'>(
    fromTable: T,
    obj: ResultsFiltersQueryParams
  ) {
    let columnToGet = `${fromTable}.sessionId`;

    if (fromTable == 'sessions') columnToGet = 'id';

    return this.db
      .selectFrom(fromTable)
      .$if(obj.season != undefined, (qb) =>
        qb.where(
          sql`cast(substr(${sql.ref(columnToGet)}, 1, 4) as INT)`,
          '==',
          obj.season
        )
      )
      .$if(obj.round != undefined, (qb) =>
        qb.where(
          sql`cast(substr(${sql.ref(columnToGet)}, 6, 2) as INT)`,
          '==',
          obj.round
        )
      )
      .$if(obj.session != undefined, (qb) =>
        qb.where(sql`substr(${sql.ref(columnToGet)},9,20)`, '=', obj.session)
      );
  }

  getSessionEntrantsWithParams<T extends sessionEntrantsTables>(
    fromTable: T,
    obj: ResultsFiltersQueryParams
  ): SelectQueryBuilder<DB, T, Partial<unknown>> {
    return this.getSessionsWithParamas(fromTable as any, obj).$if(
      obj.driverId != undefined,
      (qb) =>
        qb
          .innerJoin(
            'eventEntrants',
            'eventEntrants.id',
            `${fromTable}.entrantId`
          )
          .where('eventEntrants.driverId', '==', obj.driverId!)
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
