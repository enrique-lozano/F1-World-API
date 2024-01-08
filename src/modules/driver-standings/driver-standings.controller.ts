import { Get, Path, Query, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { DriverDTO } from '../../models/types.dto';
import { DriverStandingService } from './driver-standings.service';

export interface DriverChampResult {
  driver: DriverDTO;

  /** Points that this entrant had for this championship season, in the specified round */
  points: number;

  /** Points that this entrant would have for this championship season, without excluding any result (until 1990, only the best N results count, check https://en.wikipedia.org/wiki/List_of_Formula_One_World_Championship_points_scoring_systems)*/
  totalPoints: number;
}

@Route('championships')
@Tags('Championships')
export class DriverStandingController extends CommonController {
  /** Get the driver's world championship results for the specified season
   *
   * @param round If specified, the result obtained will be the championship situation immediately after that round. */ @Get(
    '/{season}/drivers'
  )
  async getDriverChampionshipResults(
    @Path() season: number,
    @Query() round?: number
  ) {
    return this.tryKyselyExecution(
      new DriverStandingService().getDriverChampionshipResults(season, round)
    );
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
