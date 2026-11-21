# RaceDex data

This directory holds the data of the API. It exists in two forms:

| Form      | Location        | In git? | Purpose                              |
| --------- | --------------- | ------- | ------------------------------------ |
| CSV files | `csv/`          | ✅ Yes  | Source of truth, easy to review/diff |
| SQLite DB | `db/racedex.db` | ❌ No   | What the API actually reads          |

The data is licensed under [CC BY-NC-SA 4.0](../DATA_LICENSE.md).

## What is here

| Path                         | What                                                                        |
| ---------------------------- | --------------------------------------------------------------------------- |
| `csv/`                       | One file per table, and the big tables split per session in `csv/seasons/`  |
| `tracks/`                    | The shape of each circuit layout, as GeoJSON (GitHub draws it as a map)     |
| `schema.sql`                 | The structure of the database. Its comments document every table and column |
| [`SOURCES.md`](SOURCES.md)   | Where the data comes from                                                   |
| [`COVERAGE.md`](COVERAGE.md) | How complete each kind of data is, per decade and season                    |

## Where to go next

- **Use the data** (API, SQLite, CSV): [Using the RaceDex data](../docs/USING_THE_DATA.md).
- **Fix or add data**: [Contributing data](../docs/CONTRIBUTING_DATA.md), with the format and rules of every file.
- **Database diagram**: [`docs/database.svg`](../docs/database.svg).

## The database

`db/racedex.db` does not exist in a fresh clone. It is created automatically the first time you start the server (or run the tests), or manually with `npm run import-db`. After editing the CSV files, run it again to see the changes in the API.
