import { default as Database } from 'better-sqlite3';
import fs from 'fs';
import { json2csv } from 'json-2-csv';
import path from 'path';
import pc from 'picocolors';
import { csvDirectory, dbFilePath, tableNames } from './constants';

main();

async function main() {
  /** The current DB instance */
  const db = new Database(dbFilePath, { fileMustExist: true });

  console.log(pc.green('[OK]: ') + 'Database file connected successfully!\n');

  for (const tableName of tableNames) {
    // Query the table to fetch all rows
    const rows: any[] = db.prepare(`SELECT * FROM ${tableName}`).all();

    if (rows.length === 0) {
      console.log(`Table "${tableName}" is empty. Skipping export.`);
      continue;
    }

    // Determine the CSV file path
    const csvFilePath = path.resolve(csvDirectory, tableName + '.csv');

    fs.writeFileSync(
      csvFilePath,
      await json2csv(rows, { emptyFieldValue: '' })
    );

    console.log(`Table "${tableName}" exported to ${csvFilePath}`);
  }
}
