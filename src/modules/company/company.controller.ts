import { Get, Queries, Response, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { CommonQueryParams } from '../../models/query-params';
import { JsonApiError } from '../../utils/custom-error';
import { CompanyService } from './company.service';

export interface CompanyQueryParams extends CommonQueryParams {
  // TODO:
  /** Return only the companies that has manufactured in this specialty */
  // specialty?: 'engine' | 'chassis';

  name?: string;
}

@Route('/companies')
@Tags('Companies')
export class CompanyController extends CommonController {
  /** Get companies based on some optional filters. The results will be returned paginated */
  @Get('/')
  @Response<JsonApiError>('4XX', 'Client error')
  async get(@Queries() obj: CompanyQueryParams) {
    return this.tryKyselyExecution(new CompanyService().get(obj));
  }

  /** Get a company by its ID
   *
   * @param companyId The ID of the company to get
   *  */
  @Get('{id}')
  @Response<JsonApiError>('4XX', 'Client error')
  async getById(id: string) {
    return this.tryKyselyExecution(new CompanyService().getById(id));
  }
}
