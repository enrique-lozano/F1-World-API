import { Get, Path, Query, Response, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { JsonApiError } from '../../utils/custom-error';
import { CountryService } from './countries.service';

@Route('/countries')
@Tags('Countries')
export class CountryController extends CommonController {
  /** Get all the countries
   *
   * @param locale Language of the country names, as a BCP 47 tag (`en`, `es`, `pt-BR`...). Defaults to `en`. Also supported by any other endpoint that returns countries */
  @Get('/')
  @Response<JsonApiError>('4XX', 'Client error')
  // `locale` is applied by the middleware of app.ts, it's declared here for the docs/validation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  get(@Query() locale?: string) {
    return this.tryKyselyExecution(new CountryService().get());
  }

  /** Get a country by its ID
   *
   * @param countryId The ID of the country to get
   * @param locale Language of the country name, as a BCP 47 tag (`en`, `es`, `pt-BR`...). Defaults to `en` */
  @Get('{countryId}')
  @Response<JsonApiError>('4XX', 'Client error')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getById(@Path() countryId: string, @Query() locale?: string) {
    return this.tryKyselyExecution(new CountryService().getById(countryId));
  }
}
