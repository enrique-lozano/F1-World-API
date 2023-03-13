import { Get, Path, Query, Route, Tags } from 'tsoa';
import { parseSearchQueryParams } from '../utils/objAttributesToStr';
import { DbService } from './db.service';
import { DriverService } from './driver.service';
import { RaceResultService } from './raceResult.service';

@Route('championships')
@Tags('Championships')
export class DriverStandingService extends DbService {
  /** Get the driver's world championship results for the specified season
   *
   * @param round If specified, the result obtained will be the championship situation immediately after that round. */ @Get(
    '/{season}/drivers'
  )
  getDriverChampionshipResults(
    @Path() season: number,
    @Query() round?: number
  ) {
    const params = parseSearchQueryParams({ season, round });

    let whereStatement = ' WHERE CAST (substr(eventId, 1, 4) AS INT) = :season';

    if (params.round)
      whereStatement += ' AND CAST (substr(eventId, 6, 7) AS INT) <= :round';

    const results = this.db
      .prepare(
        'SELECT driverId, \
            (SUM(raceResults.pointsGained) + SUM(racesSprintQualifyingResults.points) ) AS points, \
            (SUM(raceResults.points) + SUM(racesSprintQualifyingResults.points) ) AS totalPoints \
          FROM raceResults LEFT JOIN               \
            racesSprintQualifyingResults USING (   \
                eventId,                           \
                driverId)' +
          `${whereStatement} GROUP BY driverId ORDER BY points DESC`
      )
      .all(params) as [
      {
        driverId: string;
        points: number;
        totalPoints: number;
      }
    ];

    // Resolve tie on points:
    results.sort((a, b) => {
      if (a.points < b.points) return 1;
      else if (a.points > b.points) return -1;
      else {
        let raceResultQuery =
          'SELECT CASE WHEN CAST(positionText as INT) > 0               \
            THEN CAST(positionText as INT) ELSE null END as position    \
            FROM raceResults WHERE driverId = :driverId AND cast(substr(eventId, 1, 4) as INT) = :season';

        if (round) {
          raceResultQuery +=
            ' AND cast(substr(eventId, 6, 7) as INT) <= :round';
        }

        const aResults = this.db
          .prepare(raceResultQuery)
          .all({ driverId: a.driverId, season, round })
          .map((x) => x.position)
          .filter((x) => x)
          .sort((x, y) => x - y);

        const bResults = this.db
          .prepare(raceResultQuery)
          .all({ driverId: b.driverId, season, round })
          .map((x) => x.position)
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
        driver: this.driverService.getById(x.driverId),
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
  getDriverChampionshipResult(
    @Path() season: number,
    @Path() driverId: string,
    @Query() round?: number
  ) {
    return this.getDriverChampionshipResults(season, round).find(
      (x) => x.driver.id == driverId
    );
  }

  private get driverService() {
    return new DriverService();
  }

  private get raceResultService() {
    return new RaceResultService();
  }
}
