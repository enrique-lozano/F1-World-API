import { Get, Queries, Response, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { SessionEntryQueryParams } from '../../models/query-params';
import { TyreCompound } from '../../models/enums';
import { JsonApiError } from '../../utils/custom-error';
import { StintService } from './stint.service';

export interface StintQueryParams extends SessionEntryQueryParams {
  /** If specified, returns only the stints on this compound */
  compound?: TyreCompound;
}

@Route('stints')
@Tags('Stints')
export class StintController extends CommonController {
  /** Get the stints (sets of tyres) of the drivers based on some optional filters (`season`, `round`, `session`, `driverId`, `constructorId` and `compound`). The results will be returned paginated, sorted by session, driver and stint by default. Only some races have this data */
  @Get('/')
  @Response<JsonApiError>('4XX', 'Client error')
  async get(@Queries() obj: StintQueryParams) {
    return this.tryKyselyExecution(new StintService().get(obj));
  }
}
