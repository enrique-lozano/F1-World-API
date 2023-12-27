import { Get, Queries, Response, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { CommonQueryParams } from '../../models/query-params';
import { CircuitDTO } from '../../models/types.dto';
import { JsonApiError } from '../../utils/custom-error';
import { CircuitService } from './circuit.service';

export interface CircuitQueryParams extends CommonQueryParams {}

@Route('circuits')
@Tags('Circuits')
export class CircuitController extends CommonController {
  /** Get circuits based on some optional filters. The results will be returned paginated */
  @Get('/')
  @Response<JsonApiError>('4XX', 'Client error')
  async get(@Queries() obj: CircuitQueryParams) {
    return this.tryKyselyExecution(new CircuitService().get(obj));
  }

  /** Get a circuit by its ID
   *
   * @param id The ID of the circuit to get
   * */
  @Get('/{id}')
  @Response<JsonApiError>('4XX', 'Client error')
  getById(id: string): Promise<CircuitDTO | undefined> {
    return this.tryKyselyExecution(new CircuitService().getById(id));
  }
}
