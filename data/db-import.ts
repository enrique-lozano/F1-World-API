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

    const tablesMap: {
      filenames: (filename: string) => boolean;
      tableName: string;
    }[] = [
      {
        filenames: (filename) =>
          [
            'Q1 - Res',
            'Q2 - Res',
            'Q3 - Res',
            'Q - ',
            'PQ - Res',
            'SQ1 - Res',
            'SQ2 - Res',
            'SQ3 - Res'
          ].some((prefix) => filename.startsWith(prefix)),
        tableName: 'qualifyingResults'
      },
      {
        filenames: (filename) =>
          ['R - Res', 'SR - Res'].some((prefix) => filename.startsWith(prefix)),
        tableName: 'raceResults'
      },
      {
        filenames: (filename) =>
          ['FP1 - Res', 'FP2 - Res', 'FP3 - Res', 'FP4 - Res', 'WU - Res'].some(
            (prefix) => filename.startsWith(prefix)
          ),
        tableName: 'fpResults'
      },
      {
        filenames: (filename) => filename.includes('Lap times'),
        tableName: 'lapTimes'
      },
      {
        filenames: (filename) => filename.includes('Pit stops'),
        tableName: 'pitStops'
      }
    ];

    // Loop through each CSV file and populate the corresponding table
    for (const tableName of tableNames) {
      for (const tableMap of tablesMap) {
        if (tableMap.tableName == tableName) {
          insertQueries(
            await getInsertQueriesFromDir({
              folderPath: path.resolve(csvDirectory),
              triggerFilenameCondition: tableMap.filenames,
              toTable: tableName,
              rowTransformFn: setSessionID
            })
          );
        }
      }

      if (tablesMap.some((x) => x.tableName == tableName)) {
        // Go to next iteration since we already insert data
        continue;
      }

      // Other tables will be in the root directory, with the csv file having
      // the same name as the table name:

      console.log('\n');
      const queries = await getInsertQueriesFromCSV(
        path.resolve(csvDirectory, tableName + '.csv'),
        tableName
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

function setSessionID(row: object, filepath: string) {
  const splittedPath = filepath.split(path.sep);

  row['sessionId'] = `${splittedPath.at(-3)}-${
    splittedPath.at(-2)?.split(' -')[0]
  }-${splittedPath.at(-1)?.split(' -')[0]}`;

  return row;
}

function getInsertQueriesFromCSV(
  pathToFile: string,
  tableName: string,
  rowTransformFn?: (row: object) => object
) {
  return new Promise<querydef[]>((res) => {
    const querys: querydef[] = [];

    console.log(
      pc.blue('[INFO]: ') +
        'Parsing ' +
        pc.italic(path.relative(process.cwd(), pathToFile)) +
        '...'
    );

    readCSV(pathToFile).then((rows) => {
      for (let row of rows) {
        if (rowTransformFn) {
          row = rowTransformFn(row);
        }

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

/** Get all the insert queries of a set of files */
async function getInsertQueriesFromDir(params: {
  folderPath: string;
  triggerFilenameCondition: (filename: string) => boolean;
  toTable: string;
  rowTransformFn?: (row: object, filepath: string) => object;
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
    const filepath = path.join(file.path, file.name);

    queries = [
      ...queries,
      ...(await getInsertQueriesFromCSV(
        filepath,
        params.toTable,
        params.rowTransformFn
          ? (row) => params.rowTransformFn!(row, filepath)
          : undefined
      ))
    ];
  }

  return queries;
}
