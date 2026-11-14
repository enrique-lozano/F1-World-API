import path from 'path';

/**
 * Root of the `data` directory. Resolved from the working directory (the
 * project root) so it works both when running from sources and from `dist`.
 * Can be overridden with the `RACEDEX_DATA_DIR` environment variable.
 */
export const dataDirectory = path.resolve(
  process.env['RACEDEX_DATA_DIR'] ?? path.join(process.cwd(), 'data')
);

/** Path of the SQLite database file. Override with `RACEDEX_DB_PATH` */
export const dbFilePath = path.resolve(
  process.env['RACEDEX_DB_PATH'] ?? path.join(dataDirectory, 'db', 'racedex.db')
);

/** Path of the schema used to create the tables */
export const schemaFilePath = path.join(dataDirectory, 'schema.sql');

/** Path of the indexes, created after importing the rows */
export const indexesFilePath = path.join(dataDirectory, 'indexes.sql');

/** Path of the CSV files (the source of truth of the data) */
export const csvDirectory = path.join(dataDirectory, 'csv');

/**
 * Tables of the database, in the order they must be imported (parents first,
 * so the foreign keys are always satisfied).
 */
export const tableNames = [
  'countries',
  'companies',
  'constructors',
  'chassis',
  'circuits',
  'grandsPrix',
  'drivers',
  'driversFamilyRelationships',
  'engineManufacturers',
  'engines',
  'tyreManufacturers',
  'events',
  'sessions',
  'redFlags',
  'retirementReasons',
  'resultStatuses',
  'safetyCars',
  'entrants',
  'entrantSuccessions',
  'entrantSeasons',
  'entries',
  'pitStops',
  'lapTimes',
  'qualifyingResults',
  'fpResults',
  'raceResults'
] as const;

export type TableName = (typeof tableNames)[number];

/**
 * Tables whose rows are split in one CSV file per session, stored in
 * `csv/seasons/<year>/<round> - <GP name>/<session> - <suffix>.csv`
 */
export const sessionTables = {
  pitStops: { fileSuffix: 'Pit stops', orderBy: 'lap' },
  lapTimes: { fileSuffix: 'Lap times', orderBy: 'lap' },
  qualifyingResults: { fileSuffix: 'Results', orderBy: 'positionOrder' },
  fpResults: { fileSuffix: 'Results', orderBy: 'positionOrder' },
  raceResults: { fileSuffix: 'Results', orderBy: 'positionOrder' }
} as const satisfies Partial<
  Record<TableName, { fileSuffix: string; orderBy: string }>
>;

export type SessionTableName = keyof typeof sessionTables;

export function isSessionTable(table: string): table is SessionTableName {
  return table in sessionTables;
}

/**
 * Session abbreviations (the first part of the CSV filename) that belong to
 * each results table.
 */
export const resultsTableBySessionPrefix: {
  prefixes: string[];
  table: SessionTableName;
}[] = [
  {
    prefixes: ['Q1', 'Q2', 'Q3', 'Q', 'PQ', 'SQ1', 'SQ2', 'SQ3'],
    table: 'qualifyingResults'
  },
  { prefixes: ['R', 'SR'], table: 'raceResults' },
  { prefixes: ['FP1', 'FP2', 'FP3', 'FP4', 'WU'], table: 'fpResults' }
];
