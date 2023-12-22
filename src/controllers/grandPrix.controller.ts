import { SelectQueryBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Queries, Route, Tags } from 'tsoa';
import {
  PageMetadata,
  PageQueryParams,
  Paginator
} from '../models/paginated-items';
import { DbService } from '../services/db.service';
import { DB, GrandsPrixDTO } from './../models/types.dto';
import { CountryService } from './countries.controller';

interface GrandPrixQueryParams extends PageQueryParams {
  /** Filter drivers by its full name */
  name?: string;

  /** Filter drivers by its nationality */
  countryId?: string;
}

@Route('/grands-prix')
@Tags('Grands Prix')
export class GrandPrixService extends DbService {
  static getGrandPrixSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'grandsPrix', object>
  ) {
    return (qb as SelectQueryBuilder<DB, 'grandsPrix', object>)
      .select(['countryId', 'fullName', 'id', 'name', 'shortName'])
      .select((eb) => [
        jsonObjectFrom(
          CountryService.getCountriesSelect(
            eb.selectFrom('countries')
          ).whereRef('grandsPrix.countryId', '==', 'countries.alpha2Code')
        ).as('country')
      ]) as SelectQueryBuilder<DB, 'grandsPrix' | T, GrandsPrixDTO>;
  }

  @Get('/')
  async get(
    @Queries() obj: GrandPrixQueryParams
  ): Promise<PageMetadata & { data: GrandsPrixDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);

    const mainSelect = this.db
      .selectFrom('grandsPrix')
      .where('grandsPrix.fullName', 'like', `%${obj.name ?? ''}%`)
      .where(
        'grandsPrix.countryId',
        obj.countryId ? '=' : 'like',
        obj.countryId ? obj.countryId : '%%'
      );

    return mainSelect
      .select(({ fn, eb }) => [
        fn.countAll<number>().as('totalElements'),
        eb.val(paginator.pageSize).as('pageSize'),
        eb.val(paginator.pageNo).as('currentPage'),
        jsonArrayFrom(
          GrandPrixService.getGrandPrixSelect(mainSelect)
            .limit(paginator.pageSize)
            .offset(paginator.sqlOffset)
        ).as('data')
      ])
      .executeTakeFirstOrThrow();
  }

  /** Get a grandPrix by its ID
   *
   * @param id The ID of the grandPrix to get */
  @Get('{id}')
  getById(id: string): Promise<GrandsPrixDTO | undefined> {
    return GrandPrixService.getGrandPrixSelect(this.db.selectFrom('grandsPrix'))
      .where('id', '==', id)
      .executeTakeFirst();
  }
}
