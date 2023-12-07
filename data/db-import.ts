import { default as Database } from 'better-sqlite3';
import csvParser from 'csv-parser';
import * as fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import { csvDirectory, dbFilePath, tableNames } from './constants';

type querydef = { sql: string; values: any[] };

console.log('\n');

const schemaFilePath = path.resolve(__dirname, 'schema.sql'); // Path to your schema.sql file

// Read the SQL schema file
const schemaSQL = fs.readFileSync(schemaFilePath, 'utf8');

/** The current DB instance */
const db = new Database(dbFilePath); // Read the SQLite database file. Create an empty DB file if don't exist

console.log(pc.green('[OK]: ') + 'Database file connected successfully!\n');

try {
  // Execute the schema SQL to create tables
  console.log(pc.blue('[INFO]: ') + 'Creating database tables...');
  db.exec(schemaSQL);
  console.log(pc.green('[OK]: ') + 'Database schema created successfully!');
} catch (err) {
  console.error('Error executing schema SQL:', err);

  throw new Error();
}

populateDB();

async function populateDB() {
  try {
    // Execute the schema SQL to create tables
    console.log('\n');
    console.log('-----------------------------------');
    console.log('\n');
    console.log(pc.blue('[INFO]: ') + 'Poulating the database...');

    // Loop through each CSV file and populate the corresponding table
    for (const csvFile of tableNames) {
      if (csvFile.indexOf('Results') > -1) {
        if (csvFile == 'qualifyingResults') {
          insertQueries(
            await getInsertQueriesFromDir({
              folderPath: path.resolve(csvDirectory),
              triggerFilenameCondition: (filename) =>
                ['Q1 -', 'Q2 -', 'Q3 -', 'Q - '].some((prefix) =>
                  filename.startsWith(prefix)
                ),
              toTable: csvFile
            })
          );
        } else if (csvFile == 'raceResults') {
          insertQueries(
            await getInsertQueriesFromDir({
              folderPath: path.resolve(csvDirectory),
              triggerFilenameCondition: (filename) =>
                ['R - '].some((prefix) => filename.startsWith(prefix)),
              toTable: csvFile
            })
          );
        } else if (csvFile == 'preQualifyingResults') {
          insertQueries(
            await getInsertQueriesFromDir({
              folderPath: path.resolve(csvDirectory),
              triggerFilenameCondition: (filename) =>
                ['PQ - '].some((prefix) => filename.startsWith(prefix)),
              toTable: csvFile
            })
          );
        } else if (csvFile == 'sprintQualifyingResults') {
          insertQueries(
            await getInsertQueriesFromDir({
              folderPath: path.resolve(csvDirectory),
              triggerFilenameCondition: (filename) =>
                ['SR - '].some((prefix) => filename.startsWith(prefix)),
              toTable: csvFile
            })
          );
        } else if (csvFile == 'fpResults') {
          insertQueries(
            await getInsertQueriesFromDir({
              folderPath: path.resolve(csvDirectory),
              triggerFilenameCondition: (filename) =>
                ['FP1 -', 'FP2 -', 'FP3 -', 'FP4 - ', 'WU -'].some((prefix) =>
                  filename.startsWith(prefix)
                ),
              toTable: csvFile
            })
          );
        }

        continue;
      }

      console.log('\n');
      const queries = await getInsertQueriesFromCSV(
        path.resolve(csvDirectory, csvFile + '.csv'),
        csvFile
      );

      insertQueries(queries);
    }
  } catch (err) {
    console.error('Error populating the database:', err);
  }

  console.log(pc.bold('\nAll ready! Thanks for using the F1 World API!'));
}

function insertQueries(queries: querydef[]) {
  const insertMany = db.transaction((queries) => {
    for (const query of queries) {
      try {
        db.prepare(query.sql).run(query.values);
      } catch (error) {
        console.log(
          'ERROR: While executing ' + query.sql + ' with values ' + query.values
        );
        throw error;
      }
    }
  });

  console.log(pc.blue('[INFO]: ') + 'Inserting the rows...');

  insertMany(queries);

  console.log(pc.green('[OK]: ') + 'All the rows successfully inserted!');
}

function readCSV(pathToFile: string) {
  const rows: object[] = [];

  return new Promise<object[]>((res, rej) => {
    fs.createReadStream(pathToFile)
      .pipe(csvParser({}))
      .on('data', (row: object) => {
        rows.push(row);
      })
      .on('end', () => {
        res(rows);
      })
      .on('error', (err) => {
        rej(err);
      });
  });
}

function getInsertQueriesFromCSV(pathToFile: string, tableName: string) {
  return new Promise<querydef[]>((res, rej) => {
    const querys: querydef[] = [];

    console.log(
      pc.blue('[INFO]: ') +
        'Parsing ' +
        pc.italic(path.relative(process.cwd(), pathToFile)) +
        '...'
    );

    readCSV(pathToFile).then((rows) => {
      for (const row of rows) {
        // Insert each row into the corresponding table
        const placeholders = Object.keys(row)
          .map(() => '?')
          .join(', ');

        const values = Object.values(row).map((x) => x || null);
        const insertQuery = `INSERT INTO ${tableName} (${Object.keys(row).join(
          ', '
        )}) VALUES (${placeholders})`;

        querys.push({ sql: insertQuery, values });
      }

      res(querys);

      console.log(
        pc.green('[OK]: ') +
          `Readed ${pc.bold(querys.length)} registers from file ${pc.italic(
            path.relative(process.cwd(), pathToFile)
          )}`
      );
    });
  });
}

async function getInsertQueriesFromDir(params: {
  folderPath: string;
  triggerFilenameCondition: (filename: string) => boolean;
  toTable: string;
}) {
  let queries: querydef[] = [];

  const files = fs.readdirSync(params.folderPath, {
    recursive: true,
    withFileTypes: true
  });

  const filesToProcess = files.filter((file) => {
    const filename = file.name;

    return (
      filename.endsWith('.csv') && params.triggerFilenameCondition(filename)
    );
  });

  for (const file of filesToProcess) {
    queries = [
      ...queries,
      ...(await getInsertQueriesFromCSV(
        path.join(file.path, file.name),
        params.toTable
      ))
    ];
  }

  return queries;
}
