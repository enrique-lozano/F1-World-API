import { Get, Path, Queries, Response, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { IncludeQueryParam } from '../../models/include-filter';
import { CommonQueryParams } from '../../models/query-params';
import { JsonApiError } from '../../utils/custom-error';
import { EventService } from './event.service';

export interface EventQueryParams extends CommonQueryParams {
  circuitId?: string;
}

@Route('/events')
@Tags('Events')
export class EventController extends CommonController {
  /** Get events based on some optional filters. The results will be returned paginated */
  @Get('/')
  @Response<JsonApiError>('4XX', 'Client error')
  async get(@Queries() obj: EventQueryParams) {
    return this.tryKyselyExecution(new EventService().get(obj));
  }

  /** Get a event by its season and its round */
  @Get('{season}/{round}')
  @Response<JsonApiError>('4XX', 'Client error')
  getById(
    @Path() season: number,
    @Path() round: number,
    @Queries() fields: IncludeQueryParam
  ) {
    return this.tryKyselyExecution(
      new EventService().getById(season, round, fields)
    );
  }
}
