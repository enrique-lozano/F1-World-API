import { SelectQueryBuilder, sql } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam, IncludeQueryParam } from '../../models/include-filter';
import { PageMetadata, Paginator } from '../../models/pagination';
import { Sorter } from '../../models/sorter';
import { CircuitLayouts, DB } from '../../models/db';
import { CircuitLayoutDTO, CircuitLayoutGeometry } from '../../models/dto';
import { DbService } from '../../services/db.service';
import {
  getRoundFromIdColumn,
  getSeasonFromIdColumn
} from '../../utils/f1-sql-common-utils';
import { HttpException } from '../../utils/custom-error';
import { CircuitService } from '../circuit/circuit.service';
import {
  CircuitLayoutController,
  CircuitLayoutQueryParams
} from './circuitLayout.controller';

export class CircuitLayoutService
  extends DbService
  implements Pick<CircuitLayoutController, 'get' | 'getById' | 'getGeometry'>
{
  /** First (`min`) or last (`max`) season of the events held on the layout */
  private static seasonExpression(fn: 'min' | 'max') {
    return sql<number>`(
      SELECT ${sql.raw(fn)}(CAST(SUBSTR(events.id, 1, 4) AS INT)) FROM events
      WHERE events.circuitLayoutId = circuitLayouts.id
    )`;
  }

  static getCircuitLayoutsSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'circuitLayouts', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = [
      'id',
      'name',
      'length',
      'turns',
      'direction'
    ] as const;

    return (qb as SelectQueryBuilder<DB, 'circuitLayouts', object>)
      .select(
        fieldsParam.getFilteredFieldsArrayWithPrefix(
          allSingleFields,
          'circuitLayouts.'
        )
      )
      .$if(fieldsParam.shouldSelectKey('firstSeason'), (qb) =>
        qb.select(
          CircuitLayoutService.seasonExpression('min').as('firstSeason')
        )
      )
      .$if(fieldsParam.shouldSelectKey('lastSeason'), (qb) =>
        qb.select(CircuitLayoutService.seasonExpression('max').as('lastSeason'))
      )
      .$if(fieldsParam.shouldSelectKey('hasGeometry'), (qb) =>
        qb.select(
          sql<number>`EXISTS (
            SELECT 1 FROM circuitLayoutGeometries
            WHERE circuitLayoutGeometries.circuitLayoutId = circuitLayouts.id
          )`.as('hasGeometry')
        )
      )
      .$if(fieldsParam.shouldSelectKey('seasons'), (qb) =>
        qb.select(
          sql<number[]>`(
            SELECT json_group_array(season) FROM (
              SELECT DISTINCT CAST(SUBSTR(events.id, 1, 4) AS INT) AS season FROM events
              WHERE events.circuitLayoutId = circuitLayouts.id ORDER BY season
            )
          )`.as('seasons')
        )
      )
      .$if(fieldsParam.shouldSelectObjectOnlyIfAsked('lapRecord'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            eb
              .selectFrom('lapTimes')
              .innerJoin('sessions', 'sessions.id', 'lapTimes.sessionId')
              .innerJoin('events', 'events.id', 'sessions.eventId')
              .innerJoin('entries', 'entries.id', 'lapTimes.entryId')
              .innerJoin('drivers', 'drivers.id', 'entries.driverId')
              .whereRef('events.circuitLayoutId', '==', 'circuitLayouts.id')
              .where('sessions.abbreviation', '==', 'R')
              .where('lapTimes.time', 'is not', null)
              .select([
                'lapTimes.time as time',
                'drivers.id as driverId',
                'drivers.name as driverName',
                'events.name as eventName',
                getSeasonFromIdColumn('events.id').as('season'),
                getRoundFromIdColumn('events.id').as('round')
              ])
              .orderBy('lapTimes.time')
              .limit(1)
          ).as('lapRecord')
        )
      )
      .$if(fieldsParam.shouldSelectObjectOnlyIfAsked('trackRecord'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            eb
              .selectFrom('qualifyingResults')
              .innerJoin(
                'sessions',
                'sessions.id',
                'qualifyingResults.sessionId'
              )
              .innerJoin('events', 'events.id', 'sessions.eventId')
              .innerJoin('entries', 'entries.id', 'qualifyingResults.entryId')
              .innerJoin('drivers', 'drivers.id', 'entries.driverId')
              .whereRef('events.circuitLayoutId', '==', 'circuitLayouts.id')
              // Sprint qualifying is a different session with its own times
              .where(sql<boolean>`sessions.abbreviation NOT LIKE 'SQ%'`)
              .where('qualifyingResults.time', 'is not', null)
              .select([
                'qualifyingResults.time as time',
                'drivers.id as driverId',
                'drivers.name as driverName',
                'events.name as eventName',
                getSeasonFromIdColumn('events.id').as('season'),
                getRoundFromIdColumn('events.id').as('round')
              ])
              .orderBy('qualifyingResults.time')
              .limit(1)
          ).as('trackRecord')
        )
      )
      .$if(fieldsParam.shouldSelectKey('corners'), (qb) =>
        qb.select((eb) =>
          jsonArrayFrom(
            eb
              .selectFrom('circuitLayoutCorners')
              .select(['number', 'name', 'distance'])
              .whereRef(
                'circuitLayoutCorners.circuitLayoutId',
                '==',
                'circuitLayouts.id'
              )
              .orderBy('number')
          ).as('corners')
        )
      )
      .$if(fieldsParam.shouldSelectKey('sectors'), (qb) =>
        qb.select((eb) =>
          jsonArrayFrom(
            eb
              .selectFrom('circuitLayoutSectors')
              .select(['sector', 'fromSeason', 'untilSeason', 'distance'])
              .whereRef(
                'circuitLayoutSectors.circuitLayoutId',
                '==',
                'circuitLayouts.id'
              )
              .orderBy('sector')
              .orderBy('fromSeason')
          ).as('sectors')
        )
      )
      .$if(fieldsParam.shouldSelectObject('circuit'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            CircuitService.getCircuitsSelect(
              eb.selectFrom('circuits'),
              fieldsParam?.clone('circuit')
            ).whereRef('circuitLayouts.circuitId', '==', 'circuits.id')
          ).as('circuit')
        )
      ) as SelectQueryBuilder<DB, 'circuitLayouts' | T, CircuitLayoutDTO>;
  }

  async get(
    obj: CircuitLayoutQueryParams
  ): Promise<PageMetadata & { data: CircuitLayoutDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<CircuitLayouts>(obj.sort || 'id');

    const mainSelect = this.db
      .selectFrom('circuitLayouts')
      .$if(obj.circuitId != undefined, (qb) =>
        qb.where('circuitLayouts.circuitId', '==', obj.circuitId!)
      );

    return this.paginateSelect(
      mainSelect,
      CircuitLayoutService.getCircuitLayoutsSelect(
        mainSelect,
        IncludeParam.fromFieldQueryParam(obj)
      ),
      paginator,
      sorter,
      {
        firstSeason: CircuitLayoutService.seasonExpression('min'),
        lastSeason: CircuitLayoutService.seasonExpression('max')
      }
    ).executeTakeFirstOrThrow();
  }

  getById(id: string, fields: IncludeQueryParam): Promise<CircuitLayoutDTO> {
    return CircuitLayoutService.getCircuitLayoutsSelect(
      this.db.selectFrom('circuitLayouts'),
      IncludeParam.fromFieldQueryParam(fields)
    )
      .where('circuitLayouts.id', '==', id)
      .executeTakeFirstOrThrow(() => HttpException.resourceNotFound('default'));
  }

  /** The shape of a layout. It does not exist (404) for the layouts whose shape is not known yet */
  async getGeometry(id: string): Promise<CircuitLayoutGeometry> {
    const row = await this.db
      .selectFrom('circuitLayoutGeometries')
      .select('geojson')
      .where('circuitLayoutId', '==', id)
      .executeTakeFirstOrThrow(() => HttpException.resourceNotFound('default'));

    // The JSON results plugin of the database service has already parsed it
    return row.geojson as unknown as CircuitLayoutGeometry;
  }
}
