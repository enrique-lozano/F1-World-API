import { Get, Route, Tags } from 'tsoa';
import { Circuit } from './../models/classes/circuit';
import { DbService } from './db.service';

@Route('circuits')
@Tags('Circuits')
export class CircuitService extends DbService {
  @Get('/')
  get() {
    return this.db
      .prepare('SELECT * FROM circuits')
      .all()
      .map((x) => new Circuit(x));
  }

  @Get('/{id}')
  getById(id: string) {
    return new Circuit(
      this.db.prepare('SELECT * FROM circuits WHERE id = ?').get(id)
    );
  }
}
