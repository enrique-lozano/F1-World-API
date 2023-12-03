import { sql } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Path, Query, Route, Tags } from 'tsoa';
import { DriverDTO } from '../models/types.dto';
import { DbService } from '../services/db.service';
import { DriverService } from './driver.controller';

export interface DriverChampResult {
  driver: DriverDTO | null;

  /** Points that this entrant had for this championship season, in the specified round */
  points: number;

  /** Points that this entrant would have for this championship season, without excluding any result (until 1990, only the best N results count, check https://en.wikipedia.org/wiki/List_of_Formula_One_World_Championship_points_scoring_systems)*/
  totalPoints: number;
}

@Route('championships')
@Tags('Championships')
export class DriverStandingService extends DbService {
  /** Get the driver's world championship results for the specified season
   *
   * @param round If specified, the result obtained will be the championship situation immediately after that round. */ @Get(
    '/{season}/drivers'
  )
  async getDriverChampionshipResults(
    @Path() season: number,
    @Query() round?: number
  ) {
    const results: DriverChampResult[] = (await this.db
      .selectFrom('raceResults')
      .leftJoin('sprintQualifyingResults', (join) =>
        join
          .onRef('raceResults.eventId', '=', 'sprintQualifyingResults.eventId')
          .onRef(
            'raceResults.entrantId',
            '=',
            'sprintQualifyingResults.entrantId'
          )
      )
      .leftJoin('eventEntrants', 'eventEntrants.id', 'raceResults.entrantId')

      .where(sql`cast(substr(raceResults.eventId, 1, 4) as INT)`, '==', season)
      .$if(round != undefined, (qb) =>
        qb.where(
          sql`cast(substr(raceResults.eventId, 6, 7) as INT)`,
          '<=',
          round
        )
      )
      .groupBy('driverId')
      .select(({ fn, eb }) => [
        sql<number>`${fn.sum('raceResults.pointsGained')} + ${fn.coalesce(
          fn.sum('sprintQualifyingResults.points'),
          sql<number>`0`
        )}`.as('points'),
        sql<number>`${fn.sum('raceResults.points')} + ${fn.coalesce(
          fn.sum('sprintQualifyingResults.points'),
          sql<number>`0`
        )}`.as('totalPoints'),
        jsonObjectFrom(
          DriverService.getDriversSelect(
            eb.selectFrom('drivers') as any
          ).whereRef('eventEntrants.driverId', '==', 'drivers.id')
        ).as('driver')
      ])
      .execute()) as DriverChampResult[];

    // Resolve tie on points:
    results.sort((a, b) => {
      if (a.points < b.points) return 1;
      else if (a.points > b.points) return -1;
      else {
        let raceResultQuery =
          'SELECT CASE WHEN CAST(positionText as INT) > 0               \
            THEN CAST(positionText as INT) ELSE null END as position    \
            FROM raceResults LEFT JOIN eventEntrants ON eventEntrants.id = raceResults.entrantId \
            WHERE driverId = :driverId AND cast(substr(eventId, 1, 4) as INT) = :season';

        if (round) {
          raceResultQuery +=
            ' AND cast(substr(eventId, 6, 7) as INT) <= :round';
        }

        const aResults = this.db245
          .prepare(raceResultQuery)
          .all({ driverId: a.driver?.id, season, round })
          .map((x: any) => x.position)
          .filter((x) => x)
          .sort((x, y) => x - y);

        const bResults = this.db245
          .prepare(raceResultQuery)
          .all({ driverId: b.driver?.id, season, round })
          .map((x: any) => x.position)
          .filter((x) => x)
          .sort((x, y) => x - y);

        let i = 0;
        while (aResults.length - 1 >= i || bResults.length - 1 >= i) {
          if (aResults[i] < bResults[i] || !bResults[i]) return -1;
          else if (aResults[i] > bResults[i] || !aResults[i]) return 1;

          i = i + 1;
        }

        return 0;
      }
    });

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
