import { Get, Path, Queries, Res, Route, Tags, TsoaResponse } from 'tsoa';
import { DbService } from '../services/db.service';
import { ErrorMessage } from '../utils/custom-error/custom-error';
import {
  TimedSessionResultQueryParams,
  TimedSessionResultService
} from './common/timedSessionResult.controller';

@Route('free-practices')
@Tags('Free Practices')
export class FreePracticeResultService extends DbService {
  /** Return driver results of a specific practice session based on some filters */ @Get(
    '/{session}/results'
  )
  getSessionsResults(
    @Path() session: 'fp1' | 'fp2' | 'fp3' | 'fp4' | 'warm-up',
    @Queries() filters: TimedSessionResultQueryParams
  ) {
    const sessionTable =
      session == 'warm-up'
        ? `warmingUpResults`
        : (`${session}_results` as const);

    return this.timedSessionResultService.getTimedSessionsResults(
      sessionTable,
      filters
    );
  }

  /** Gets the results of a certain session of free practice
   *
   * @param notFoundResponse Register not found */ @Get(
    '/{session}/results/{eventId}'
  )
  getSessionResults(
    @Path() session: 'fp1' | 'fp2' | 'fp3' | 'fp4' | 'warm-up',
    @Path() eventId: string,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ) {
    const sessionTable =
      session == 'warm-up'
        ? `warmingUpResults`
        : (`${session}_results` as const);

    return this.timedSessionResultService.getTimedSessionResults(
      sessionTable,
      eventId,
      notFoundResponse
    );
  }

  /** Gets info about the result obtained by a driver in a certain session of free practice
   *
   * @param notFoundResponse Register not found */ @Get(
    '/{session}/results/{eventId}/{driverId}'
  )
  getDriverSessionResult(
    @Path() session: 'fp1' | 'fp2' | 'fp3' | 'fp4' | 'warm-up',
    @Path() eventId: string,
    @Path() driverId: string,
    @Res() notFoundResponse: TsoaResponse<404, ErrorMessage<404>>
  ) {
    const sessionTable =
      session == 'warm-up'
        ? `warmingUpResults`
        : (`${session}_results` as const);

    return this.timedSessionResultService.getDriverTimedSessionResult(
      sessionTable,
      eventId,
      driverId,
      notFoundResponse
    );
  }

  private get timedSessionResultService() {
    return new TimedSessionResultService();
  }
}
