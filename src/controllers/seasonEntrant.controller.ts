import {
  SeasonEntrant,
  SeasonEntrantStorage
} from '../models/classes/seasonEntrant';
import { DbService } from '../services/db.service';
import { CountryService } from './countries.controller';

export class SeasonEntrantService extends DbService {
  private instanciateNewClass(entrant: SeasonEntrantStorage) {
    if (!entrant) return null;

    return new SeasonEntrant(
      entrant,
      this.countryService.getById(entrant.countryId)
    );
  }

  getFromDB(id: string) {
    return this.instanciateNewClass(
      this.db.prepare('SELECT * FROM seasonEntrants WHERE id = ?').get(id)
    );
  }

  private get countryService() {
    return new CountryService();
  }
}
