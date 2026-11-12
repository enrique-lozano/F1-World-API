import { SelectQueryBuilder, sql } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam, IncludeQueryParam } from '../../models/include-filter';
import { PageMetadata, Paginator } from '../../models/pagination';
import { Sorter } from '../../models/sorter';
import {
  DB,
  EntrantDTO,
  EntrantLineage,
  EntrantLineageItem,
  EntrantNameUsage,
  EntrantSeasonDTO,
  Entrants,
  SuccessionType
} from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { HttpException } from '../../utils/custom-error';
import { CompanyService } from '../company/company.service';
import { EntrantSeasonService } from './entrantSeason.service';
import type {
  EntrantController,
  EntrantQueryParams
} from './entrant.controller';

export class EntrantService
  extends DbService
  implements
    Pick<
      EntrantController,
      'get' | 'getById' | 'getSeasons' | 'getNames' | 'getLineage'
    >
{
  static getEntrantsSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'entrants', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = ['id', 'name'] as const;

    return (qb as SelectQueryBuilder<DB, 'entrants', object>)
      .select(
        fieldsParam.getFilteredFieldsArrayWithPrefix(
          allSingleFields,
          'entrants.'
        )
      )
      .$if(fieldsParam.shouldSelectObject('company'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            CompanyService.getCompaniesSelect(
              eb.selectFrom('companies'),
              fieldsParam?.clone('company')
            ).whereRef('entrants.companyId', '==', 'companies.id')
          ).as('company')
        )
      )
      .$if(fieldsParam.shouldSelectKey('firstSeason'), (qb) =>
        qb.select(EntrantService.seasonExpression('min').as('firstSeason'))
      )
      .$if(fieldsParam.shouldSelectKey('lastSeason'), (qb) =>
        qb.select(EntrantService.seasonExpression('max').as('lastSeason'))
      )
      .$if(fieldsParam.shouldSelectKey('latestEntrantName'), (qb) =>
        qb.select(
          sql<string | null>`(
            SELECT entries.entrantName FROM entries
            INNER JOIN entrantSeasons ON entrantSeasons.id = entries.entrantSeasonId
            WHERE entrantSeasons.entrantId = entrants.id
            ORDER BY entrantSeasons.season DESC, CAST(entries.id AS INT) DESC
            LIMIT 1
          )`.as('latestEntrantName')
        )
      ) as SelectQueryBuilder<DB, 'entrants' | T, EntrantDTO>;
  }

  private static seasonExpression(aggregate: 'min' | 'max') {
    return sql<
      number | null
    >`(SELECT ${sql.raw(aggregate)}(entrantSeasons.season) FROM entrantSeasons WHERE entrantSeasons.entrantId = entrants.id)`;
  }

  async get(
    obj: EntrantQueryParams
  ): Promise<PageMetadata & { data: EntrantDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<Entrants>(obj.sort || 'name');

    const mainSelect = this.db
      .selectFrom('entrants')
      .$if(obj.name != undefined, (qb) =>
        qb.where(
          sql`LOWER(entrants.name)`,
          'like',
          `%${obj.name!.toLocaleLowerCase()}%`
        )
      )
      .$if(obj.season != undefined, (qb) =>
        qb.where(({ exists, selectFrom }) =>
          exists(
            selectFrom('entrantSeasons')
              .select('entrantSeasons.id')
              .whereRef('entrantSeasons.entrantId', '==', 'entrants.id')
              .where('entrantSeasons.season', '==', obj.season!)
          )
        )
      );

    return this.paginateSelect(
      mainSelect,
      EntrantService.getEntrantsSelect(
        mainSelect,
        IncludeParam.fromFieldQueryParam(obj)
      ),
      paginator,
      sorter,
      {
        firstSeason: EntrantService.seasonExpression('min'),
        lastSeason: EntrantService.seasonExpression('max')
      }
    ).executeTakeFirstOrThrow();
  }

  getById(id: string, fields?: IncludeQueryParam): Promise<EntrantDTO> {
    return EntrantService.getEntrantsSelect(
      this.db.selectFrom('entrants'),
      IncludeParam.fromFieldQueryParam(fields ?? {})
    )
      .where('entrants.id', '==', id)
      .executeTakeFirstOrThrow(() => HttpException.resourceNotFound('default'));
  }

  async getSeasons(
    id: string,
    fields?: IncludeQueryParam
  ): Promise<EntrantSeasonDTO[]> {
    await this.checkExists(id);

    return EntrantSeasonService.getEntrantSeasonsSelect(
      this.db.selectFrom('entrantSeasons'),
      IncludeParam.fromFieldQueryParam(fields ?? {})
    )
      .where('entrantSeasons.entrantId', '==', id)
      .orderBy('entrantSeasons.season')
      .execute();
  }

  async getNames(id: string): Promise<EntrantNameUsage[]> {
    await this.checkExists(id);

    const rows = await this.db
      .selectFrom('entries')
      .innerJoin(
        'entrantSeasons',
        'entrantSeasons.id',
        'entries.entrantSeasonId'
      )
      .where('entrantSeasons.entrantId', '==', id)
      .groupBy(['entries.entrantName', 'entrantSeasons.season'])
      .select([
        'entries.entrantName as name',
        'entrantSeasons.season',
        sql<number>`MIN(CAST(entries.id AS INT))`.as('firstEntry')
      ])
      .orderBy('entrantSeasons.season')
      .orderBy('firstEntry')
      .execute();

    const names = new Map<string, number[]>();
    for (const row of rows) {
      names.set(row.name, [...(names.get(row.name) ?? []), row.season]);
    }

    return [...names.entries()].map(([name, seasons]) => ({
      name,
      ranges: seasons.reduce<{ from: number; to: number }[]>((ranges, s) => {
        const last = ranges[ranges.length - 1];
        if (last && s <= last.to + 1) last.to = s;
        else ranges.push({ from: s, to: s });
        return ranges;
      }, [])
    }));
  }

  async getLineage(id: string): Promise<EntrantLineage> {
    await this.checkExists(id);

    const successions = await this.db
      .selectFrom('entrantSuccessions')
      .selectAll()
      .orderBy('year')
      .execute();

    type Handover = { entrantId: string; year: number; type: SuccessionType };
    const walk = (from: 'predecessorId' | 'successorId') => {
      const visited = new Set<string>([id]);
      const chain: Handover[] = [];
      let frontier = [id];

      while (frontier.length > 0) {
        const next: string[] = [];
        for (const current of frontier) {
          for (const s of successions.filter((x) => x[from] === current)) {
            const other =
              from === 'predecessorId' ? s.successorId : s.predecessorId;
            if (visited.has(other)) continue;
            visited.add(other);
            chain.push({ entrantId: other, year: s.year, type: s.type });
            next.push(other);
          }
        }
        frontier = next;
      }

      return chain;
    };

    const successors = walk('predecessorId');
    // For the predecessors, the handover is the one that goes from that entrant to the next one
    const predecessors = walk('successorId');

    const ids = [...successors, ...predecessors].map((x) => x.entrantId);
    const entrants = ids.length
      ? await EntrantService.getEntrantsSelect(this.db.selectFrom('entrants'))
          .where('entrants.id', 'in', ids)
          .execute()
      : [];
    const byId = new Map(entrants.map((e) => [e.id, e]));

    const toItems = (chain: Handover[]): EntrantLineageItem[] =>
      chain.map((x) => ({
        entrant: byId.get(x.entrantId) as EntrantDTO,
        year: x.year,
        type: x.type
      }));

    return {
      predecessors: toItems(predecessors),
      successors: toItems(successors)
    };
  }

  private async checkExists(id: string) {
    await this.db
      .selectFrom('entrants')
      .select('id')
      .where('id', '==', id)
      .executeTakeFirstOrThrow(() => HttpException.resourceNotFound('default'));
  }
}
