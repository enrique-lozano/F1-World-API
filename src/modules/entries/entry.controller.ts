import { Get, Queries, Response, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { CommonQueryParams } from '../../models/query-params';
import { JsonApiError } from '../../utils/custom-error';
import { EntryService } from './entry.service';

export interface EntryQueryParams extends CommonQueryParams {
  /** Return only the entries of this season */
  season?: number;

  /** Return only the entries of this driver */
  driverId?: string;

  /** Return only the entries of this entrant (team), e.g. `scuderia-ferrari` */
  entrantId?: string;

  /** Return only the entries whose chassis was designed by this constructor, e.g. `tyrrell` */
  constructorId?: string;
}

/**
 * An entry is a driver in a car configuration: with a number, a registered entrant name, a chassis, an engine and some tyres. The results of any session (races, qualifyings, free practices, laps and pit stops) refer to an entry. Any change of number, name, chassis, engine or tyres is a new entry.
 */
@Route('/entries')
@Tags('Entries')
export class EntryController extends CommonController {
  /** Get entries based on some filters. The return data will be paginated */
  @Get('/')
  @Response<JsonApiError>('4XX', 'Client error')
  get(@Queries() obj: EntryQueryParams) {
    return this.tryKyselyExecution(new EntryService().get(obj));
  }
}
