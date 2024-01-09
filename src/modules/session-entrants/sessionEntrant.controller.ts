import { Get, Queries, Response, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { JsonApiError } from '../../utils/custom-error';
import {
  EntrantQueryParam,
  SessionEntrantService
} from './sessionEntrant.service';

@Route('/session-entrants')
@Tags('Session entrants')
export class SessionEntrantController extends CommonController {
  /** Get entrants based on some filters. The return data will be paginated */
  @Get('/')
  @Response<JsonApiError>('4XX', 'Client error')
  get(@Queries() obj: EntrantQueryParam) {
    return this.tryKyselyExecution(new SessionEntrantService().get(obj));
  }
}
