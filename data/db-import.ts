import Database from 'better-sqlite3';
import csvParser from 'csv-parser';
import * as fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import {
  csvDirectory,
  dbFilePath,
  indexesFilePath,
  isSessionTable,
  resultsTableBySessionPrefix,
  schemaFilePath,
  sessionTables,
  tableNames,
  type TableName
} from './constants';

type CsvRow = Record<string, string>;
type SessionFile = { filepath: string; sessionId: string };

const info = (msg: string) => console.log(pc.blue('[INFO]: ') + msg);
const ok = (msg: string) => console.log(pc.green('[OK]: ') + msg);

/**
 * Creates the SQLite database from the CSV files.
 *
 * The data is written to a temporary file that replaces the real database
 * only when everything succeeded, so a failed import never leaves a
 * half-populated database behind.
 */
export async function importDatabase() {
  const start = performance.now();
  const tmpPath = dbFilePath + '.tmp';

  fs.mkdirSync(path.dirname(dbFilePath), { recursive: true });
  fs.rmSync(tmpPath, { force: true });

  const db = new Database(tmpPath);

  try {
    // The DB is rebuilt from scratch, so durability is not needed while importing
    db.pragma('journal_mode = OFF');
    db.pragma('synchronous = OFF');

    info('Creating database tables...');
    db.exec(fs.readFileSync(schemaFilePath, 'utf8'));
    // The schema re-enables the foreign keys, but the rows are inserted in
    // bulk and verified once at the end, which is much faster:
    db.pragma('foreign_keys = OFF');

    const sessionFiles = indexSessionFiles();
    let totalRows = 0;

    for (const tableName of tableNames) {
      totalRows += await importTable(db, tableName, sessionFiles);
    }

    // Indexes after the rows: building them once is faster than maintaining them per insert
    info('Creating indexes...');
    db.exec(fs.readFileSync(indexesFilePath, 'utf8'));

    const violations = db.pragma('foreign_key_check') as {
      table: string;
      rowid: number;
      parent: string;
    }[];

    if (violations.length > 0) {
      console.log(
        pc.yellow('[WARN]: ') +
          `${violations.length} rows reference a missing parent row. First one: ` +
          JSON.stringify(violations[0])
      );
    }

    db.pragma('optimize');
    db.close();

    fs.renameSync(tmpPath, dbFilePath);

    const seconds = ((performance.now() - start) / 1000).toFixed(1);
    ok(`${totalRows} rows imported in ${seconds}s into ${dbFilePath}`);
  } catch (err) {
    db.close();
    fs.rmSync(tmpPath, { force: true });
    throw err;
  }
}

/** Import into a table all the rows of its CSV file(s) */
async function importTable(
  db: Database.Database,
  tableName: TableName,
  sessionFiles: Map<string, SessionFile[]>
) {
  const files: SessionFile[] = isSessionTable(tableName)
    ? (sessionFiles.get(tableName) ?? [])
    : [
        { filepath: path.join(csvDirectory, tableName + '.csv'), sessionId: '' }
      ];

  let inserted = 0;
  let insert: Database.Statement | undefined;

  for (const file of files) {
    const rows = await readCSV(file.filepath);
    if (rows.length === 0) continue;

    if (!insert) {
      // Prepared only once per table instead of once per row
      const columns = Object.keys(rows[0]);
      if (isSessionTable(tableName)) columns.push('sessionId');

      insert = db.prepare(
        `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${columns
          .map(() => '?')
          .join(', ')})`
      );
    }

    const stmt = insert;
    db.transaction(() => {
      for (const row of rows) {
        const values = Object.values(row).map((x) => x || null);
        if (isSessionTable(tableName)) values.push(file.sessionId);

        try {
          stmt.run(values);
        } catch (error) {
          console.error(
            `Error inserting ${JSON.stringify(row)} from ${file.filepath}`
          );
          throw error;
        }
      }
    })();

    inserted += rows.length;
  }

  ok(
    `${tableName}: ${pc.bold(inserted)} rows from ${files.length} file${
      files.length === 1 ? '' : 's'
    }`
  );

  return inserted;
}

function readCSV(pathToFile: string) {
  return new Promise<CsvRow[]>((resolve, reject) => {
    const rows: CsvRow[] = [];

    fs.createReadStream(pathToFile)
      .on('error', reject)
      .pipe(csvParser())
      .on('data', (row: CsvRow) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

/**
 * Walks `csv/seasons` once and groups its files by destination table. The
 * `sessionId` (`<year>-<round>-<session>`) is deduced from the file path:
 * `seasons/<year>/<round> - <GP>/<session> - <Results|Lap times|Pit stops>.csv`
 */
function indexSessionFiles() {
  const index = new Map<string, SessionFile[]>();
  const seasonsDir = path.join(csvDirectory, 'seasons');

  if (!fs.existsSync(seasonsDir)) return index;

  for (const entry of fs.readdirSync(seasonsDir, {
    recursive: true,
    withFileTypes: true
  })) {
    if (!entry.isFile() || !entry.name.endsWith('.csv')) continue;

    const filepath = path.join(entry.parentPath, entry.name);
    const [session, kind] = entry.name.slice(0, -4).split(' - ');

    const round = path.basename(entry.parentPath).split(' -')[0];
    const year = path.basename(path.dirname(entry.parentPath));
    const sessionId = `${year}-${round}-${session}`;

    const table =
      kind === 'Lap times'
        ? 'lapTimes'
        : kind === 'Pit stops'
          ? 'pitStops'
          : resultsTableBySessionPrefix.find((x) =>
              x.prefixes.includes(session)
            )?.table;

    if (!table || !(table in sessionTables)) {
      console.log(pc.yellow('[WARN]: ') + `Ignoring unknown file ${filepath}`);
      continue;
    }

    index.set(table, [...(index.get(table) ?? []), { filepath, sessionId }]);
  }

  // Deterministic order, so the same CSVs always produce the same database
  for (const files of index.values()) {
    files.sort((a, b) => a.filepath.localeCompare(b.filepath));
  }

  return index;
}

if (require.main === module) {
  const onlyIfMissing = process.argv.includes('--if-missing');

  if (onlyIfMissing && fs.existsSync(dbFilePath)) {
    info('The database already exists, nothing to do.');
  } else {
    importDatabase().catch((err) => {
      console.error(pc.red('[ERROR]: ') + 'Import failed', err);
      process.exit(1);
    });
  }
}
