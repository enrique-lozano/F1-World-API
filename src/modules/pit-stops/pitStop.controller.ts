import { Get, Queries, Response, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { SessionEntrantQueryParams } from '../../models/query-params';
import { JsonApiError } from '../../utils/custom-error';
import { PitStopService } from './pitStop.service';

export interface PitStopQueryParams extends SessionEntrantQueryParams {
  /** If specified, returns only the pit stops made in this lap
   *
   * @isInt The `lap` param should be an integer
   */
  lap?: number;
}

@Route('pit-stops')
@Tags('Pit Stops')
export class PitStopController extends CommonController {
  /** Get pit stops based on some optional filters (`season`, `round`, `session`, `driverId` and `lap`). The results will be returned paginated, sorted by session and lap by default */
  @Get('/')
  @Response<JsonApiError>('4XX', 'Client error')
  async get(@Queries() obj: PitStopQueryParams) {
    return this.tryKyselyExecution(new PitStopService().get(obj));
  }
}
