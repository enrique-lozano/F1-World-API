import {
  default as Database,
  default as SQLite,
  Database as sqliteDB
} from 'better-sqlite3';
import { Kysely, ParseJSONResultsPlugin, SqliteDialect } from 'kysely';
import { DB } from '../models/types.dto';

export class DbService {
  db245: sqliteDB;

  db: Kysely<DB>;

  constructor() {
    this.db245 = new Database('data/db/test.db');
    this.db245.pragma('journal_mode = WAL');

    const dialect = new SqliteDialect({
      database: new SQLite('data/db/test.db')
    });

    this.db = new Kysely<DB>({
      dialect,
      plugins: [new ParseJSONResultsPlugin()]
    });
  }
}
