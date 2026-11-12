import Database from 'better-sqlite3';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import { dbFilePath, schemaFilePath, tableNames } from './constants';

/**
 * Generates `docs/database.dbml` and `docs/database.svg` (the database
 * diagram) from the SQLite database and `schema.sql`. Run it with
 * `npm run docs:db` after changing `schema.sql`.
 *
 * The structure (columns, keys, foreign keys, indexes) is read from the
 * database; what SQLite does not keep is read from the comments and
 * constraints of `schema.sql`:
 *
 * - A comment at the end of a column line is the note of the column.
 * - The comment lines right above `DROP TABLE IF EXISTS <table>;` (except the
 *   `-- Table: <name>` heading) are the note of the table.
 * - A simple `CHECK (<column> IN ('A', 'B'))` becomes an enum.
 *
 * The DBML file can also be pasted in https://dbdiagram.io or published with
 * https://dbdocs.io if a hosted version is ever wanted.
 */

type Column = {
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
};

type ForeignKey = { table: string; from: string; to: string };
type IndexInfo = { name: string; unique: number; origin: string };

type SchemaDocs = {
  tableNotes: Map<string, string>;
  columnNotes: Map<string, string>; // `${table}.${column}`
  enums: Map<string, string[]>; // `${table}.${column}` -> values
};

const docsDir = path.resolve(process.cwd(), 'docs');
const dbmlPath = path.join(docsDir, 'database.dbml');
const svgPath = path.join(docsDir, 'database.svg');

/** Splits `sql -- comment` ignoring the `--` that could be inside a string */
function splitComment(line: string): { sql: string; comment?: string } {
  let quote = false;
  for (let i = 0; i < line.length - 1; i++) {
    if (line[i] === "'") quote = !quote;
    if (!quote && line[i] === '-' && line[i + 1] === '-') {
      return {
        sql: line.slice(0, i).trimEnd(),
        comment: line.slice(i + 2).trim()
      };
    }
  }
  return { sql: line };
}

