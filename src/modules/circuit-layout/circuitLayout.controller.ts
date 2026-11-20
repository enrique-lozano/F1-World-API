import { Get, Path, Produces, Queries, Response, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { IncludeQueryParam } from '../../models/include-filter';
import { CommonQueryParams } from '../../models/query-params';
import { CircuitLayoutDTO, CircuitLayoutGeometry } from '../../models/dto';
import { JsonApiError } from '../../utils/custom-error';
import { CircuitLayoutService } from './circuitLayout.service';

export interface CircuitLayoutQueryParams extends CommonQueryParams {
  /** If specified, returns only the layouts of this circuit */
  circuitId?: string;
}

@Route('circuit-layouts')
@Tags('Circuit layouts')
export class CircuitLayoutController extends CommonController {
  /** Get circuit layouts based on some optional filters. The results will be returned paginated.
   *
   * A circuit layout is one configuration of a circuit: a new one exists whenever the race lap changes (its length or its corner sequence). They are sorted by `id` by default, which keeps the layouts of a circuit in chronological order
   */
  @Get('/')
  @Response<JsonApiError>('4XX', 'Client error')
  async get(@Queries() obj: CircuitLayoutQueryParams) {
    return this.tryKyselyExecution(new CircuitLayoutService().get(obj));
  }

  /** Get a circuit layout by its ID
   *
   * @param id The ID of the circuit layout to get (e.g. `silverstone-2010`)
   * */
  @Get('/{id}')
  @Response<JsonApiError>('4XX', 'Client error')
  getById(
    id: string,
    @Queries() fields: IncludeQueryParam
  ): Promise<CircuitLayoutDTO | undefined> {
    return this.tryKyselyExecution(
      new CircuitLayoutService().getById(id, fields)
    );
  }

  /** Get the shape of a circuit layout as GeoJSON (`application/geo+json`, WGS84 `[longitude, latitude]` points): a closed `track` and, when known, the `pit-lane`. The `track` goes in the direction of the race (`direction` of the layout) when the layout has one. Only the layouts with `hasGeometry` have it, the rest return a 404. It does not change often, so it is cached for a day
   *
   * @param id The ID of the circuit layout (e.g. `silverstone-2010`)
   */
  @Get('/{id}/geometry')
  @Produces('application/geo+json')
  @Response<JsonApiError>('4XX', 'Client error')
  async getGeometry(@Path() id: string): Promise<CircuitLayoutGeometry> {
    const geometry = await this.tryKyselyExecution(
      new CircuitLayoutService().getGeometry(id)
    );

    this.setHeader('Content-Type', 'application/geo+json; charset=utf-8');
    this.setHeader('Cache-Control', 'public, max-age=86400');

    return geometry;
  }
}
