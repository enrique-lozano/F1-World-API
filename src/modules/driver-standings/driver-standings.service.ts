import { sql } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { DbService } from '../../services/db.service';
import {
  getRoundFromIdColumn,
  getSeasonFromIdColumn,
  orderNullsLast
} from '../../utils/f1-sql-common-utils';
import { DriverService } from '../driver/driver.service';
import {
  DriverChampResult,
  DriverStandingController
} from './driver-standings.controller';

export class DriverStandingService
  extends DbService
  implements
    Pick<
      DriverStandingController,
      'getDriverChampionshipResult' | 'getDriverChampionshipResults'
    >
{
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
          sql<
            number | null
          >`CASE WHEN CAST(positionText as INT) > 0               \
            THEN CAST(positionText as INT) ELSE null END`.as('position')
        )
        .where(getSeasonFromIdColumn('sessionId'), '==', season)
        .where('driverId', '==', champResult.driver?.id)
        .$if(round != undefined, (qb) =>
          qb.where(getRoundFromIdColumn('sessionId'), '==', round!)
        )
        .orderBy('position', orderNullsLast('asc'))
        .execute()
    };
  }

  async getDriverChampionshipResults(season: number, round?: number) {
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
            if (
              !b.raceResults[i] ||
              (a.raceResults[i] &&
                (a.raceResults[i].position ?? Infinity) <
                  (b.raceResults[i].position ?? Infinity))
            )
              return -1;
            else if (
              !a.raceResults[i] ||
              (b.raceResults[i] &&
                (a.raceResults[i].position ?? Infinity) >
                  (b.raceResults[i].position ?? Infinity))
            )
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

  async getDriverChampionshipResult(
    season: number,
    driverId: string,
    round?: number
  ) {
    return (await this.getDriverChampionshipResults(season, round)).find(
      (x) => x.driver?.id == driverId
    );
  }
}