function parseSchemaDocs(schemaSql: string): SchemaDocs {
  const docs: SchemaDocs = {
    tableNotes: new Map(),
    columnNotes: new Map(),
    enums: new Map()
  };

  let comments: string[] = [];
  let currentTable: string | undefined;

  for (const line of schemaSql.split('\n')) {
    const drop = /^DROP TABLE IF EXISTS (\w+);/.exec(line);
    const create = /^CREATE TABLE IF NOT EXISTS (\w+)/.exec(line);

    if (line.startsWith('--')) {
      comments.push(line.replace(/^--\s?/, '').trim());
      continue;
    }

    if (drop) {
      const note = comments.filter((c) => c && !/^Table: /.test(c)).join(' ');
      if (note) docs.tableNotes.set(drop[1], note);
      comments = [];
      continue;
    }

    comments = [];

    if (create) {
      currentTable = create[1];
      continue;
    }

    if (line.startsWith(');')) {
      currentTable = undefined;
      continue;
    }

    if (!currentTable) continue;

    // Column definitions start with "( " or ", " (constraints have a keyword)
    const m = /^[(,] (\w+) (.*)$/.exec(line);
    if (!m || /^(PRIMARY|UNIQUE|CHECK|FOREIGN)\b/.test(m[1])) continue;

    const { sql, comment } = splitComment(m[2]);
    const key = `${currentTable}.${m[1]}`;
    if (comment) docs.columnNotes.set(key, comment);

    const check = /CHECK \(\w+ IN \(((?:'[^']*'(?:, )?)+)\)\)/.exec(sql);
    if (check) {
      docs.enums.set(
        key,
        [...check[1].matchAll(/'([^']*)'/g)].map((v) => v[1])
      );
    }
  }

  return docs;
}

const quote = (text: string) =>
  `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

function buildDbml(db: Database.Database, docs: SchemaDocs) {
  const tables: string[] = [];
  const refs: string[] = [];
  const enums: string[] = [];

  for (const tableName of tableNames) {
    const columns = db
      .prepare(`PRAGMA table_info(${tableName})`)
      .all() as Column[];
    const fks = db
      .prepare(`PRAGMA foreign_key_list(${tableName})`)
      .all() as ForeignKey[];
    const indexList = db
      .prepare(`PRAGMA index_list(${tableName})`)
      .all() as IndexInfo[];

    const indexColumns = (name: string) =>
      (
        db.prepare(`PRAGMA index_info(${name})`).all() as {
          seqno: number;
          name: string;
        }[]
      )
        .sort((a, b) => a.seqno - b.seqno)
        .map((c) => c.name);

    const indexes: string[] = [];
    const uniqueColumns = new Set<string>();
    const pkColumns = columns
      .filter((c) => c.pk > 0)
      .sort((a, b) => a.pk - b.pk)
      .map((c) => c.name);

    if (pkColumns.length > 1) {
      indexes.push(`(${pkColumns.join(', ')}) [pk]`);
    }

    for (const index of indexList) {
      if (index.origin === 'pk') continue;
      const cols = indexColumns(index.name);
      if (index.name.startsWith('sqlite_autoindex')) {
        // UNIQUE constraints: a single column becomes a column setting
        if (cols.length === 1) uniqueColumns.add(cols[0]);
        else indexes.push(`(${cols.join(', ')}) [unique]`);
        continue;
      }
      const target = cols.length === 1 ? cols[0] : `(${cols.join(', ')})`;
      indexes.push(index.unique ? `${target} [unique]` : target);
    }

    const lines = columns.map((c) => {
      const key = `${tableName}.${c.name}`;
      const enumValues = docs.enums.get(key);
      if (enumValues) {
        const enumName = `${tableName}_${c.name}`;
        enums.push(
          `Enum ${enumName} {\n${enumValues.map((v) => `  ${v}`).join('\n')}\n}`
        );
      }

      const settings = [
        pkColumns.length === 1 && c.pk ? 'pk' : '',
        c.notnull && !c.pk ? 'not null' : '',
        uniqueColumns.has(c.name) ? 'unique' : '',
        c.dflt_value !== null ? `default: ${c.dflt_value}` : '',
        docs.columnNotes.has(key)
          ? `note: ${quote(docs.columnNotes.get(key) as string)}`
          : ''
      ].filter(Boolean);

      // Types like VARCHAR(255) are simplified to keep the diagram readable
      const type = enumValues
        ? `${tableName}_${c.name}`
        : (c.type || 'TEXT').replace(/\(.*\)/, '').toLowerCase();

      return `  ${c.name} ${type}${
        settings.length ? ` [${settings.join(', ')}]` : ''
      }`;
    });

    const extra: string[] = [];
    // The primary key first, the rest sorted so the output is deterministic
    indexes.sort(
      (a, b) =>
        Number(b.endsWith('[pk]')) - Number(a.endsWith('[pk]')) ||
        a.localeCompare(b)
    );
    if (indexes.length) {
      extra.push(
        `  indexes {\n${indexes.map((i) => `    ${i}`).join('\n')}\n  }`
      );
    }
    const tableNote = docs.tableNotes.get(tableName);
    if (tableNote) extra.push(`  Note: ${quote(tableNote)}`);

    tables.push(
      `Table ${tableName} {\n${lines.join('\n')}${
        extra.length ? `\n\n${extra.join('\n\n')}` : ''
      }\n}`
    );

    for (const fk of fks) {
      refs.push(`Ref: ${tableName}.${fk.from} > ${fk.table}.${fk.to}`);
    }
  }

  const parts = [
    `Project racedex {\n  database_type: 'SQLite'\n}`,
    ...enums,
    ...tables,
    refs.join('\n')
  ];

  return parts.join('\n\n') + '\n';
}

const db = new Database(dbFilePath, { fileMustExist: true, readonly: true });
const dbml = buildDbml(
  db,
  parseSchemaDocs(fs.readFileSync(schemaFilePath, 'utf8'))
);
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
