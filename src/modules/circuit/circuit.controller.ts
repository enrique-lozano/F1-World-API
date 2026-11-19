import { Get, Path, Queries, Response, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { IncludeQueryParam } from '../../models/include-filter';
import { CommonQueryParams } from '../../models/query-params';
import { CircuitDTO, CircuitRecordsDTO } from '../../models/types.dto';
import { JsonApiError } from '../../utils/custom-error';
import { CircuitRecordEntity, CircuitService } from './circuit.service';

export interface CircuitQueryParams extends CommonQueryParams {
  /** If specified, returns only the circuits whose name, full name or place contains this value (case-insensitive). Useful to search circuits */
  name?: string;

  /** If specified, returns only the circuits of this country (alpha-2 code, e.g. `GB`) */
  countryId?: string;
}

export interface CircuitRecordsQueryParams {
  /** Who to rank: the drivers, the teams (`entrant`) or the chassis constructors
   *
   * @default "driver"
   */
  by?: CircuitRecordEntity;

  /** How many holders to return for each record
   *
   * @minimum 1 The minimum value of `limit` should be 1
   * @maximum 10 The maximum value of `limit` should be 10
   * @isInt The `limit` param should be an integer
   * @default 3
   */
  limit?: number;
}

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
  getById(
    id: string,
    @Queries() fields: IncludeQueryParam
  ): Promise<CircuitDTO | undefined> {
    return this.tryKyselyExecution(new CircuitService().getById(id, fields));
  }

  /** Get who has more wins, poles, podiums, fastest laps and points in the races held in a circuit, whatever the layout. The fastest laps only count the races with lap times (1996 onwards)
   *
   * @param id The ID of the circuit
   * */
  @Get('/{id}/records')
  @Response<JsonApiError>('4XX', 'Client error')
  getRecords(
    @Path() id: string,
    @Queries() query: CircuitRecordsQueryParams
  ): Promise<CircuitRecordsDTO> {
    return this.tryKyselyExecution(new CircuitService().getRecords(id, query));
  }
}
