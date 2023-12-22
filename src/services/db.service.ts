import { default as SQLite } from 'better-sqlite3';
import { Kysely, ParseJSONResultsPlugin, SqliteDialect } from 'kysely';
import { DB } from '../models/types.dto';

export class DbService {
  db: Kysely<DB>;

  constructor() {
    const dialect = new SqliteDialect({
      database: new SQLite('data/db/test.db')
    });

    this.db = new Kysely<DB>({
      dialect,
      plugins: [new ParseJSONResultsPlugin()]
    });
  }
}
