import csvParser from 'csv-parser';
import fs from 'fs';
import { json2csv } from 'json-2-csv';
import path from 'path';
import pc from 'picocolors';
import { csvDirectory } from './constants';

/**
 * Fills the `photo` column of `csv/drivers.csv` with the URL of the image of
 * each driver (`<base URL>/drivers/<driverId>.webp`), or leaves it empty if the
 * driver has no image. The images live in their own repository:
 * https://github.com/enrique-lozano/racedex-assets
 *
 * By default it asks GitHub which images the repository has. With
 * `--dir <path>` it looks at the `drivers` folder of a local copy instead.
 * Run `npm run import-db` afterwards.
 *
 * Environment variables:
 * - `RACEDEX_ASSETS_BASE_URL`: where the images are served from
 * - `RACEDEX_ASSETS_REPO`: `owner/name` of the repository, for the GitHub request
 * - `GITHUB_TOKEN`: optional, to avoid the rate limit of the GitHub API
 */
const baseUrl = (
  process.env['RACEDEX_ASSETS_BASE_URL'] ??
  'https://enrique-lozano.github.io/racedex-assets'
).replace(/\/$/, '');
const assetsRepo =
  process.env['RACEDEX_ASSETS_REPO'] ?? 'enrique-lozano/racedex-assets';
const driversCsv = path.join(csvDirectory, 'drivers.csv');

const info = (msg: string) => console.log(pc.blue('[INFO]: ') + msg);
const ok = (msg: string) => console.log(pc.green('[OK]: ') + msg);

/** Ids of the drivers that have an image in a local copy of the repository */
function idsFromDirectory(directory: string) {
  return new Set(
    fs
      .readdirSync(path.join(directory, 'drivers'))
      .filter((file) => file.endsWith('.webp'))
      .map((file) => path.basename(file, '.webp'))
  );
}

/** Ids of the drivers that have an image in the repository, according to GitHub */
async function idsFromGithub() {
  const response = await fetch(
    `https://api.github.com/repos/${assetsRepo}/git/trees/main?recursive=1`,
    {
      headers: {
        'User-Agent': 'racedex-api',
        ...(process.env['GITHUB_TOKEN'] && {
          Authorization: `Bearer ${process.env['GITHUB_TOKEN']}`
        })
      }
    }
  );
  if (!response.ok) {
    throw new Error(
      `GitHub answered ${response.status} ${response.statusText}`
    );
  }

  const { tree, truncated } = (await response.json()) as {
    tree: { path: string }[];
    truncated: boolean;
  };
  if (truncated) throw new Error('GitHub truncated the list of files');

  return new Set(
    tree
      .map((entry) => /^drivers\/([^/]+)\.webp$/.exec(entry.path)?.[1])
      .filter((id): id is string => !!id)
  );
}

function readCsv(filepath: string) {
  return new Promise<Record<string, string>[]>((resolve, reject) => {
    const rows: Record<string, string>[] = [];
    fs.createReadStream(filepath)
      .pipe(csvParser())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function setDriverPhotos() {
  const dirIndex = process.argv.indexOf('--dir');
  const directory = dirIndex > -1 ? process.argv[dirIndex + 1] : undefined;
  if (dirIndex > -1 && !directory) throw new Error('--dir needs a path');

  info(
    directory
      ? `Looking at the images of ${directory}`
      : `Asking GitHub for the images of ${assetsRepo}`
  );
  const available = directory
    ? idsFromDirectory(directory)
    : await idsFromGithub();

  const rows = await readCsv(driversCsv);
  for (const row of rows) {
    row['photo'] = available.has(row['id'])
      ? `${baseUrl}/drivers/${row['id']}.webp`
      : '';
  }

  const content = json2csv(rows, { emptyFieldValue: '' });
  if (fs.readFileSync(driversCsv, 'utf8') === content) {
    ok('drivers.csv is already up to date');
    return;
  }

  fs.writeFileSync(driversCsv, content);
  const withPhoto = rows.filter((row) => row['photo']).length;
  ok(`${withPhoto} of ${rows.length} drivers have a photo`);
  info('Run `npm run import-db` to update the database');
}

setDriverPhotos().catch((err) => {
  console.error(pc.red('[ERROR]: ') + 'Could not set the photos', err);
  process.exit(1);
});
