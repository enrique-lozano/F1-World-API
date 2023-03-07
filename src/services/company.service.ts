import { Get, Path, Route, Tags } from 'tsoa';
import { Company, CompanyStorage } from '../models/classes/company';
import { CountryService } from './countries.service';
import { DbService } from './db.service';

@Route('/companies')
@Tags('Companies')
export class CompanyService extends DbService {
  private instanciateNewClass(company: CompanyStorage) {
    return new Company(company, this.countryService.getById(company.countryId));
  }

  @Get('/')
  get() {
    return this.db
      .prepare('SELECT * FROM companies')
      .all()
      .map((x) => this.instanciateNewClass(x));
  }

  /** Get a company by its ID
   *
   * @param companyId The ID of the driver to get */ @Get('{companyId}')
  getById(@Path() companyId: string) {
    return this.instanciateNewClass(
      this.db.prepare('SELECT * FROM companies WHERE id = ?').get(companyId)
    );
  }

  private get countryService() {
    return new CountryService();
  }
}
