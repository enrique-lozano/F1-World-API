import { Get, Path, Queries, Res, Route, Tags, TsoaResponse } from 'tsoa';
import { DbService } from '../services/db.service';
import { ErrorMessage } from '../utils/custom-error/custom-error';
import {
  TimedSessionResultQueryParams,
  TimedSessionResultService
} from './timedSessionResult.controller';

@Route('pre-qualifyings')
@Tags('Pre-Qualifying')
export class PreQualifyingResultService extends DbService {
  private readonly table = 'preQualifyingResults';

  /** Return driver results of a specific pre-qualifying session based on some filters */ @Get(
    '/results'
  )
  getPreQualifyingsResults(@Queries() filters: TimedSessionResultQueryParams) {
    return this.timedSessionResultService.getTimedSessionsResults(
      this.table,
      filters
    );
  }

  /** Gets the results of a certain pre-qualifying
   *
   * @param notFoundResponse Register not found */ @Get('/results/{eventId}')
  getSessionResults(
    @Path() eventId: string,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ) {
    return this.timedSessionResultService.getTimedSessionResults(
      this.table,
      eventId,
      notFoundResponse
    );
  }

  /** Gets info about the result obtained by a driver in a pre-qualifying session
   *
   * @param notFoundResponse Register not found */ @Get(
    '/results/{eventId}/{driverId}'
  )
  getDriverSessionResult(
    @Path() eventId: string,
    @Path() driverId: string,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ) {
    return this.timedSessionResultService.getDriverTimedSessionResult(
      this.table,
      eventId,
      driverId,
      notFoundResponse
    );
  }

  private get timedSessionResultService() {
    return new TimedSessionResultService();
  }
}
