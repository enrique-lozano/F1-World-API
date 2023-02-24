import Database, { Database as sqliteDB } from 'better-sqlite3';

export class DbService {
  db: sqliteDB;

  constructor() {
    this.db = new Database('data/db/myDB.db');
    this.db.pragma('journal_mode = WAL');
  }
}
