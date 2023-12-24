import { sql } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Path, Query, Route, Tags } from 'tsoa';
import { DriverDTO } from '../models/types.dto';
import { DbService } from '../services/db.service';
import {
  getRoundFromIdColumn,
  getSeasonFromIdColumn
} from '../utils/f1-sql-common-utils';
import { DriverService } from './driver.controller';

export interface DriverChampResult {
  driver: DriverDTO;

  /** Points that this entrant had for this championship season, in the specified round */
  points: number;

  /** Points that this entrant would have for this championship season, without excluding any result (until 1990, only the best N results count, check https://en.wikipedia.org/wiki/List_of_Formula_One_World_Championship_points_scoring_systems)*/
  totalPoints: number;
}

@Route('championships')
@Tags('Championships')
export class DriverStandingService extends DbService {
  private async resultsOrderer(
    champResult: DriverChampResult,
    season: number,
    round?: number
  ) {
    return {
      champResult,
      raceResults: await this.db
        .selectFrom('raceResults')
        .leftJoin(
          'sessionEntrants',
          'sessionEntrants.id',
          'raceResults.entrantId'
        )
        .select(
          sql<string>`CASE WHEN CAST(positionText as INT) > 0               \
            THEN CAST(positionText as INT) ELSE null END`.as('position')
        )
        .where(getSeasonFromIdColumn('sessionId'), '==', season)

        .where('driverId', '==', champResult.driver?.id)
        .$if(round != undefined, (qb) =>
          qb.where(getRoundFromIdColumn('sessionId'), '==', round!)
        )
        .execute()
    };
  }

  /** Get the driver's world championship results for the specified season
   *
   * @param round If specified, the result obtained will be the championship situation immediately after that round. */ @Get(
    '/{season}/drivers'
  )
  async getDriverChampionshipResults(
    @Path() season: number,
    @Query() round?: number
  ) {
    let results: DriverChampResult[] = (await this.db
      .selectFrom('raceResults')
      .leftJoin(
        'sessionEntrants',
        'sessionEntrants.id',
        'raceResults.entrantId'
      )
      .where(getSeasonFromIdColumn('raceResults.sessionId'), '==', season)
      .$if(round != undefined, (qb) =>
        qb.where(getRoundFromIdColumn('raceResults.sessionId'), '<=', round!)
      )
      .groupBy('driverId')
      .select(({ fn, eb }) => [
        sql<number>`${fn.sum('raceResults.pointsGained')}`.as('points'),
        sql<number>`${fn.sum('raceResults.points')}`.as('totalPoints'),
        jsonObjectFrom(
          DriverService.getDriversSelect(
            eb.selectFrom('drivers') as any
          ).whereRef('sessionEntrants.driverId', '==', 'drivers.id')
        ).as('driver')
      ])
      .execute()) as DriverChampResult[];

    // ---- Resolve ties in pints ----
    const resultsWithAsyncData = await Promise.all(
      results.map((result) => this.resultsOrderer(result, season, round))
    );

    // TODO: ---->
    /*  This is currently getting the results for all the drivers, 
    when we need only the results when there is a tie in points */

    results = resultsWithAsyncData
      .sort((a, b) => {
        if (a.champResult.points < b.champResult.points) return 1;
        else if (a.champResult.points > b.champResult.points) return -1;
        else {
          let i = 0;
          while (
            a.raceResults.length - 1 >= i ||
            b.raceResults.length - 1 >= i
          ) {
            if (a.raceResults[i] < b.raceResults[i] || !b.raceResults[i])
              return -1;
            else if (a.raceResults[i] > b.raceResults[i] || !a.raceResults[i])
              return 1;

            i = i + 1;
          }

          return 0;
        }
      })
      .map((e) => e.champResult);

    return results.map((x, index) => {
      return {
        position: index + 1,
        driver: x.driver,
        points: x.points,
        totalPoints: x.totalPoints
      };
    });
  }

  /** Get the driver's world championship result for a specified season and driver
   *
   * @param round If specified, the result obtained will be the championship situation of the driver immediately after that round. */ @Get(
    '/{season}/drivers/{driverId}'
  )
  async getDriverChampionshipResult(
    @Path() season: number,
    @Path() driverId: string,
    @Query() round?: number
  ) {
    return (await this.getDriverChampionshipResults(season, round)).find(
      (x) => x.driver?.id == driverId
    );
  }
}
