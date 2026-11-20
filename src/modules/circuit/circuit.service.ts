import { HttpException } from '../../utils/custom-error';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';

import { SelectQueryBuilder, sql } from 'kysely';
import { IncludeParam, IncludeQueryParam } from '../../models/include-filter';
import { PageMetadata, Paginator } from '../../models/pagination';
import { Sorter } from '../../models/sorter';
import { CircuitRecordStat } from '../../models/enums';
import { Circuits, DB } from '../../models/db';
import {
  CircuitDTO,
  CircuitLayoutGeometry,
  CircuitRecordHolder,
  CircuitRecordsDTO
} from '../../models/dto';
import { DbService } from '../../services/db.service';
import { CountryService } from '../countries/countries.service';
import {
  CircuitController,
  CircuitQueryParams,
  CircuitRecordsQueryParams
} from './circuit.controller';

/** Who an entity of a record is, and how to reach its table from a result (`entries`) */
const recordEntities = {
  driver: {
    id: 'entries.driverId',
    name: 'drivers.name',
    join: 'JOIN drivers ON drivers.id = entries.driverId'
  },
  entrant: {
    id: 'entrantSeasons.entrantId',
    name: 'entrants.name',
    join: `JOIN entrantSeasons ON entrantSeasons.id = entries.entrantSeasonId
           JOIN entrants ON entrants.id = entrantSeasons.entrantId`
  },
  constructor: {
    id: 'chassis.constructorId',
    name: 'constructors.name',
    join: `JOIN chassis ON chassis.id = entries.chassisId
           JOIN constructors ON constructors.id = chassis.constructorId`
  }
} as const;

export type CircuitRecordEntity = keyof typeof recordEntities;

