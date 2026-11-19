import { Get, Queries, Response, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { SessionQueryParams } from '../../models/query-params';
import { RaceNeutralisationKind } from '../../models/types.dto';
import { JsonApiError } from '../../utils/custom-error';
import { RaceNeutralisationService } from './raceNeutralisation.service';

export interface RaceNeutralisationQueryParams extends SessionQueryParams {
  /** If specified, returns only the neutralisations of this kind */
  kind?: RaceNeutralisationKind;
}

@Route('race-neutralisations')
@Tags('Race neutralisations')
export class RaceNeutralisationController extends CommonController {
  /** Get the interruptions of the pace of the races (safety cars, full-course yellows and red flags) based on some optional filters (`season`, `round`, `session` and `kind`). The results will be returned paginated, sorted by session and order by default */
  @Get('/')
  @Response<JsonApiError>('4XX', 'Client error')
  async get(@Queries() obj: RaceNeutralisationQueryParams) {
    return this.tryKyselyExecution(new RaceNeutralisationService().get(obj));
  }
}
