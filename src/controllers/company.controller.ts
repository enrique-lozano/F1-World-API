import { SelectQueryBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Queries, Route, Tags } from 'tsoa';
import { IncludeParam, IncludeQueryParam } from '../models/fields-filter';
import {
  PageMetadata,
  PageQueryParams,
  Paginator
} from '../models/paginated-items';
import { Sorter, SorterQueryParams } from '../models/sorter';
import { DbService } from '../services/db.service';
import { Companies, CompanyDTO, DB } from './../models/types.dto';
import { CountryService } from './countries.controller';

interface CompanyQueryParams
  extends PageQueryParams,
    SorterQueryParams,
    IncludeQueryParam {
  // TODO:
  /** Return only the companies that has manufactured in this specialty */
  // specialty?: 'engine' | 'chassis';

  name?: string;

  /** @default name */
  orderBy?: keyof Companies;
}

@Route('/companies')
@Tags('Companies')
export class CompanyService extends DbService {
  static getCompaniesSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'companies', object>,
    fieldsParam?: IncludeParam
  ) {
    fieldsParam ??= new IncludeParam();

    const allSingleFields = [
      'fullName',
      'id',
      'name',
      'founder',
      'yearFounded'
    ] as const;

    return (qb as SelectQueryBuilder<DB, 'companies', object>)
      .select(
        fieldsParam.getFilteredFieldsArray(allSingleFields) ?? allSingleFields
      )
      .$if(fieldsParam.shouldSelectObject('country'), (qb) =>
        qb.select((eb) =>
          jsonObjectFrom(
            CountryService.getCountriesSelect(
              eb.selectFrom('countries'),
              fieldsParam?.clone('country')
            ).whereRef('companies.countryId', '==', 'countries.alpha2Code')
          ).as('country')
        )
      ) as SelectQueryBuilder<DB, 'companies' | T, CompanyDTO>;
  }

  @Get('/')
  async get(
    @Queries() obj: CompanyQueryParams
  ): Promise<PageMetadata & { data: CompanyDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<Companies>(obj.orderBy || 'name', obj.orderDir);

    const mainSelect = this.db
      .selectFrom('companies')
      .where('companies.name', 'like', `%${obj.name ?? ''}%`);

    return mainSelect
      .select(({ fn, eb }) => [
        fn.countAll<number>().as('totalElements'),
        eb.val(paginator.pageSize).as('pageSize'),
        eb.val(paginator.pageNo).as('currentPage'),
        jsonArrayFrom(
          CompanyService.getCompaniesSelect(mainSelect)
            .limit(paginator.pageSize)
            .offset(paginator.sqlOffset)
            .orderBy(`${sorter.orderBy} ${sorter.orderDir}`)
        ).as('data')
      ])
      .executeTakeFirstOrThrow();
  }

  /** Get a company by its ID
   *
   * @param companyId The ID of the company to get */
  @Get('{id}')
  getById(id: string): Promise<CompanyDTO | undefined> {
    return CompanyService.getCompaniesSelect(this.db.selectFrom('companies'))
      .where('id', '==', id)
      .executeTakeFirst();
  }
}
