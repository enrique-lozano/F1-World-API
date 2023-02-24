import { GrandPrix } from '../models/classes/grandPrix';
import { DbService } from './db.service';

export class GrandPrixService extends DbService {
  get() {
    return this.db
      .prepare('SELECT * FROM grandsPrix')
      .all()
      .map((x) => new GrandPrix(x));
  }

  getById(id: string) {
    return new GrandPrix(
      this.db.prepare('SELECT * FROM grandsPrix WHERE id = ?').get(id)
    );
  }
}
