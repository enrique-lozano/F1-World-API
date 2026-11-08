import { Get, Path, Queries, Response, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { IncludeQueryParam } from '../../models/include-filter';
import { CommonQueryParams } from '../../models/query-params';
import { CareerStats, ConstructorDTO } from '../../models/types.dto';
import { JsonApiError } from '../../utils/custom-error';
import { ConstructorService } from './constructor.service';

export interface ConstructorQueryParams extends CommonQueryParams {
  /** If specified, returns only the constructors whose name or full name contains this value (case-insensitive) */
  name?: string;

  /** If specified, returns only the constructors of this country (alpha-2 code, e.g. `GB`) */
  countryId?: string;
}

/**
 * A constructor is the company that builds the chassis of a car. The cars of a constructor are the session entrants whose `chassisManufacturer` is the constructor (`chassisManufacturerId` = constructor `id`).
 */
@Route('/constructors')
@Tags('Constructors')
export class ConstructorController extends CommonController {
  /** Get constructors based on some optional filters. The results will be returned paginated, sorted by `name` by default.
   *
   * Besides their attributes, the constructors can be sorted by `firstSeason` and `lastSeason` (e.g. `sort=-lastSeason,name`) */
  @Get('/')
  @Response<JsonApiError>('4XX', 'Client error')
  async get(@Queries() obj: ConstructorQueryParams) {
    return this.tryKyselyExecution(new ConstructorService().get(obj));
  }

  /** Get a constructor by its ID
   *
   * @param id The ID of the constructor to get
   * @example id "ferrari"
   */
  @Get('{id}')
  @Response<JsonApiError>('4XX', 'Client error')
  async getById(
    @Path() id: string,
    @Queries() fields: IncludeQueryParam
  ): Promise<ConstructorDTO> {
    return this.tryKyselyExecution(
      new ConstructorService().getById(id, fields)
    );
  }

  /** Get the seasons in which a constructor had at least one entry (one of its cars appears in the results of a race, qualifying or free practice session), in ascending order
   *
   * @param id The ID of the constructor
   * @example id "ferrari"
   */
  @Get('{id}/seasons')
  @Response<JsonApiError>('4XX', 'Client error')
  async getConstructorSeasons(@Path() id: string): Promise<number[]> {
    return this.tryKyselyExecution(
      new ConstructorService().getConstructorSeasons(id)
    );
  }

  /** Get the career statistics of a constructor, calculated from the results of all its cars. Only the main races (session `R`) are taken into account, except for the points:
   *
   * - `races`: races with at least one race result entry of its cars, classified or not (including `DNS`, `DNQ` and `WD`).
   * - `starts`: races with at least one result of its cars different from `DNS`, `DNQ` and `WD`.
   * - `wins`: races won by one of its cars (`positionText` = `1`). Sprint races are not counted.
   * - `podiums`: podium positions (`positionText` = `1`, `2` or `3`) obtained by its cars. A race with two of its cars on the podium counts twice. Disqualified results are not podiums.
   * - `poles`: races in which one of its cars started from the first position of the grid (`gridPosition` = `1` in the race results), which may differ from the qualifying result if there were grid penalties.
   * - `fastestLaps`: races in which one of its cars set the fastest lap of the race (minimum lap time of the session). Only available for the races with lap times (1996 onwards).
   * - `points`: sum of the points of all the race results of its drivers (main and sprint races). Note that this is NOT the number of points of the constructors' championship, which have different rules (e.g. until 1979 only the best placed car of each constructor scored).
   *
   * @param id The ID of the constructor
   * @example id "ferrari"
   */
  @Get('{id}/stats')
  @Response<JsonApiError>('4XX', 'Client error')
  async getConstructorStats(@Path() id: string): Promise<CareerStats> {
    return this.tryKyselyExecution(
      new ConstructorService().getConstructorStats(id)
    );
  }
}
