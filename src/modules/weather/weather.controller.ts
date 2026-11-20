import { Get, Queries, Response, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { SessionQueryParams } from '../../models/query-params';
import { Weather } from '../../models/enums';
import { JsonApiError } from '../../utils/custom-error';
import { WeatherService } from './weather.service';

export interface WeatherQueryParams extends SessionQueryParams {
  /** If specified, returns only the periods with this weather */
  weather?: Weather;
}

@Route('weather')
@Tags('Weather')
export class WeatherController extends CommonController {
  /** Get the weather of the sessions based on some optional filters (`season`, `round`, `session` and `weather`). Each session has a base period (`lapStart` 1) with the weather at the start of the race, and more periods only when it changed. The results will be returned paginated, sorted by session and lap by default */
  @Get('/')
  @Response<JsonApiError>('4XX', 'Client error')
  async get(@Queries() obj: WeatherQueryParams) {
    return this.tryKyselyExecution(new WeatherService().get(obj));
  }
}
