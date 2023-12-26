import { SelectQueryBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam } from '../../models/fields-filter';
import { PageMetadata, Paginator } from '../../models/paginated-items';
import { Sorter } from '../../models/sorter';
import { Companies, CompanyDTO, DB } from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { HttpException } from '../../utils/custom-error';
import { CountryService } from '../countries.controller';
import { CompanyQueryParams } from './company.controller';

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
      .select(fieldsParam.getFilteredFieldsArray(allSingleFields))
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

  async get(
    obj: CompanyQueryParams
  ): Promise<PageMetadata & { data: CompanyDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<Companies>(obj.sort || 'name');

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
            .orderBy(sorter.sqlStatementList!)
        ).as('data')
      ])
      .executeTakeFirstOrThrow();
  }

  /** Get a company by its ID
   *
   * @param companyId The ID of the company to get
   * */
  getById(id: string): Promise<CompanyDTO | undefined> {
    return CompanyService.getCompaniesSelect(this.db.selectFrom('companies'))
      .where('id', '==', id)
      .executeTakeFirstOrThrow(() => HttpException.resourceNotFound('default'));
  }
}
