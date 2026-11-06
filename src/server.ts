import fs from 'fs';
import { dbFilePath } from '../data/constants';
import { importDatabase } from '../data/db-import';
import app from './app';

const API_PORT = Number(process.env['PORT'] ?? 3200);

async function main() {
  // First run: build the database from the CSV files
  if (!fs.existsSync(dbFilePath)) {
    console.log('Database not found. Creating it from the CSV files...\n');
    await importDatabase();
  }

  app.listen(API_PORT, () => {
    console.log(`\nServer ready and listening on port ${API_PORT}.`);
    console.log(
      `Visit the docs at http://localhost:${API_PORT}/api/docs/ to check the available endpoints.\n`
    );
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
