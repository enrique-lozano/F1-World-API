import {
  default as Database,
  default as SQLite,
  Database as sqliteDB
} from 'better-sqlite3';
import { Kysely, ParseJSONResultsPlugin, SqliteDialect } from 'kysely';
import { DB } from '../models/interfaces/types.dto';

export class DbService {
  db: sqliteDB;

  db1: Kysely<DB>;

  constructor() {
    this.db = new Database('data/db/myDB.db');
    this.db.pragma('journal_mode = WAL');

    const dialect = new SqliteDialect({
      database: new SQLite('data/db/myDB.db')
    });

    this.db1 = new Kysely<DB>({
      dialect,
      plugins: [new ParseJSONResultsPlugin()]
    });
  }
}
