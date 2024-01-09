import { SelectQueryBuilder } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { IncludeParam } from '../../models/include-filter';
import { PageMetadata, Paginator } from '../../models/pagination';
import { Sorter } from '../../models/sorter';
import { Companies, CompanyDTO, DB } from '../../models/types.dto';
import { DbService } from '../../services/db.service';
import { HttpException } from '../../utils/custom-error';
import { CountryService } from '../countries/countries.service';
import { CompanyController, CompanyQueryParams } from './company.controller';

export class CompanyService
  extends DbService
  implements Pick<CompanyController, 'getById' | 'get'>
{
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
        fieldsParam.getFilteredFieldsArrayWithPrefix(
          allSingleFields,
          'companies.'
        )
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

  get(obj: CompanyQueryParams): Promise<PageMetadata & { data: CompanyDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);
    const sorter = new Sorter<Companies>(obj.sort || 'name');

    const mainSelect = this.db
      .selectFrom('companies')
      .where('companies.name', 'like', `%${obj.name ?? ''}%`);

    return this.paginateSelect(
      mainSelect,
      CompanyService.getCompaniesSelect(
        mainSelect,
        IncludeParam.fromFieldQueryParam(obj)
      ),
      paginator,
      sorter
    ).executeTakeFirstOrThrow();
  }

  getById(id: string): Promise<CompanyDTO | undefined> {
    return CompanyService.getCompaniesSelect(this.db.selectFrom('companies'))
      .where('id', '==', id)
      .executeTakeFirstOrThrow(() => HttpException.resourceNotFound('default'));
  }
}
