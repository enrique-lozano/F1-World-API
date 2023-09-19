import { default as Database } from 'better-sqlite3';
import csvParser from 'csv-parser';
import * as fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import { csvDirectory, dbFilePath, tableNames } from './constants';

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
      console.log('\n');
      const queries = await parseCSV(csvFile);

      const insertMany = db.transaction((queries) => {
        for (const query of queries) {
          try {
            db.prepare(query.sql).run(query.values);
          } catch (error) {
            console.log(
              'ERROR: While executing ' +
                query.sql +
                ' with values ' +
                query.values
            );
            throw error;
          }
        }
      });

      console.log(pc.blue('[INFO]: ') + 'Inserting the rows...');

      insertMany(queries);

      console.log(pc.green('[OK]: ') + 'All the rows successfully inserted!');
    }
  } catch (err) {
    console.error('Error populating the database:', err);
  }

  console.log(pc.bold('\nAll ready! Thanks for using the F1 World API!'));
}

function parseCSV(csvFile: string) {
  const tableName = csvFile;

  type querydef = { sql: string; values: any[] };

  return new Promise<querydef[]>((res, rej) => {
    const querys: querydef[] = [];

    const pathToFile = path.resolve(csvDirectory, csvFile + '.csv');

    console.log(
      pc.blue('[INFO]: ') +
        'Parsing ' +
        pc.italic(path.relative(process.cwd(), pathToFile)) +
        '...'
    );

    // Open the CSV file for reading
    fs.createReadStream(pathToFile)
      .pipe(csvParser({}))
      .on('data', (row: any) => {
        // Insert each row into the corresponding table
        const placeholders = Object.keys(row)
          .map(() => '?')
          .join(', ');

        const values = Object.values(row).map((x) => x || null);
        const insertQuery = `INSERT INTO ${tableName} (${Object.keys(row).join(
          ', '
        )}) VALUES (${placeholders})`;

        querys.push({ sql: insertQuery, values });
      })
      .on('end', () => {
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
