import { Get, Path, Response, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { JsonApiError } from '../../utils/custom-error';
import { CountryService } from './countries.service';

@Route('/countries')
@Tags('Countries')
export class CountryController extends CommonController {
  /** Get countries based on some optional filters. The results will be returned paginated */
  @Get('/')
  @Response<JsonApiError>('4XX', 'Client error')
  get() {
    return this.tryKyselyExecution(new CountryService().get());
  }

  /** Get a country by its ID
   *
   * @param countryId The ID of the country to get */
  @Get('{countryId}')
  @Response<JsonApiError>('4XX', 'Client error')
  async getById(@Path() countryId: string) {
    return this.tryKyselyExecution(new CountryService().getById(countryId));
  }
}
