import { Get, Route, Tags } from 'tsoa';
import {
  TyreManufacturer,
  TyreManufacturerStorage
} from '../models/classes/tyreManufacturer';
import { DbService } from '../services/db.service';
import { CountryService } from './countries.controller';

@Route('tyre-manufacturers')
@Tags('Tyre Manufacturers')
export class TyreManufacturerService extends DbService {
  private instanciateNewClass(tyre: TyreManufacturerStorage) {
    return new TyreManufacturer(
      tyre,
      this.countryService.getById(tyre.countryId) as any
    );
  }

  @Get('/')
  get() {
    return this.db
      .prepare('SELECT * FROM tyreManufacturers')
      .all()
      .map((x) => this.instanciateNewClass(x));
  }

  /** Get a tyre manufacturer by its ID */ @Get('/{id}')
  getById(id: string) {
    return this.instanciateNewClass(
      this.db.prepare('SELECT * FROM tyreManufacturers WHERE id = ?').get(id)
    );
  }

  private get countryService() {
    return new CountryService();
  }
}
