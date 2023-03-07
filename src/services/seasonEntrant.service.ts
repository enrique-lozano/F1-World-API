import {
  SeasonEntrant,
  SeasonEntrantStorage
} from '../models/classes/seasonEntrant';
import { CountryService } from './countries.service';
import { DbService } from './db.service';

export class SeasonEntrantService extends DbService {
  private instanciateNewClass(entrant: SeasonEntrantStorage) {
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
