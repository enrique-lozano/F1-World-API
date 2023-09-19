import { SelectQueryBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/sqlite';
import { Get, Queries, Route, Tags } from 'tsoa';
import {
  PageMetadata,
  PageQueryParams,
  Paginator
} from '../models/paginated-items';
import { DbService } from '../services/db.service';
import { CompanyDTO, DB } from './../models/types.dto';
import { CountryService } from './countries.controller';

interface CompanyQueryParams extends PageQueryParams {
  /** Return only the companies that has manufactured in this specialty */
  specialty?: 'engine' | 'chassis';

  name?: string;
}

@Route('/companies')
@Tags('Companies')
export class CompanyService extends DbService {
  static getCompaniesSelect<T extends keyof DB>(
    qb: SelectQueryBuilder<DB, T | 'companies', {}>
  ) {
    return (qb as SelectQueryBuilder<DB, 'companies', {}>)
      .select(['fullName', 'id', 'name', 'founder', 'yearFounded'])
      .select((eb) => [
        jsonObjectFrom(
          CountryService.getCountriesSelect(
            eb.selectFrom('countries')
          ).whereRef('companies.countryId', '==', 'countries.alpha2Code')
        ).as('country')
      ]) as SelectQueryBuilder<DB, 'companies' | T, CompanyDTO>;
  }

  @Get('/')
  async get(
    @Queries() obj: CompanyQueryParams
  ): Promise<PageMetadata & { data: CompanyDTO[] }> {
    const paginator = Paginator.fromPageQueryParams(obj);

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

  /** Common function to get an specific type of company */
  private getManufacturers(
    paginator: Paginator,
    column: 'chassisManufacturerId' | 'engineManufacturerId'
  ) {
    // TODO

    const manufacturers = this.db245
      .prepare(
        `SELECT DISTINCT ${column} FROM eventEntrants ORDER BY ${column} ${paginator.sqlStatement}`
      )
      .all()
      .map((x: any) => this.getById(x[column]));

    const totalElements = this.db245
      .prepare(
        `SELECT COUNT (DISTINCT ${column}) AS 'count' FROM eventEntrants`
      )
      .get() as any['count'];

    return {
      pageData: new PageMetadata(
        totalElements,
        paginator.pageNo,
        paginator.pageSize
      ),
      items: manufacturers
    };
  }
}
