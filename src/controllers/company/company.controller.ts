import { Get, Queries, Response, Route, Tags } from 'tsoa';
import { IncludeQueryParam } from '../../models/fields-filter';
import { PageQueryParams } from '../../models/paginated-items';
import { SorterQueryParams } from '../../models/sorter';
import { CommonController } from '../../services/common.controller';
import { JsonApiError } from '../../utils/custom-error';
import { CompanyService } from './company.service';

export interface CompanyQueryParams
  extends PageQueryParams,
    SorterQueryParams,
    IncludeQueryParam {
  // TODO:
  /** Return only the companies that has manufactured in this specialty */
  // specialty?: 'engine' | 'chassis';

  name?: string;
}

@Route('/companies')
@Tags('Companies')
export class CompanyController extends CommonController {
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
