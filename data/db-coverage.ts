import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import { csvDirectory, dataDirectory } from './constants';

/**
 * Generates `data/COVERAGE.md`: how complete the data is, per decade and per
 * season, based on which CSV files exist in `data/csv/seasons`. Run it with
 * `npm run docs:coverage` after adding or updating data.
 *
 * It only looks at which files exist, not at their content, so it is instant
 * and does not need the database.
 */

type Metric = { key: string; label: string; has: (files: string[]) => boolean };

const metrics: Metric[] = [
  {
    key: 'results',
    label: 'Race results',
    has: (f) => f.includes('R - Results.csv')
  },
  {
    key: 'quali',
    label: 'Qualifying',
    has: (f) => f.some((n) => /^(PQ|Q\d?) - Results\.csv$/.test(n))
  },
  {
    key: 'practice',
    label: 'Practice',
    has: (f) => f.some((n) => /^FP\d - Results\.csv$/.test(n))
  },
  {
    key: 'laps',
    label: 'Lap times',
    has: (f) => f.includes('R - Lap times.csv')
  },
  {
    key: 'pits',
    label: 'Pit stops',
    has: (f) => f.includes('R - Pit stops.csv')
  }
];

type Season = { year: number; races: number; counts: Record<string, number> };

function readSeasons(): Season[] {
  const seasonsDir = path.join(csvDirectory, 'seasons');
  return fs
    .readdirSync(seasonsDir)
    .filter((y) => /^\d{4}$/.test(y))
    .sort()
    .map((y) => {
      const counts = Object.fromEntries(metrics.map((m) => [m.key, 0]));
      const races = fs
        .readdirSync(path.join(seasonsDir, y), { withFileTypes: true })
        .filter((d) => d.isDirectory());
      for (const race of races) {
        const files = fs.readdirSync(path.join(seasonsDir, y, race.name));
        for (const m of metrics) if (m.has(files)) counts[m.key]++;
      }
      return { year: Number(y), races: races.length, counts };
    });
}

const pct = (n: number, total: number) =>
  total ? Math.round((n / total) * 100) : 0;

/** `▰▰▰▰▰▰▱▱▱▱ 60%` with a status circle in front */
function cell(n: number, total: number): string {
  const p = pct(n, total);
  const filled = Math.round(p / 10);
  const icon = p >= 95 ? '🟢' : p >= 50 ? '🟡' : p > 0 ? '🟠' : '⚪';
  return `${icon} ${'▰'.repeat(filled)}${'▱'.repeat(10 - filled)} ${p}%`;
}

function row(label: string, seasons: Season[]): string {
  const races = seasons.reduce((a, s) => a + s.races, 0);
  const cells = metrics.map((m) =>
    cell(
      seasons.reduce((a, s) => a + (s.counts[m.key] ?? 0), 0),
      races
    )
  );
  return `| ${label} | ${races} | ${cells.join(' | ')} |`;
}

const header = (first: string) =>
  `| ${first} | Races | ${metrics.map((m) => m.label).join(' | ')} |\n|${'---|'.repeat(metrics.length + 2)}`;

function build(seasons: Season[]): string {
  const decades = [
    ...new Set(seasons.map((s) => Math.floor(s.year / 10) * 10))
  ];
  const out: string[] = [
    '# Data coverage',
    '',
    '> Generated with `npm run docs:coverage`. Do not edit by hand.',
    '',
    'Percentage of Grands Prix of each period that have each kind of data.',
    'A low value does not always mean missing data: some sessions did not exist',
    'in the past (e.g. there was no practice timing in the 50s) and lap times and pit stops',
    'were not recorded until much later.',
    '',
    '🟢 complete (≥95%) · 🟡 mostly (≥50%) · 🟠 partial · ⚪ none',
    '',
    '## Overview',
    '',
    header('Period'),
    row(`**${seasons[0]!.year}–${seasons.at(-1)!.year}**`, seasons),
    '',
    '## By decade',
    '',
    header('Decade'),
    ...decades.map((d) =>
      row(
        `${d}s`,
        seasons.filter((s) => Math.floor(s.year / 10) * 10 === d)
      )
    ),
    '',
    '## By season',
    ''
  ];
  for (const d of [...decades].reverse()) {
    out.push(
      `<details><summary><b>${d}s</b></summary>`,
      '',
      header('Season'),
      ...seasons
        .filter((s) => Math.floor(s.year / 10) * 10 === d)
        .reverse()
        .map((s) => row(String(s.year), [s])),
      '',
      '</details>',
      ''
    );
  }
  return out.join('\n');
}

const seasons = readSeasons();
const target = path.join(dataDirectory, 'COVERAGE.md');
fs.writeFileSync(target, build(seasons));
console.log(
  pc.green(`Coverage written to ${path.relative(process.cwd(), target)}`)
);
