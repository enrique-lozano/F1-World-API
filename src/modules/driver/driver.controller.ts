import { Get, Path, Queries, Response, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { JsonApiError } from '../../utils/custom-error';
import { DriverQueryParams, DriverService } from './driver.service';

@Route('/drivers')
@Tags('Drivers')
export class DriverController extends CommonController {
  /** Get drivers based on some optional filters. The results will be returned paginated */
  @Get('/')
  @Response<JsonApiError>('4XX', 'Client error')
  async get(@Queries() obj: DriverQueryParams) {
    return this.tryKyselyExecution(new DriverService().get(obj));
  }

  /** Get a driver by its ID
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

  /** Get the seasons where a specific driver has participated in at least one race or event
   *
   * @param driverId The ID of the driver to get */
  @Get('{driverId}/seasons')
  async getDriverSeasons(@Path() driverId: string) {
    return this.tryKyselyExecution(
      new DriverService().getDriverSeasons(driverId)
    );
  }

  /** Get WDC results of this driver */
  @Get('{driverId}/championship-results')
  async getChampionshipResults(@Path() driverId: string) {
    return this.tryKyselyExecution(
      new DriverService().getChampionshipResults(driverId)
    );
  }
}
