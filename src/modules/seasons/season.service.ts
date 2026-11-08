import { DbService } from '../../services/db.service';
import { getSeasonFromIdColumn } from '../../utils/f1-sql-common-utils';
import { SeasonController } from './season.controller';

export class SeasonService
  extends DbService
  implements Pick<SeasonController, 'get'>
{
  async get() {
    const res = await this.db
      .selectFrom('events')
      .select(getSeasonFromIdColumn('events.id').as('season'))
      .distinct()
      .orderBy('season', 'asc')
      .execute();

    return res.map((x) => x.season);
  }
}
