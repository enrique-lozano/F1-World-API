import { Get, Path, Queries, Response, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { DriverCareerStats } from '../../models/types.dto';
import { JsonApiError } from '../../utils/custom-error';
import { DriverQueryParams, DriverService } from './driver.service';

@Route('/drivers')
@Tags('Drivers')
export class DriverController extends CommonController {
  /** Get drivers based on some optional filters. The results will be returned paginated, sorted by `fullName` by default.
   *
   * Besides their attributes, the drivers can be sorted by `firstSeason` and `lastSeason` (e.g. `sort=-lastSeason,name`) */
  @Get('/')
  @Response<JsonApiError>('4XX', 'Client error')
  async get(@Queries() obj: DriverQueryParams) {
    return this.tryKyselyExecution(new DriverService().get(obj));
  }

  /** Get a driver by its ID. It includes its `firstSeason` and `lastSeason`
   *
   * @param driverId The ID of the driver to get */
  @Get('{driverId}')
  @Response<JsonApiError>('4XX', 'Client error')
  getById(driverId: string) {
    return this.tryKyselyExecution(new DriverService().getById(driverId));
  }

  /** Get the family relationship of a driver
   *
   * @param driverId The ID of the driver to get its relationship */
  @Get('{driverId}/relationships')
  getDriverFamilyRelationships(driverId: string) {
    return this.tryKyselyExecution(
      new DriverService().getDriverFamilyRelationships(driverId)
    );
  }

  /** Get the seasons where a specific driver has participated in at least one race (main or sprint race result), in ascending order.
   *
   * Note that `firstSeason` and `lastSeason` of the driver also take into account the qualifying and free practice results, so they can be outside this list for the drivers that did not qualify for some races
   *
   * @param driverId The ID of the driver to get */
  @Get('{driverId}/seasons')
  async getDriverSeasons(@Path() driverId: string) {
    return this.tryKyselyExecution(
      new DriverService().getDriverSeasons(driverId)
    );
  }

  /** Get the career statistics of a driver. Only the main races (session `R`) are taken into account, except for the points:
   *
   * - `races`: races with at least one race result entry of the driver, classified or not (including `DNS`, `DNQ` and `WD`).
   * - `starts`: races with at least one result different from `DNS`, `DNQ` and `WD`.
   * - `wins`: races finished in the first position (`positionText` = `1`). Sprint races are not counted.
   * - `podiums`: podium positions (`positionText` = `1`, `2` or `3`) obtained. Disqualified results are not podiums.
   * - `poles`: races started from the first position of the grid (`gridPosition` = `1` in the race results), which may differ from the qualifying result if there were grid penalties.
   * - `fastestLaps`: races in which the driver set the fastest lap of the race (minimum lap time of the session). Only available for the races with lap times (1996 onwards).
   * - `points`: sum of the points of all the race results (main and sprint races), including the results dropped from the championship.
   * - `championships`: seasons finished in the first position of the drivers' standings (see `/championships/{season}/drivers`). A season in progress is counted if the driver leads it.
   *
   * @param driverId The ID of the driver to get its statistics
   * @example driverId "fernando-alonso"
   */
  @Get('{driverId}/stats')
  @Response<JsonApiError>('4XX', 'Client error')
  async getDriverStats(@Path() driverId: string): Promise<DriverCareerStats> {
    return this.tryKyselyExecution(
      new DriverService().getDriverStats(driverId)
    );
  }

  /** Get WDC results of this driver: its position and points in the drivers' standings of every season in which it participated in at least one race
   *
   * @param driverId The ID of the driver to get its results */
  @Get('{driverId}/championship-results')
  async getChampionshipResults(@Path() driverId: string) {
    return this.tryKyselyExecution(
      new DriverService().getChampionshipResults(driverId)
    );
  }
}
