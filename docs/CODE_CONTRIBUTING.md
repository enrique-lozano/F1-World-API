# Contributing code to RaceDex API

How to set up the project, make a change and send it. If you only want to fix data, see [Contributing data](CONTRIBUTING_DATA.md) instead: no code needed.

## 1. Fork and run the project

[Fork the repo](https://docs.github.com/en/get-started/quickstart/fork-a-repo), clone your fork and [run the API](USING_THE_DATA.md#get-it-running) to check that everything works. You need Node.js 22 or newer.

Any editor works, but the repo ships the configuration for Visual Studio Code, including the recommended extensions (type `@recommended` in the extensions panel) and the settings of the Conventional Commits extension.

## 2. Choose what to do

Look at the [open issues](https://github.com/enrique-lozano/RaceDex-API/issues), pick one that is not assigned and leave a comment so others know you are on it. You can also:

- open an issue about something you want to work on;
- send a pull request without an issue;
- improve the documentation, review the historical data or help with translations: these usually have no issue.

## 3. Create a branch

Create it from `develop`, named `fix/<issue or short name>` or `feature/<short name>`:

```bash
git checkout -b fix/1234 develop
```

| Branch                   | Purpose                                                     | Protected |
| ------------------------ | ----------------------------------------------------------- | --------- |
| `main`                   | Released code. Only accepts merges from `develop`           | Yes       |
| `develop`                | Accepts pull requests from the working branches             | Yes       |
| `feature/xxx`, `fix/xxx` | Your work. Starts from `develop` and is deleted once merged | No        |

Administrators may commit documentation and CI changes directly to `main`. Everyone else sends a pull request.

## 4. Commit

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>(<scope>): <Short summary>
```

- **type**: `build`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor` or `test`. You will mostly use `fix` and `feat`.
- **scope**: one of the ones in [`VALID_COMMIT_SCOPES.ts`](VALID_COMMIT_SCOPES.ts) (`data`, `security`). It is optional.
- **summary**: present tense, **starts with an uppercase letter**, no period at the end.

Example: `fix(data): Correct the fastest lap of the 2019 Italian GP`.

[Husky](https://github.com/typicode/husky) runs the type, lint and format checks before each commit and validates the message, so commits and pushes can take a few seconds. If your messages do not follow the convention, we will squash your commits into one with a proper message: it is not a reason to worry.

## 5. Open a pull request to `develop`

Push your branch and open a [pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork) with **`develop`** as the base. Pull requests to `main` will be changed to `develop` or rejected. Run `npm test`, `npm run lint` and `npm run typecheck` first.

## Project reference

### Project structure

```
src/             API code (controllers, services, models). Each module = one resource
data/            Schema, CSV files (source of truth) and import/export scripts
generators/      Python scripts used to fetch/update data (results, laps, pit stops...)
docs/            Guides, glossary and architecture decisions
```

### Scripts

| Script                                    | What it does                                                                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                             | Starts the server with auto-reload                                                                                        |
| `npm run build` / `npm start`             | Compiles to `dist/` / runs the compiled server                                                                            |
| `npm test`                                | Runs the tests (creates the database first if it does not exist)                                                          |
| `npm run lint` / `npm run typecheck`      | ESLint / TypeScript checks                                                                                                |
| `npm run format` / `npm run format:check` | Formats the code and docs / checks that they are formatted                                                                |
| `npm run swagger`                         | Regenerates `src/routes.ts` and `src/swagger.json` from the controllers (done automatically by `dev`, `build` and `test`) |
| `npm run import-db`                       | Rebuilds the database from `data/csv`                                                                                     |
| `npm run export-db`                       | Writes the database back to `data/csv`                                                                                    |
| `npm run set-driver-photos`               | Updates the `photo` column of `drivers.csv`                                                                               |
| `npm run docs:db`                         | Regenerates the database diagram (`docs/database.svg`, `docs/database.dbml`)                                              |
| `npm run docs:coverage`                   | Regenerates the data coverage report (`data/COVERAGE.md`)                                                                 |

### Files that are generated

These are not stored in git, they are created for you when needed:

- `data/db/racedex.db`: the database. Created on the first start, or with `npm run import-db`.
- `src/routes.ts` and `src/swagger.json`: generated by [tsoa](https://tsoa-community.github.io/docs/) from the controllers.
- `dist/`: compiled code.

### Changing the database

- Define the table in [`data/schema.sql`](../data/schema.sql). The comments are documentation: a comment at the end of a column line is the note of that column, and the comment lines right above `DROP TABLE IF EXISTS <table>;` are the note of the table. A simple `CHECK (<column> IN ('A', 'B'))` becomes an enum.
- Add the table to [`data/constants.ts`](../data/constants.ts). The order matters: parents must come before the tables that reference them.
- Add its indexes to [`data/indexes.sql`](../data/indexes.sql), which are created after the rows are loaded. Foreign key columns must use the same type and `COLLATE` as the column they reference, otherwise SQLite cannot use their index in joins.
- The import disables foreign keys while loading and runs a `foreign_key_check` at the end, printing a warning if some row references a missing parent.
- Regenerate the diagram: `npm run import-db && npm run docs:db`. After adding data, regenerate the coverage with `npm run docs:coverage`.

### Formatting and line endings

Files use LF line endings on every system (Windows included): `.gitattributes` and `.editorconfig` take care of it, so there is no need to set `core.autocrlf`. Prettier formats the staged files on every commit (`lint-staged`), and the commit also runs ESLint on them and the type check.

### Generators

The Python scripts in [`generators/`](../generators/README.md) fetch new races as they take place.

### Decisions

Why some things are the way they are is recorded in [`adr/`](adr). The terms are defined in the [glossary](GLOSSARY.md).
