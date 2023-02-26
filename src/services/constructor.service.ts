import { Get, Path, Route, Tags } from 'tsoa';
import { Constructor, ConstructorStorage } from '../models/classes/constructor';
import { CountryService } from './countries.service';
import { DbService } from './db.service';

@Route('/constructors')
@Tags('Constructors')
export class ConstructorService extends DbService {
  private instanciateNewClass(constructor: ConstructorStorage) {
    return new Constructor(
      constructor,
      this.countryService.getById(constructor.countryId)
    );
  }

  @Get('/')
  get() {
    return this.db
      .prepare('SELECT * FROM constructors')
      .all()
      .map((x) => this.instanciateNewClass(x));
  }

  /** Get a constructor by its ID
   *
   * @param constructorId The ID of the driver to get */ @Get('{constructorId}')
  getById(@Path() constructorId: string) {
    return this.instanciateNewClass(
      this.db
        .prepare('SELECT * FROM constructors WHERE id = ?')
        .get(constructorId)
    );
  }

  private get countryService() {
    return new CountryService();
  }
}
