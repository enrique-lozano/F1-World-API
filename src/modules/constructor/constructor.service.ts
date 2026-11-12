import { SelectQueryBuilder, sql } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam, IncludeQueryParam } from '../../models/include-filter';
import { PageMetadata, Paginator } from '../../models/pagination';
import { Sorter } from '../../models/sorter';
import {
  ConstructorCareerStats,
  ConstructorDTO,
  ConstructorEngineSupplier,
  Constructors,
  DB
} from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { HttpException } from '../../utils/custom-error';
import { CareerService } from '../career.service';
import { ConstructorStandingService } from '../constructor-standings/constructor-standings.service';
import { CountryService } from '../countries/countries.service';
import { EngineManufacturerService } from '../engine/engine.service';
import {
  ConstructorController,
  ConstructorQueryParams
} from './constructor.controller';

export class ConstructorService
  extends DbService
  implements
    Pick<
      ConstructorController,
      | 'get'
      | 'getById'
      | 'getConstructorSeasons'
      | 'getConstructorStats'
      | 'getConstructorEngineSuppliers'
    >
{
  static getConstructorsSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'constructors', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = [
      'id',
      'companyId',
      'name',
      'fullName',
      'wikiUrl',
      'summary',
      'photo'
    ] as const;

    return (qb as SelectQueryBuilder<DB, 'constructors', object>)
      .select(
        fieldsParam.getFilteredFieldsArrayWithPrefix(
          allSingleFields,
          'constructors.'
        )
      )
      .$if(fieldsParam.shouldSelectObject('country'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            CountryService.getCountriesSelect(
              eb.selectFrom('countries'),
              fieldsParam?.clone('country')
            ).whereRef('constructors.countryId', '==', 'countries.alpha2Code')
          ).as('country')
        )
      )
      .$if(fieldsParam.shouldSelectKey('firstSeason'), (qb) =>
        qb.select(ConstructorService.firstSeasonExpression.as('firstSeason'))
      )
      .$if(fieldsParam.shouldSelectKey('lastSeason'), (qb) =>
        qb.select(ConstructorService.lastSeasonExpression.as('lastSeason'))
      ) as SelectQueryBuilder<DB, 'constructors' | T, ConstructorDTO>;
  }

  private static get firstSeasonExpression() {
    return CareerService.entrySeasonExpression(
      'constructorId',
      'constructors.id',
      'min'
    );
  }

  private static get lastSeasonExpression() {
    return CareerService.entrySeasonExpression(
      'constructorId',
      'constructors.id',
      'max'
    );
  }

  async get(
    obj: ConstructorQueryParams
  ): Promise<PageMetadata & { data: ConstructorDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<Constructors>(obj.sort || 'name');

    const mainSelect = this.db
      .selectFrom('constructors')
      .$if(obj.name != undefined, (qb) => {
        const name = `%${obj.name!.toLocaleLowerCase()}%`;

        return qb.where((eb) =>
          eb.or([
            eb(sql`LOWER(constructors.name)`, 'like', name),
            eb(sql`LOWER(constructors.fullName)`, 'like', name)
          ])
        );
      })
      .$if(obj.countryId != undefined, (qb) =>
        qb.where('constructors.countryId', '==', obj.countryId!)
      );

    return this.paginateSelect(
      mainSelect,
      ConstructorService.getConstructorsSelect(
        mainSelect,
        IncludeParam.fromFieldQueryParam(obj)
      ),
      paginator,
      sorter,
      {
        firstSeason: ConstructorService.firstSeasonExpression,
        lastSeason: ConstructorService.lastSeasonExpression
      }
    ).executeTakeFirstOrThrow();
  }

  getById(id: string, fields?: IncludeQueryParam): Promise<ConstructorDTO> {
    return ConstructorService.getConstructorsSelect(
      this.db.selectFrom('constructors'),
      IncludeParam.fromFieldQueryParam(fields ?? {})
    )
      .where('constructors.id', '==', id)
      .executeTakeFirstOrThrow(() => HttpException.resourceNotFound('default'));
  }

  async getConstructorSeasons(id: string) {
    await this.checkExists(id);

    return new CareerService().getEntrySeasons('constructorId', id);
  }

  async getConstructorStats(id: string): Promise<ConstructorCareerStats> {
    await this.checkExists(id);

    return {
      ...(await new CareerService().getStats('constructorId', id)),
      championships: await this.countChampionships(id)
    };
  }

  /** Seasons in which a car with the chassis of the constructor (with any engine) led the calculated constructors' standings */
  private async countChampionships(id: string) {
    const seasons = await new CareerService().getEntrySeasons(
      'constructorId',
      id
    );
    const standings = new ConstructorStandingService();
    let championships = 0;

    for (const season of seasons) {
      const [champion] =
        await standings.getConstructorChampionshipResults(season);
      if (champion?.chassisConstructor?.id === id) championships++;
    }

    return championships;
  }

  async getConstructorEngineSuppliers(
    id: string
  ): Promise<ConstructorEngineSupplier[]> {
    await this.checkExists(id);

    const res = await sql<{
      manufacturerId: string;
      season: number;
    }>`SELECT DISTINCT engines.manufacturerId AS manufacturerId, CAST(substr(results.sessionId, 1, 4) AS INT) AS season
      FROM (
        SELECT entryId, sessionId FROM raceResults
        UNION ALL SELECT entryId, sessionId FROM qualifyingResults
        UNION ALL SELECT entryId, sessionId FROM fpResults
      ) AS results
      INNER JOIN entries ON entries.id = results.entryId
      INNER JOIN chassis ON chassis.id = entries.chassisId
      INNER JOIN engines ON engines.id = entries.engineId
      WHERE chassis.constructorId = ${id}
      ORDER BY season`.execute(this.db);

    const seasonsByMaker = new Map<string, number[]>();
    for (const row of res.rows) {
      seasonsByMaker.set(row.manufacturerId, [
        ...(seasonsByMaker.get(row.manufacturerId) ?? []),
        row.season
      ]);
    }

    const makers = seasonsByMaker.size
      ? await EngineManufacturerService.getEngineManufacturersSelect(
          this.db.selectFrom('engineManufacturers')
        )
          .where('engineManufacturers.id', 'in', [...seasonsByMaker.keys()])
          .execute()
      : [];

    return [...seasonsByMaker.entries()]
      .map(([makerId, seasons]) => ({
        engineManufacturer: makers.find((m) => m.id === makerId)!,
        ranges: seasons.reduce<{ from: number; to: number }[]>(
          (ranges, season) => {
            const last = ranges[ranges.length - 1];
            if (last && season <= last.to + 1) last.to = season;
            else ranges.push({ from: season, to: season });
            return ranges;
          },
          []
        )
      }))
      .sort((a, b) => a.ranges[0].from - b.ranges[0].from);
  }

  private async checkExists(id: string) {
    await this.db
      .selectFrom('constructors')
      .select('id')
      .where('id', '==', id)
      .executeTakeFirstOrThrow(() => HttpException.resourceNotFound('default'));
  }
}
