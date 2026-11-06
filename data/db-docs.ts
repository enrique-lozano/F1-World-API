import Database from 'better-sqlite3';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import { dbFilePath, tableNames } from './constants';

/**
 * Generates `docs/database.dbml` and `docs/database.svg` (the database
 * diagram) from the SQLite database. Run it with `npm run docs:db` after
 * changing `schema.sql`.
 *
 * The DBML file can also be pasted in https://dbdiagram.io or published with
 * https://dbdocs.io if a hosted version is ever wanted.
 */

type Column = {
  name: string;
  type: string;
  notnull: number;
  pk: number;
};

type ForeignKey = { table: string; from: string; to: string };

const docsDir = path.resolve(process.cwd(), 'docs');
const dbmlPath = path.join(docsDir, 'database.dbml');
const svgPath = path.join(docsDir, 'database.svg');

function buildDbml(db: Database.Database) {
  const tables: string[] = [];
  const refs: string[] = [];

  for (const tableName of tableNames) {
    const columns = db
      .prepare(`PRAGMA table_info(${tableName})`)
      .all() as Column[];
    const fks = db
      .prepare(`PRAGMA foreign_key_list(${tableName})`)
      .all() as ForeignKey[];

    const lines = columns.map((c) => {
      const settings = [
        c.pk ? 'pk' : '',
        c.notnull && !c.pk ? 'not null' : ''
      ].filter(Boolean);

      // Types like VARCHAR(255) are simplified to keep the diagram readable
      const type = (c.type || 'TEXT').replace(/\(.*\)/, '').toLowerCase();

      return `  ${c.name} ${type}${
        settings.length ? ` [${settings.join(', ')}]` : ''
      }`;
    });

    tables.push(`Table ${tableName} {\n${lines.join('\n')}\n}`);

    for (const fk of fks) {
      refs.push(`Ref: ${tableName}.${fk.from} > ${fk.table}.${fk.to}`);
    }
  }

  return `Project racedex {\n  database_type: 'SQLite'\n}\n\n${tables.join(
    '\n\n'
  )}\n\n${refs.join('\n')}\n`;
}

const db = new Database(dbFilePath, { fileMustExist: true, readonly: true });
const dbml = buildDbml(db);
db.close();

fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(dbmlPath, dbml);
console.log(pc.green('[OK]: ') + `Written ${path.relative('.', dbmlPath)}`);

execFileSync(
  'npx',
  ['dbml-renderer', '-i', dbmlPath, '-o', svgPath, '--format', 'svg'],
  { stdio: 'inherit' }
);
console.log(pc.green('[OK]: ') + `Written ${path.relative('.', svgPath)}`);
