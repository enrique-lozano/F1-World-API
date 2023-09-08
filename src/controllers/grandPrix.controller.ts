import { Get, Route, Tags } from 'tsoa';
import { GrandPrix } from '../models/classes/grandPrix';
import { DbService } from '../services/db.service';

@Route('/grands-prix')
@Tags('Grands Prix')
export class GrandPrixService extends DbService {
  @Get('/')
  get() {
    return this.db
      .prepare('SELECT * FROM grandsPrix')
      .all()
      .map((x) => new GrandPrix(x));
  }

  @Get('/{id}')
  getById(id: string) {
    return new GrandPrix(
      this.db.prepare('SELECT * FROM grandsPrix WHERE id = ?').get(id)
    );
  }
}
