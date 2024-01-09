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

  for (const tableName of tableNames) {
    console.log('');
    console.log(pc.blue('[INFO]: ') + `Exporting table "${tableName}"...`);

    if (
      tableName.toLowerCase().indexOf('results') > -1 ||
      tableName == 'pitStops' ||
      tableName == 'lapTimes'
    ) {
      const years = (
        db
          .prepare(
            `select substr(sessionId,1,4) as year from ${tableName} group by substr(sessionId,1,4)`
          )
          .all() as object[]
      ).map((x) => Number(x['year']));

      for (const year of years) {
        const rounds = (
          db
            .prepare(
              `select substr(sessionId,6,2) as round from ${tableName} WHERE substr(sessionId,1,4) = '${year}' group by substr(sessionId,6,2)`
            )
            .all() as object[]
        ).map((x) => String(x['round']));

        for (const round of rounds) {
          const sessions = (
            db
              .prepare(
                `select substr(sessionId,9,20) as sessionAbbr from ${tableName} \
              WHERE substr(sessionId,1,4) = '${year}' AND substr(sessionId,6,2) = '${round}' \
              group by substr(sessionId,9,20)`
              )
              .all() as object[]
          ).map((x) => String(x['sessionAbbr']));

          for (const session of sessions) {
            const name = db
              .prepare(
                `SELECT grandsPrix.shortName FROM events LEFT JOIN grandsPrix ON \
                  grandsPrix.id = events.grandPrixId WHERE events.id = '${year}-${round}'`
              )
              .get() as object;

            // Final select to get the rows regarding a session:
            const rows = db
              .prepare(
                `SELECT * FROM ${tableName} WHERE sessionId = '${year}-${round}-${session}' ORDER BY ${
                  tableName.toLowerCase().indexOf('results') > -1
                    ? 'positionOrder'
                    : 'lap'
                }`
              )
              .all() as object[];

            await exportRowsToCSV({
              // Remove the session info since it will be present in the directory.
              // Should be added manually from the directory when importing again
              rows: rows.map((e) =>
                omitAttributesFromObject(e as any, ['sessionId'])
              ),
              dir: path.resolve(
                csvDirectory,
                'seasons',
                year.toFixed(0),
                `${round} - ${name['shortName']}`
              ),
              fileName: `${session} - ${
                tableName == 'lapTimes'
                  ? 'Lap times'
                  : tableName == 'pitStops'
                  ? 'Pit stops'
                  : 'Results'
              }`
            });
          }
        }
      }

      // Finish with the tables that are relative to a session
      continue;
    }

    const rows = db.prepare(`SELECT * FROM ${tableName}`).all();

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

function omitAttributesFromObject<Data extends object, Keys extends keyof Data>(
  data: Data,
  keys: Keys[]
): Omit<Data, Keys> {
  const result = { ...data };

  for (const key of keys) {
    delete result[key];
  }

  return result as Omit<Data, Keys>;
}

async function exportRowsToCSV(params: {
  rows: unknown[] | object[];
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await json2csv(params.rows as any[], { emptyFieldValue: '' }),
    {
      flag: 'w+'
    }
  );

  console.log(
    pc.green('[OK]: ') +
      `Export to ${path.relative(__dirname, filepath)} with success!`
  );
}
