import { HttpException } from '../../utils/custom-error';
import { SelectQueryBuilder, sql } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam, IncludeQueryParam } from '../../models/include-filter';
import { PageMetadata, Paginator } from '../../models/pagination';
import { Sorter } from '../../models/sorter';
import { DB, EventDTO, EventEntryDTO, Events } from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import {
  getRoundFromIdColumn,
  getSeasonFromIdColumn
} from '../../utils/f1-sql-common-utils';
import { CircuitService } from '../circuit/circuit.service';
import { EntryService } from '../entries/entry.service';
import { GrandPrixService } from '../grands-prix/grandPrix.service';
import { EventController, EventQueryParams } from './event.controller';

export class EventService
  extends DbService
  implements Pick<EventController, 'get' | 'getById' | 'getEntries'>
{
  static getEventSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'events', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = [
      'id',
      'name',
      'posterURL',
      'qualyFormat',
      'scheduledLaps'
    ] as const;

    return (qb as SelectQueryBuilder<DB, 'events', object>)
      .select(
        fieldsParam.getFilteredFieldsArrayWithPrefix(allSingleFields, 'events.')
      )
      .$if(fieldsParam.shouldSelectKey('season'), (qb) =>
        qb.select(getSeasonFromIdColumn('events.id').as('season'))
      )
      .$if(fieldsParam.shouldSelectKey('round'), (qb) =>
        qb.select(getRoundFromIdColumn('events.id').as('round'))
      )
      .$if(fieldsParam.shouldSelectObject('grandPrix'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            GrandPrixService.getGrandPrixSelect(
              eb.selectFrom('grandsPrix'),
              fieldsParam?.clone('grandPrix')
            ).whereRef('events.grandPrixId', '==', 'grandsPrix.id')
          ).as('grandPrix')
        )
      )
      .$if(fieldsParam.shouldSelectObject('circuit'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            CircuitService.getCircuitsSelect(
              eb.selectFrom('circuits'),
              fieldsParam?.clone('circuit')
            ).whereRef('events.circuitId', '==', 'circuits.id')
          ).as('circuit')
        )
      ) as SelectQueryBuilder<DB, 'events' | T, EventDTO>;
  }

  async get(
    obj: EventQueryParams
  ): Promise<PageMetadata & { data: EventDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<Events>(obj.sort || 'id');

    const mainSelect = this.db
      .selectFrom('events')
      .$if(obj.circuitId != undefined, (qb) =>
        qb.where('events.circuitId', '==', obj.circuitId!)
      )
      .$if(obj.grandPrixId != undefined, (qb) =>
        qb.where('events.grandPrixId', '==', obj.grandPrixId!)
      )
      .$if(obj.season != undefined, (qb) =>
        qb.where(getSeasonFromIdColumn('events.id'), '==', obj.season!)
      )
      .$if(obj.name != undefined, (qb) =>
        qb.where(
          sql`LOWER(events.name)`,
          'like',
          `%${obj.name!.toLocaleLowerCase()}%`
        )
      );

    return this.paginateSelect(
      mainSelect,
      EventService.getEventSelect(
        mainSelect,
        IncludeParam.fromFieldQueryParam(obj)
      ),
      paginator,
      sorter,
      {
        id: sql.ref('events.id'),
        name: sql.ref('events.name'),
        season: getSeasonFromIdColumn('events.id'),
        round: getRoundFromIdColumn('events.id')
      }
    ).executeTakeFirstOrThrow();
  }

  /** The entries of an event, in the order of the race results, with what each one did (see `EventEntryDTO`) */
  async getEntries(
    season: number,
    round: number,
    fields: IncludeQueryParam
  ): Promise<EventEntryDTO[]> {
    const eventId = `${season}-${String(round).padStart(2, '0')}`;

    const { rows } = await sql<{
      entryId: string;
      race: string | null;
      raceOrder: number | null;
      otherSessions: number;
    }>`
      WITH x AS (
        SELECT s.abbreviation AS session, r.entryId, r.positionText, r.positionOrder
          FROM raceResults r JOIN sessions s ON s.id = r.sessionId WHERE s.eventId = ${eventId}
        UNION ALL SELECT s.abbreviation, q.entryId, NULL, NULL
          FROM qualifyingResults q JOIN sessions s ON s.id = q.sessionId WHERE s.eventId = ${eventId}
        UNION ALL SELECT s.abbreviation, f.entryId, NULL, NULL
          FROM fpResults f JOIN sessions s ON s.id = f.sessionId WHERE s.eventId = ${eventId}
      )
      SELECT entryId,
        MAX(CASE WHEN session = 'R' THEN positionText END) AS race,
        MIN(CASE WHEN session = 'R' THEN positionOrder END) AS raceOrder,
        SUM(session <> 'R' AND session NOT LIKE 'FP%' AND session <> 'WU') AS otherSessions
      FROM x GROUP BY entryId
      ORDER BY raceOrder IS NULL, raceOrder, entryId`.execute(this.db);

    if (rows.length === 0) throw HttpException.resourceNotFound('default');

    // `id` is needed to match the entries, even if it was not asked for in `include`
    const include = IncludeParam.fromFieldQueryParam(fields).clone('entry');
    if (include.include) include.include += ',id';

    const entries = await EntryService.getEntrySelect(
      this.db.selectFrom('entries'),
      include
    )
      .where(
        'entries.id',
        'in',
        rows.map((r) => r.entryId)
      )
      .execute();
    const byId = new Map(entries.map((e) => [e.id, e]));

    return rows.map((r) => ({
      participation: r.race ?? (r.otherSessions === 0 ? 'TD' : null),
      entry: byId.get(r.entryId)!
    }));
  }

  getById(
    season: number,
    round: number,
    fields: IncludeQueryParam
  ): Promise<EventDTO> {
    return EventService.getEventSelect(
      this.db.selectFrom('events'),
      IncludeParam.fromFieldQueryParam(fields)
    )
      .where(getSeasonFromIdColumn('id'), '==', season)
      .where(getRoundFromIdColumn('id'), '==', round)
      .executeTakeFirstOrThrow(() => HttpException.resourceNotFound('default'));
  }
}
