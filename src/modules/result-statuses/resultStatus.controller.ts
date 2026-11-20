import { sql } from 'kysely';
import { Get, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { ResultStatuses } from '../../models/db';
import { DbService } from '../../services/db.service';

@Route('/result-statuses')
@Tags('Races')
export class ResultStatusController extends CommonController {
  /** The codes that a race result can have instead of a finishing position (`positionText`), see `ResultStatusCode`. Every driver entered for a race has a result in it */
  @Get('/')
  async get(): Promise<ResultStatuses[]> {
    return this.tryKyselyExecution(
      new DbService().db
        .selectFrom('resultStatuses')
        .selectAll()
        .orderBy(sql`rowid`)
        .execute()
    );
  }
}