export class CircuitService
  extends DbService
  implements Pick<CircuitController, 'get' | 'getById' | 'getRecords'>
{
  /** First (`min`) or last (`max`) season of the events held in the circuit, `NULL` if there are none */
  private static seasonExpression(fn: 'min' | 'max') {
    return sql<number | null>`(
      SELECT ${sql.raw(fn)}(CAST(SUBSTR(events.id, 1, 4) AS INT)) FROM events
      JOIN circuitLayouts ON circuitLayouts.id = events.circuitLayoutId
      WHERE circuitLayouts.circuitId = circuits.id
    )`;
  }

  private static readonly racesExpression = sql<number>`(
    SELECT COUNT(*) FROM events
    JOIN circuitLayouts ON circuitLayouts.id = events.circuitLayoutId
    WHERE circuitLayouts.circuitId = circuits.id
  )`;

  private static readonly layoutsExpression = sql<number>`(
    SELECT COUNT(*) FROM circuitLayouts WHERE circuitLayouts.circuitId = circuits.id
  )`;

  static getCircuitsSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'circuits', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = [
      'fullName',
      'id',
      'latitude',
      'longitude',
      'name',
      'placeName',
      'opened',
      'status',
      'timeZone',
      'type'
    ] as const;

    return (qb as SelectQueryBuilder<DB, 'circuits', object>)
      .select(fieldsParam.getFilteredFieldsArray(allSingleFields))
      .$if(fieldsParam.shouldSelectKey('names'), (qb) =>
        qb.select((eb) =>
          jsonArrayFrom(
            eb
              .selectFrom('circuitNames')
              .select(['name', 'fromYear', 'untilYear'])
              .whereRef('circuitNames.circuitId', '==', 'circuits.id')
              .orderBy('fromYear')
          ).as('names')
        )
      )
      .$if(fieldsParam.shouldSelectKey('firstSeason'), (qb) =>
        qb.select(CircuitService.seasonExpression('min').as('firstSeason'))
      )
      .$if(fieldsParam.shouldSelectKey('lastSeason'), (qb) =>
        qb.select(CircuitService.seasonExpression('max').as('lastSeason'))
      )
      .$if(fieldsParam.shouldSelectKey('races'), (qb) =>
        qb.select(CircuitService.racesExpression.as('races'))
      )
      .$if(fieldsParam.shouldSelectKey('layouts'), (qb) =>
        qb.select(CircuitService.layoutsExpression.as('layouts'))
      )
      .$if(fieldsParam.shouldSelectKeyOnlyIfAsked('geometry'), (qb) =>
        qb.select(
          sql<CircuitLayoutGeometry | null>`(
            SELECT circuitLayoutGeometries.geojson FROM circuitLayoutGeometries
            JOIN circuitLayouts ON circuitLayouts.id = circuitLayoutGeometries.circuitLayoutId
            WHERE circuitLayouts.circuitId = circuits.id
            ORDER BY (SELECT MAX(events.id) FROM events WHERE events.circuitLayoutId = circuitLayouts.id) DESC
            LIMIT 1
          )`.as('geometry')
        )
      )
      .$if(fieldsParam.shouldSelectObject('country'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            CountryService.getCountriesSelect(
              eb.selectFrom('countries'),
              fieldsParam?.clone('country')
            ).whereRef('circuits.countryId', '==', 'countries.alpha2Code')
          ).as('country')
        )
      ) as SelectQueryBuilder<DB, 'circuits' | T, CircuitDTO>;
  }

  async get(
    obj: CircuitQueryParams
  ): Promise<PageMetadata & { data: CircuitDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<Circuits>(obj.sort || 'name');

    const mainSelect = this.db
      .selectFrom('circuits')
      .$if(obj.countryId != undefined, (qb) =>
        qb.where('circuits.countryId', '==', obj.countryId!)
      )
      .$if(obj.name != undefined, (qb) =>
        qb.where((eb) => {
          const text = `%${obj.name!.toLocaleLowerCase()}%`;

          return eb.or([
            eb(sql`LOWER(circuits.name)`, 'like', text),
            eb(sql`LOWER(circuits.fullName)`, 'like', text),
            eb(sql`LOWER(circuits.placeName)`, 'like', text)
          ]);
        })
      );

    return this.paginateSelect(
      mainSelect,
      CircuitService.getCircuitsSelect(
        mainSelect,
        IncludeParam.fromFieldQueryParam(obj)
      ),
      paginator,
      sorter,
      {
        firstSeason: CircuitService.seasonExpression('min'),
        lastSeason: CircuitService.seasonExpression('max'),
        races: CircuitService.racesExpression,
        layouts: CircuitService.layoutsExpression
      }
    ).executeTakeFirstOrThrow();
  }

  getById(id: string, fields: IncludeQueryParam = {}): Promise<CircuitDTO> {
    return CircuitService.getCircuitsSelect(
      this.db.selectFrom('circuits'),
      IncludeParam.fromFieldQueryParam(fields)
    )
      .where('id', '==', id)
      .executeTakeFirstOrThrow(() => HttpException.resourceNotFound('default'));
  }

  /** The entities with more wins, poles, podiums, fastest laps and points in the races of the circuit */
  async getRecords(
    id: string,
    { by = 'driver', limit = 3 }: CircuitRecordsQueryParams
  ): Promise<CircuitRecordsDTO> {
    await this.getById(id);

    const entity = recordEntities[by];
    const [idColumn, nameColumn] = [sql.ref(entity.id), sql.ref(entity.name)];
    const join = sql.raw(entity.join);

    // The sessions `R` of the events held in the circuit
    const races = sql`(
      SELECT sessions.id FROM sessions
      JOIN events ON events.id = sessions.eventId
      JOIN circuitLayouts ON circuitLayouts.id = events.circuitLayoutId
      WHERE circuitLayouts.circuitId = ${id} AND sessions.abbreviation = 'R'
    )`;

    // Shared drives (several drivers in the same car) have several rows with the same position
    const resultStat = async (stat: CircuitRecordStat, count: string) => {
      const { rows } = await sql<CircuitRecordHolder>`
        SELECT ${idColumn} AS id, ${nameColumn} AS name, ${sql.raw(count)} AS count
        FROM raceResults
        JOIN entries ON entries.id = raceResults.entryId
        ${join}
        WHERE raceResults.sessionId IN ${races}
        GROUP BY ${idColumn}
        HAVING ${sql.raw(count)} > 0
        ORDER BY count DESC, name
        LIMIT ${limit}`.execute(this.db);

      return [stat, rows] as const;
    };

    const fastestLaps = async () => {
      const { rows } = await sql<CircuitRecordHolder>`
        WITH best AS (
          SELECT sessionId, MIN(time) AS bestTime FROM lapTimes
          WHERE sessionId IN ${races} GROUP BY sessionId
        )
        SELECT ${idColumn} AS id, ${nameColumn} AS name, COUNT(DISTINCT lapTimes.sessionId) AS count
        FROM lapTimes
        JOIN best ON best.sessionId = lapTimes.sessionId AND best.bestTime = lapTimes.time
        JOIN entries ON entries.id = lapTimes.entryId
        ${join}
        GROUP BY ${idColumn}
        ORDER BY count DESC, name
        LIMIT ${limit}`.execute(this.db);

      return ['fastestLaps', rows] as const;
    };

    return Object.fromEntries(
      await Promise.all([
        resultStat(
          'wins',
          `COUNT(DISTINCT CASE WHEN raceResults.positionText = '1' THEN raceResults.sessionId END)`
        ),
        resultStat(
          'poles',
          `COUNT(DISTINCT CASE WHEN raceResults.gridPosition = 1 THEN raceResults.sessionId END)`
        ),
        resultStat(
          'podiums',
          `COUNT(DISTINCT CASE WHEN raceResults.positionText IN ('1', '2', '3') THEN raceResults.sessionId || '/' || raceResults.positionText END)`
        ),
        fastestLaps(),
        resultStat('points', `TOTAL(raceResults.points)`)
      ])
    ) as CircuitRecordsDTO;
  }
}
