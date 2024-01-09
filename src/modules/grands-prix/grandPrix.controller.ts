import { Get, Path, Queries, Response, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { PageQueryParams } from '../../models/pagination';
import { JsonApiError } from '../../utils/custom-error';
import { GrandPrixService } from './grandPrix.service';

export interface GrandPrixQueryParams extends PageQueryParams {
  /** Filter drivers by its full name */
  name?: string;

  /** Filter drivers by its nationality */
  countryId?: string;
}

@Route('/grands-prix')
@Tags('Grands Prix')
export class GrandPrixController extends CommonController {
  /** Get grands prix based on some optional filters. The results will be returned paginated */
  @Get('/')
  @Response<JsonApiError>('4XX', 'Client error')
  async get(@Queries() obj: GrandPrixQueryParams) {
    return this.tryKyselyExecution(new GrandPrixService().get(obj));
  }

  /** Get a grandPrix by its ID
   *
   * @param id The ID of the grandPrix to get */
  @Get('{id}')
  @Response<JsonApiError>('4XX', 'Client error')
  getById(@Path() id: string) {
    return this.tryKyselyExecution(new GrandPrixService().getById(id));
  }
}
