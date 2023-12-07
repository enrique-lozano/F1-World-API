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

  console.log(
    db
      .prepare(
        `select substr(sessionId,1,4) as year from fpResults group by substr(sessionId,1,4)`
      )
      .all()
      .map((x: any) => x['year'])
  );

  for (const tableName of tableNames) {
    console.log('');
    console.log(pc.blue('[INFO]: ') + `Exporting table "${tableName}"...`);

    if (tableName.toLowerCase().indexOf('results') > -1) {
      const years = db
        .prepare(
          `select substr(sessionId,1,4) as year from ${tableName} group by substr(sessionId,1,4)`
        )
        .all()
        .map((x: any) => Number(x['year']));

      for (const year of years) {
        const rounds = db
          .prepare(
            `select substr(sessionId,6,2) as round from ${tableName} WHERE substr(sessionId,1,4) = '${year}' group by substr(sessionId,6,2)`
          )
          .all()
          .map((x: any) => String(x['round']));

        for (const round of rounds) {
          const sessions = db
            .prepare(
              `select substr(sessionId,9,20) as sessionAbbr from ${tableName} \
              WHERE substr(sessionId,1,4) = '${year}' AND substr(sessionId,6,2) = '${round}' \
              group by substr(sessionId,9,20)`
            )
            .all()
            .map((x: any) => String(x['sessionAbbr']));

          for (const session of sessions) {
            const name: any = db
              .prepare(
                `SELECT grandsPrix.shortName FROM events LEFT JOIN grandsPrix ON \
                  grandsPrix.id = events.grandPrixId WHERE events.id = '${year}-${round}'`
              )
              .get();

            const rows: any[] = db
              .prepare(
                `SELECT * FROM ${tableName} WHERE sessionId = '${year}-${round}-${session}' ORDER BY positionOrder`
              )
              .all();

            await exportRowsToCSV({
              rows,
              dir: path.resolve(
                csvDirectory,
                'seasons',
                year.toFixed(0),
                `${round} - ${name['shortName']}`
              ),
              fileName: session + ' - Results'
            });
          }
        }
      }

      // Finish with the results tables
      continue;
    }

    const rows: any[] = db.prepare(`SELECT * FROM ${tableName}`).all();

    if (rows.length === 0) {
      console.log(
        pc.yellow('[WARN]: ') +
          `Table "${tableName}" is empty. Skipping export.`
      );
      continue;
    }

    await exportRowsToCSV({ rows, dir: csvDirectory, fileName: tableName });
  }

  return;
}

async function exportRowsToCSV(params: {
  rows: any[];
  dir: string;
  fileName: string;
}) {
  if (!fs.existsSync(params.dir)) {
    fs.mkdirSync(params.dir, {
      recursive: true
    });
  }

  const filepath = path.resolve(params.dir, params.fileName + '.csv');

  fs.writeFileSync(
    filepath,
    await json2csv(params.rows, { emptyFieldValue: '' }),
    {
      flag: 'w+'
    }
  );

  console.log(
    pc.green('[OK]: ') +
      `Export to ${path.relative(__dirname, filepath)} with success!`
  );
}
