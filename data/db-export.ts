import Database from 'better-sqlite3';
import fs from 'fs';
import { json2csv } from 'json-2-csv';
import path from 'path';
import pc from 'picocolors';
import {
  csvDirectory,
  dbFilePath,
  isSessionTable,
  sessionTables,
  tableNames,
  type SessionTableName
} from './constants';

type Row = Record<string, unknown>;

const info = (msg: string) => console.log(pc.blue('[INFO]: ') + msg);
const ok = (msg: string) => console.log(pc.green('[OK]: ') + msg);

/** Counters used to report how many files really changed */
const stats = { written: 0, unchanged: 0 };

/**
 * Exports the database to the CSV files (the inverse of `db-import.ts`).
 * Files whose content did not change are not touched, so the git diff only
 * contains real changes.
 */
export function exportDatabase() {
  const start = performance.now();
  const db = new Database(dbFilePath, { fileMustExist: true, readonly: true });

  // Session folders are named after the Grand Prix: `<round> - <short name>`
  const gpNames = new Map(
    (
      db
        .prepare(
          `SELECT events.id, grandsPrix.shortName
           FROM events JOIN grandsPrix ON grandsPrix.id = events.grandPrixId`
        )
        .all() as { id: string; shortName: string }[]
    ).map((x) => [x.id, x.shortName])
  );

  for (const tableName of tableNames) {
    if (isSessionTable(tableName)) {
      exportSessionTable(db, tableName, gpNames);
      continue;
    }

    const rows = db.prepare(`SELECT * FROM ${tableName}`).all() as Row[];

    if (rows.length === 0) {
      console.log(
        pc.yellow('[WARN]: ') + `Table "${tableName}" is empty. Skipping.`
      );
      continue;
    }

    writeCSV(path.join(csvDirectory, tableName + '.csv'), rows);
    ok(`${tableName}: ${rows.length} rows`);
  }

  db.close();

  const seconds = ((performance.now() - start) / 1000).toFixed(1);
  ok(
    `Export finished in ${seconds}s: ${stats.written} files written, ${stats.unchanged} unchanged`
  );
}

/**
 * Tables with one CSV file per session. Everything is read with a single
 * ordered query and split into files while iterating, instead of querying
 * the database once per year, round and session.
 */
function exportSessionTable(
  db: Database.Database,
  tableName: SessionTableName,
  gpNames: Map<string, string>
) {
  const { fileSuffix, orderBy } = sessionTables[tableName];
  const rows = db.prepare(
    `SELECT * FROM ${tableName} ORDER BY sessionId, ${orderBy}, rowid`
  );

  let currentSession: string | undefined;
  let buffer: Row[] = [];
  let sessions = 0;
  let total = 0;

  const flush = () => {
    if (currentSession === undefined) return;

    // sessionId = `<year>-<round>-<session abbreviation>`
    const [year, round, ...abbr] = currentSession.split('-');
    const gpName = gpNames.get(`${year}-${round}`);

    if (!gpName) {
      throw new Error(`Event ${year}-${round} not found (${tableName})`);
    }

    // The session info is already in the path, so it's removed from the rows
    writeCSV(
      path.join(
        csvDirectory,
        'seasons',
        year,
        `${round} - ${gpName}`,
        `${abbr.join('-')} - ${fileSuffix}.csv`
      ),
      buffer
    );
    sessions++;
    total += buffer.length;
  };

  for (const { sessionId, ...row } of rows.iterate() as IterableIterator<Row>) {
    if (sessionId !== currentSession) {
      flush();
      currentSession = sessionId as string;
      buffer = [];
    }
    buffer.push(row);
  }
  flush();

  ok(`${tableName}: ${total} rows in ${sessions} files`);
}

function writeCSV(filepath: string, rows: Row[]) {
  const content = json2csv(rows, { emptyFieldValue: '' });

  if (
    fs.existsSync(filepath) &&
    fs.readFileSync(filepath, 'utf8') === content
  ) {
    stats.unchanged++;
    return;
  }

  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, content);
  stats.written++;
}

if (require.main === module) {
  info(`Exporting ${dbFilePath} to ${csvDirectory}`);

  try {
    exportDatabase();
  } catch (err) {
    console.error(pc.red('[ERROR]: ') + 'Export failed', err);
    process.exit(1);
  }
}
