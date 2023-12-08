import { SelectQueryBuilder, sql } from 'kysely';
import { ResultsFiltersQueryParams } from '../models/results-filter';
import { DB } from '../models/types.dto';
import { DbService } from '../services/db.service';

export class ResultsService extends DbService {
  static getResultsWithParamas(
    select: SelectQueryBuilder<
      DB,
      'qualifyingResults' | 'raceResults' | 'fpResults',
      {}
    >,
    obj: ResultsFiltersQueryParams
  ) {
    return select
      .$if(obj.maxPos != undefined, (qb) =>
        qb.where('positionOrder', '<=', obj.maxPos!)
      )
      .$if(obj.minPos != undefined, (qb) =>
        qb.where('positionOrder', '>=', obj.minPos!)
      )
      .$if(obj.positionText != undefined, (qb) =>
        qb.where('positionText', '==', obj.positionText!)
      )

      .$if(obj.season != undefined, (qb) =>
        qb.where(
          sql`cast(substr(raceResults.sessionId, 1, 4) as INT)`,
          '==',
          obj.season
        )
      )
      .$if(obj.round != undefined, (qb) =>
        qb.where(
          sql`cast(substr(raceResults.sessionId, 6, 2) as INT)`,
          '==',
          obj.round
        )
      )
      .$if(obj.session != undefined, (qb) =>
        qb.where(sql`substr(sessionId,9,20)`, '=', obj.session)
      )
      .$if(obj.driverId != undefined, (qb) =>
        qb
          .innerJoin(
            'eventEntrants',
            'eventEntrants.id',
            'raceResults.entrantId'
          )
          .where('eventEntrants.driverId', '==', obj.driverId!)
      );
  }
}
