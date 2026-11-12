import { Get, Path, Queries, Response, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { IncludeQueryParam } from '../../models/include-filter';
import { CommonQueryParams } from '../../models/query-params';
import {
  EntrantDTO,
  EntrantLineage,
  EntrantNameUsage,
  EntrantSeasonDTO
} from '../../models/types.dto';
import { JsonApiError } from '../../utils/custom-error';
import { EntrantService } from './entrant.service';

export interface EntrantQueryParams extends CommonQueryParams {
  /** If specified, returns only the entrants whose name contains this value (case-insensitive) */
  name?: string;

  /** If specified, returns only the entrants that had at least one entry in this season */
  season?: number;
}

/**
 * An entrant is who registers a car and a driver and runs it over the race weekend, commonly called the "team" (Scuderia Ferrari, Tyrrell Racing Organisation...). Its identity holds for the whole history, whatever the sponsor name, the chassis or the engine. When a team is sold or renamed, the new owner is a new entrant linked to the previous one (see `/entrants/{id}/lineage`).
 *
 * Do not confuse it with a constructor, which is who designs the chassis (see `/constructors`).
 */
@Route('/entrants')
@Tags('Entrants')
export class EntrantController extends CommonController {
  /** Get entrants based on some optional filters. The results will be returned paginated, sorted by `name` by default.
   *
   * Besides their attributes, the entrants can be sorted by `firstSeason` and `lastSeason` (e.g. `sort=-lastSeason,name`) */
  @Get('/')
  @Response<JsonApiError>('4XX', 'Client error')
  async get(@Queries() obj: EntrantQueryParams) {
    return this.tryKyselyExecution(new EntrantService().get(obj));
  }

  /** Get an entrant by its ID
   *
   * @param id The ID of the entrant to get
   * @example id "tyrrell-racing"
   */
  @Get('{id}')
  @Response<JsonApiError>('4XX', 'Client error')
  async getById(
    @Path() id: string,
    @Queries() fields: IncludeQueryParam
  ): Promise<EntrantDTO> {
    return this.tryKyselyExecution(new EntrantService().getById(id, fields));
  }

  /** Get the seasons of an entrant, in ascending order. Each season says if the entrant built its own chassis (`WORKS`, with its `ownConstructor`) or used the chassis of others (`CUSTOMER`), and the nationality of its licence that year
   *
   * @param id The ID of the entrant
   * @example id "tyrrell-racing"
   */
  @Get('{id}/seasons')
  @Response<JsonApiError>('4XX', 'Client error')
  async getSeasons(
    @Path() id: string,
    @Queries() fields: IncludeQueryParam
  ): Promise<EntrantSeasonDTO[]> {
    return this.tryKyselyExecution(new EntrantService().getSeasons(id, fields));
  }

  /** Get the registered names (sponsors included) that the entrant used, with the ranges of seasons in which each one was used, e.g. `Scuderia Ferrari` 1950-1960, 1990-1996 and 2011-2024. The names are sorted by their first use
   *
   * @param id The ID of the entrant
   * @example id "scuderia-ferrari"
   */
  @Get('{id}/names')
  @Response<JsonApiError>('4XX', 'Client error')
  async getNames(@Path() id: string): Promise<EntrantNameUsage[]> {
    return this.tryKyselyExecution(new EntrantService().getNames(id));
  }

  /** Get the predecessors and successors of an entrant: when a team is sold or renamed, the new entrant is linked to the previous one. E.g. Tyrrell -> BAR -> Honda -> Brawn GP -> Mercedes
   *
   * @param id The ID of the entrant
   * @example id "tyrrell-racing"
   */
  @Get('{id}/lineage')
  @Response<JsonApiError>('4XX', 'Client error')
  async getLineage(@Path() id: string): Promise<EntrantLineage> {
    return this.tryKyselyExecution(new EntrantService().getLineage(id));
  }
}
