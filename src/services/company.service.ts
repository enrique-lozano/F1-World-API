import { Get, Path, Queries, Route, Tags } from 'tsoa';
import { Company, CompanyStorage } from '../models/classes/company';
import {
  PageMetadata,
  pageQueryParams,
  Paginator
} from '../models/interfaces/paginated-items';
import { CountryService } from './countries.service';
import { DbService } from './db.service';

interface CompanyQueryParams extends pageQueryParams {
  /** Return only the companies that has manufactured in this specialty */
  specialty?: 'engine' | 'chassis';
}

@Route('/companies')
@Tags('Companies')
export class CompanyService extends DbService {
  private instanciateNewClass(company: CompanyStorage) {
    return new Company(company, this.countryService.getById(company.countryId));
  }

  @Get('/')
  get(@Queries() obj: CompanyQueryParams) {
    const paginator = new Paginator(obj.pageNo, obj.pageSize);

    if (obj.specialty == 'chassis')
      return this.getChassisManufacturers(paginator);
    else if (obj.specialty == 'engine')
      return this.getEngineManufacturers(paginator);

    const manufacturers = this.db
      .prepare(`SELECT * FROM companies ${paginator.sqlStatement}`)
      .all()
      .map((x) => this.instanciateNewClass(x));

    const totalElements = this.db
      .prepare('SELECT COUNT(*) FROM companies')
      .get()['COUNT(*)'];

    return {
      pageData: new PageMetadata(
        totalElements,
        paginator.pageNo,
        paginator.pageSize
      ),
      items: manufacturers
    };
  }

  /** Get a company by its ID
   *
   * @param companyId The ID of the driver to get */ @Get('{companyId}')
  getById(@Path() companyId: string) {
    return this.instanciateNewClass(
      this.db.prepare('SELECT * FROM companies WHERE id = ?').get(companyId)
    );
  }

  /** Common function to get an specific type of company */
  private getManufacturers(
    paginator: Paginator,
    column: 'chassisManufacturerId' | 'engineManufacturerId'
  ) {
    const manufacturers = this.db
      .prepare(
        `SELECT DISTINCT ${column} FROM eventEntrants ORDER BY ${column} ${paginator.sqlStatement}`
      )
      .all()
      .map((x) => this.getById(x[column]));

    const totalElements = this.db
      .prepare(
        `SELECT COUNT (DISTINCT ${column}) AS 'count' FROM eventEntrants`
      )
      .get()['count'];

    return {
      pageData: new PageMetadata(
        totalElements,
        paginator.pageNo,
        paginator.pageSize
      ),
      items: manufacturers
    };
  }

  /** Get the companies that are or have been chassis manufacturers */
  getChassisManufacturers(paginator: Paginator) {
    return this.getManufacturers(paginator, 'chassisManufacturerId');
  }

  /** Get the companies that are or have been engine manufacturers */
  getEngineManufacturers(paginator: Paginator) {
    return this.getManufacturers(paginator, 'engineManufacturerId');
  }

  private get countryService() {
    return new CountryService();
  }
}
