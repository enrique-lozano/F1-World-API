import { Get, Queries, Response, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { SessionEntrantQueryParams } from '../../models/query-params';
import { JsonApiError } from '../../utils/custom-error';
import { PitStopService } from './pitStop.service';

export interface PitStopQueryParams extends SessionEntrantQueryParams {
  lap?: number;
}

@Route('pit-stops')
@Tags('Pit Stops')
export class PitStopController extends CommonController {
  /** Get pit stops based on some optional filters. The results will be returned paginated */
  @Get('/')
  @Response<JsonApiError>('4XX', 'Client error')
  async get(@Queries() obj: PitStopQueryParams) {
    return this.tryKyselyExecution(new PitStopService().get(obj));
  }
}
