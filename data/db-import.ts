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
import { importGeometries } from './db-geometry';
import { checkLayouts } from './db-layout-checks';

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

    // Not a CSV table: the shape of each layout is a file in `tracks/`
    totalRows += importGeometries(db);

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

    validateData(db);

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

/**
 * Checks that the data makes sense beyond the foreign keys. Unlike them, a
 * failure here aborts the import, so a bad CSV never reaches the database.
 */
function validateData(db: Database.Database) {
  // A layout is defined by the races held on it: without events it is a leftover
  const unusedLayouts = db
    .prepare(
      `SELECT id FROM circuitLayouts
       WHERE id NOT IN (SELECT circuitLayoutId FROM events)`
    )
    .all() as { id: string }[];

  if (unusedLayouts.length > 0) {
    throw new Error(
      `Circuit layouts without any event: ${unusedLayouts
        .map((x) => x.id)
        .join(', ')}`
    );
  }

  // The newest name of a circuit is its `fullName` (a name that is still used has no `untilYear`; one of a circuit that closed has the year it closed)
  const names = db
    .prepare(
      `SELECT circuits.id FROM circuits
       WHERE (SELECT name FROM circuitNames WHERE circuitId = circuits.id ORDER BY fromYear DESC LIMIT 1) IS NOT circuits.fullName
          OR (circuits.status = 'IN_USE' AND EXISTS (
            SELECT 1 FROM circuitNames WHERE circuitId = circuits.id AND untilYear IS NOT NULL
              AND fromYear = (SELECT MAX(fromYear) FROM circuitNames WHERE circuitId = circuits.id)))`
    )
    .all() as { id: string }[];
  if (names.length > 0) {
    throw new Error(
      `The newest name is not the fullName (or it has an untilYear in a circuit in use): ${names.map((x) => x.id).join(', ')}`
    );
  }

  const layouts = db
    .prepare(
      `SELECT circuitLayouts.id, circuitLayouts.circuitId,
         MIN(CAST(SUBSTR(events.id, 1, 4) AS INT)) AS firstSeason
       FROM circuitLayouts JOIN events ON events.circuitLayoutId = circuitLayouts.id
       GROUP BY circuitLayouts.id`
    )
    .all() as Parameters<typeof checkLayouts>[0];
  for (const warning of checkLayouts(layouts)) {
    console.log(pc.yellow('[WARN]: ') + warning);
  }

  // Corners and sectors are distances from the start line along the geometry, so the geometry must start there
  const startLine = (alias: string) => `EXISTS (
    SELECT 1 FROM circuitLayoutGeometries g, json_each(g.geojson, '$.features') feature
    WHERE g.circuitLayoutId = ${alias}.circuitLayoutId
      AND json_extract(feature.value, '$.properties.kind') = 'track'
      AND json_extract(feature.value, '$.properties.startLine') = 1
  )`;
  const problems = (
    db
      .prepare(
        `SELECT 'corner ' || c.number || ' of ' || c.circuitLayoutId AS item, c.distance, l.length, NOT ${startLine('c')} AS noStartLine
         FROM circuitLayoutCorners c
         JOIN circuitLayouts l ON l.id = c.circuitLayoutId
         UNION ALL
         SELECT 'sector ' || s.sector || ' of ' || s.circuitLayoutId, s.distance, l.length, NOT ${startLine('s')}
         FROM circuitLayoutSectors s
         JOIN circuitLayouts l ON l.id = s.circuitLayoutId`
      )
      .all() as {
      item: string;
      distance: number;
      length: number;
      noStartLine: number;
    }[]
  ).flatMap((x) => [
    ...(x.noStartLine
      ? [`${x.item} needs a geometry whose track has "startLine": true`]
      : []),
    ...(x.distance > x.length * 1.05
      ? [
          `${x.item} is at ${x.distance} m, beyond the ${x.length} m of the layout`
        ]
      : [])
  ]);

  // Corner numbers follow the direction of the race
  const corners = db
    .prepare(
      `SELECT circuitLayoutId, number, distance FROM circuitLayoutCorners
       ORDER BY circuitLayoutId, number`
    )
    .all() as { circuitLayoutId: string; number: number; distance: number }[];
  for (let i = 1; i < corners.length; i++) {
    const [a, b] = [corners[i - 1], corners[i]];
    if (a.circuitLayoutId === b.circuitLayoutId && b.distance <= a.distance) {
      problems.push(
        `corner ${b.number} of ${b.circuitLayoutId} is not after corner ${a.number}`
      );
    }
  }

  // Two ends of the same sector cannot be valid in the same season, and sector 1 ends before sector 2
  const sectors = db
    .prepare(
      `SELECT a.circuitLayoutId, a.sector AS sectorA, b.sector AS sectorB, a.distance >= b.distance AS inverted
       FROM circuitLayoutSectors a
       JOIN circuitLayoutSectors b ON b.circuitLayoutId = a.circuitLayoutId
         AND a.fromSeason <= b.untilSeason AND b.fromSeason <= a.untilSeason
         AND (a.sector < b.sector OR (a.sector = b.sector AND a.fromSeason < b.fromSeason))`
    )
    .all() as {
    circuitLayoutId: string;
    sectorA: number;
    sectorB: number;
    inverted: number;
  }[];
  problems.push(
    ...sectors.flatMap((x) =>
      x.sectorA === x.sectorB
        ? [
            `${x.circuitLayoutId} has two ends of sector ${x.sectorA} in the same season`
          ]
        : x.inverted
          ? [`sector 1 of ${x.circuitLayoutId} is not before sector 2`]
          : []
    )
  );

  if (problems.length > 0) {
    throw new Error(
      `Invalid corners or sectors:\n - ${problems.join('\n - ')}`
    );
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
 * `seasons/<year>/<round> - <GP>/<session> - <Results|Lap times|Pit stops|Stints>.csv`
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
          : kind === 'Stints'
            ? 'stints'
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
