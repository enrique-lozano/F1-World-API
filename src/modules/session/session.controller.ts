import { Get, Path, Queries, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { IncludeQueryParam } from '../../models/include-filter';
import { PageQueryParams } from '../../models/pagination';
import { LapService } from '../laps/lap.service';
import { PitStopService } from '../pit-stops/pitStop.service';
import { SessionService } from './session.service';

@Route('/sessions')
@Tags('Sessions')
export class SessionController extends CommonController {
  /** Get a the sessions of a round or event */
  @Get('/{season}/{round}')
  getByEvent(@Path() season: number, @Path() round: number) {
    return this.tryKyselyExecution(
      new SessionService().getByEvent(season, round)
    );
  }

  /** Get a session */
  @Get('/{season}/{round}/{session}')
  getById(
    @Path() season: number,
    @Path() round: number,
    @Path() session: string
  ) {
    return this.tryKyselyExecution(
      new SessionService().getById(season, round, session)
    );
  }

  /** Get the results of a session session */
  @Get('/{season}/{round}/{session}/results')
  getSessionResults(
    @Path() season: number,
    @Path() round: number,
    @Path() session: string,
    @Queries() fields: IncludeQueryParam
  ) {
    return this.tryKyselyExecution(
      new SessionService().getSessionResults(season, round, session, fields)
    );
  }

  /** Get info about all the pit stops in this session */
  @Get('/{season}/{round}/{session}/pit-stops')
  getSessionPitStops(
    @Path() season: number,
    @Path() round: number,
    @Path() session: string,
    @Queries() obj: PageQueryParams
  ) {
    return this.tryKyselyExecution(
      new PitStopService().get({ round, season, session, ...obj })
    );
  }

  /** Get info about all the laps in this session */
  @Get('/{season}/{round}/{session}/laps')
  getSessionLaps(
    @Path() season: number,
    @Path() round: number,
    @Path() session: string,
    @Queries() obj: PageQueryParams
  ) {
    return this.tryKyselyExecution(
      new LapService().getLaps({ round, season, session, ...obj })
    );
  }

  /** Get info about the fastest lap of this session */
  @Get('/{season}/{round}/{session}/fastest-lap')
  async getSessionFastestLap(
    @Path() season: number,
    @Path() round: number,
    @Path() session: string
  ) {
    return this.tryKyselyExecution(
      new SessionService().getSessionFastestLap(season, round, session)
    );
  }
}
