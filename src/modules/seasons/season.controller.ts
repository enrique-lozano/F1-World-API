import { Get, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { SeasonService } from './season.service';

@Route('/seasons')
@Tags('Seasons')
export class SeasonController extends CommonController {
  /** Get the seasons (years) that have at least one event, in ascending order
   *
   * @example response [1950, 1951, 1952]
   */
  @Get('/')
  async get(): Promise<number[]> {
    return this.tryKyselyExecution(new SeasonService().get());
  }
}
