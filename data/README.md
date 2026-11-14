# RaceDex database

This directory is the hub of the API data. The data exists in two forms:

| Form      | Location        | In git? | Purpose                              |
| --------- | --------------- | ------- | ------------------------------------ |
| CSV files | `csv/`          | ✅ Yes  | Source of truth, easy to review/diff |
| SQLite DB | `db/racedex.db` | ❌ No   | What the API actually reads          |

The data is licensed under [CC BY-NC-SA 4.0](../DATA_LICENSE.md).

## CSV files

Files in `csv/` can be edited with any spreadsheet program (LibreOffice is recommended over Excel, which tends to alter encodings and date formats).

- One file per table (`drivers.csv`, `circuits.csv`, ...) in the root of `csv/`.
- Tables with many rows are split **per session** in
  `csv/seasons/<year>/<round> - <GP name>/<session> - <Results|Lap times|Pit stops>.csv`.
  The `sessionId` column is not stored in those files: it is deduced from the path (`2023-01-R`).

After editing the CSV files, rebuild the database to see the changes in the API:

```bash
npm run import-db
```

The import is atomic: the database is built in a temporary file and replaces the real one only if everything succeeded, so a mistake in a CSV never leaves you with a broken database.

## The database

`db/racedex.db` does not exist in a fresh clone. It is created automatically the first time you start the server (or run the tests), or manually with `npm run import-db`. The structure is defined in [`schema.sql`](schema.sql).

If you modify the database directly (for example with [SQLite Studio](https://sqlitestudio.pl/)), export your changes back to CSV, since the database is not stored in git:

```bash
npm run export-db
```

The export only rewrites the files whose content actually changed, so `git status` shows exactly what you modified.

## Database diagram

<img src="../docs/database.svg" alt="Database diagram">

The diagram ([`docs/database.svg`](../docs/database.svg)) and its source ([`docs/database.dbml`](../docs/database.dbml)) are generated from the database. Regenerate them after changing `schema.sql`:

```bash
npm run import-db && npm run docs:db
```

The `.dbml` file can also be pasted into [dbdiagram.io](https://dbdiagram.io) to explore or publish it.

## Teams, constructors, chassis and engines

- An **entrant** (`entrants`) is who registers and runs the cars: the "team". Its identity lasts for the whole history, and a sale or rename creates a new entrant linked in `entrantSuccessions`. Per-season facts (own constructor, licence nationality) are in `entrantSeasons`.
- A **constructor** (`constructors`) designs the chassis (`chassis`). A team can race the chassis of another constructor.
- An **entry** (`entries`) is a driver in a car configuration: entrant season, registered name (`entrantName`, sponsors included), chassis, engine (`engines`, with who built it) and, if the engine is rebadged, its brand (`engineBrandId`). The results of every session refer to an entry. Its id is `{season}-{ABBR}`, the season and the 3-letter abbreviation of the driver (`2023-ALO`); the car number is added when the driver used several that season or another driver of that season shares the abbreviation (`1950-CHI-47`), and a letter when the rest is still the same, e.g. another chassis (`1961-GRE-14-a`).

## Race results of the drivers that did not start

Every driver entered for a race has a row in its `R - Results.csv`, also the ones that did not take the start. `positionText` is then one of the codes of [`resultStatuses.csv`](csv/resultStatuses.csv) instead of a position: `DNS` (did not start), `DNQ` (did not qualify), `DNPQ` (did not pre-qualify), `EX` (excluded), `DNP` (did not practice), `WD` (withdrawn, also the drivers replaced after practice) and `DNA` (did not arrive). They go after the drivers that took the start, in that order, and the non-qualifiers by their qualifying time. A test driver (only free practice) has no race row: the API calculates his `TD`.
- The Constructors' Championship is not stored: the API calculates it from the race results (`pointsCountForWCC` marks the results that do not score for it).

## Notes for maintainers

- The order of the tables in [`constants.ts`](constants.ts) matters: parents must come before the tables that reference them.
- The comments of [`schema.sql`](schema.sql) are documentation: a comment at the end of a column line is the note of that column, and the comment lines right above `DROP TABLE IF EXISTS <table>;` are the note of the table. A simple `CHECK (<column> IN ('A', 'B'))` becomes an enum. `npm run docs:db` turns all of it (plus the indexes) into `docs/database.dbml`.
- The import disables foreign keys while loading and runs a `foreign_key_check` at the end, printing a warning if some row references a missing parent.
- Indexes live in [`indexes.sql`](indexes.sql) and are created after the rows are loaded. When adding a table or a foreign key, add its index there.
- Foreign key columns must use the same type and `COLLATE` as the column they reference, otherwise SQLite cannot use their index in joins.
- Both commands are around 5s (import) and 2s (export) for ~700k rows.

Before sending a data change, read the [contributing guidelines](../CONTRIBUTING.md).
