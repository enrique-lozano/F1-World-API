import { Get, Queries, Response, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { SessionEntrantQueryParams } from '../../models/query-params';
import { JsonApiError } from '../../utils/custom-error';
import { LapService } from './lap.service';

export interface LapQueryParams extends SessionEntrantQueryParams {
  pos?: number;
  lap?: number;
}

@Route('laps')
@Tags('Laps')
export class LapController extends CommonController {
  /** Get lap times based on some optional filters. The results will be returned paginated */
  @Get('')
  @Response<JsonApiError>('4XX', 'Client error')
  async getLaps(@Queries() obj: LapQueryParams) {
    return this.tryKyselyExecution(new LapService().getLaps(obj));
  }

  /** Get the fastest lap times grouped by session, based on some filters.
   *
   * Please take into account that this call return only the global fastest laps inside a session. For example if we filter here by the driver Fernando Alonso, we will get only the sessions where he score the fastest lap */
  @Get('/fastest')
  @Response<JsonApiError>('4XX', 'Client error')
  async getFastestLaps(@Queries() obj: LapQueryParams) {
    return this.tryKyselyExecution(new LapService().getFastestLaps(obj));
  }
}
