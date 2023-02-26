import { Get, Route, Tags } from 'tsoa';
import { Circuit, CircuitStorage } from './../models/classes/circuit';
import { CountryService } from './countries.service';
import { DbService } from './db.service';

@Route('circuits')
@Tags('Circuits')
export class CircuitService extends DbService {
  private instanciateNewClass(circuit: CircuitStorage) {
    return new Circuit(circuit, this.countryService.getById(circuit.countryId));
  }

  @Get('/')
  get() {
    return this.db
      .prepare('SELECT * FROM circuits')
      .all()
      .map((x) => this.instanciateNewClass(x));
  }

  @Get('/{id}')
  getById(id: string) {
    return this.instanciateNewClass(
      this.db.prepare('SELECT * FROM circuits WHERE id = ?').get(id)
    );
  }

  private get countryService() {
    return new CountryService();
  }
}
