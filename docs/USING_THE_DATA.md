# Using the RaceDex data

The same data is available in three forms. Pick the one that fits what you are doing:

| You want to...                                  | Use                     |
| ----------------------------------------------- | ----------------------- |
| Build a website or app                          | [REST API](#rest-api)   |
| Run your own queries, joins and aggregations    | [SQLite](#sqlite)       |
| Load it in Excel, pandas, R or a notebook       | [CSV files](#csv-files) |

Whatever you choose, read [License and attribution](#license-and-attribution) and [How complete is the data?](#how-complete-is-the-data) first.

## REST API

### Get it running

There is no public hosted instance yet, so you run the API yourself. You need [Node.js](https://nodejs.org/en/download/) 22 or newer.

```bash
git clone https://github.com/enrique-lozano/RaceDex-API.git
cd RaceDex-API
npm install
npm run dev
```

On the first run the SQLite database is built from the CSV files (a few seconds). Then:

- Open <http://localhost:3200/api/drivers/sutil> in your browser to see a response.
- Open <http://localhost:3200/api/docs> to browse every endpoint with Swagger and try them from the page.

Optional environment variables: `PORT` (default `3200`), `RACEDEX_DB_PATH` (default `data/db/racedex.db`) and `RACEDEX_DATA_DIR` (default `data`).

### Conventions

- **Base path**: every endpoint starts with `/api`.
- **Times** (laps, pit stops, race time) are in **milliseconds**: `93996` is 1:33.996.
- **Pagination**: lists return `{ totalElements, pageSize, currentPage, data }`. Use `pageSize` and `pageNo` (starts at 0).
- **Sorting and filtering**: list endpoints accept `sort` and filters such as `name`, `season` or `circuitId`. The exact list of each endpoint is in Swagger.
- **Related objects**: many endpoints accept `include` to embed related data in the response instead of returning only ids.
- **Language**: country names are translated on the fly. Add `?locale=es` (any [BCP 47](https://www.rfc-editor.org/info/bcp47) tag) to get them in another language. The default is `en`.
- **CORS** is enabled for any origin (`GET`, `HEAD` and `OPTIONS`), so a website can call the API directly from the browser.
- **Identifiers** are readable slugs (`silverstone-2010`, `max-verstappen`). A race weekend is `{season}-{round}` (`2023-01`) and a session adds its type: `2023-01-R`. In URLs, the session is the last part: `/sessions/2023/1/R`.
- **Session codes**: `FP1`, `FP2`, `FP3`, `Q1`, `Q2`, `Q3` and `R` (race).

### Recipes

| Question                                          | Request                                           |
| ------------------------------------------------- | ------------------------------------------------- |
| Which seasons are available?                      | `GET /api/seasons`                                |
| Find a driver by name                             | `GET /api/drivers?name=hamilton`                  |
| Career stats of a driver                          | `GET /api/drivers/{driverId}/stats`               |
| Results of a driver in one season                 | `GET /api/drivers/{driverId}/results?season=2023` |
| The calendar of a season                          | `GET /api/events?season=2023`                     |
| One race weekend, with its circuit                | `GET /api/events/2023/1`                          |
| Classification of a race                          | `GET /api/sessions/2023/1/R/results`              |
| Who set the fastest lap?                          | `GET /api/sessions/2023/1/R/fastest-lap`          |
| Every lap of a race                               | `GET /api/sessions/2023/1/R/laps`                 |
| Pit stops of a race                               | `GET /api/sessions/2023/1/R/pit-stops`            |
| Drivers' standings of a season                    | `GET /api/championships/2023/drivers`             |
| Constructors' standings of a season               | `GET /api/championships/2023/constructors`        |
| Wins, poles and podiums at a circuit              | `GET /api/circuits/{circuitId}/records`           |
| The layouts of a circuit                          | `GET /api/circuit-layouts?circuitId={circuitId}`  |
| The shape of a layout, ready to draw on a map     | `GET /api/circuit-layouts/{layoutId}/geometry`    |
| Tyre stints, weather and safety cars              | `GET /api/stints`, `/api/weather`, `/api/race-neutralisations` |

Find the ids you need with the list endpoints (`/api/drivers`, `/api/circuits`...). For example, the fastest lap of the 2023 Bahrain GP answers (trimmed):

```json
{
  "position": 16,
  "lap": 56,
  "time": 93996,
  "entry": {
    "id": "2023-ZHO",
    "entrantName": "Alfa Romeo F1 Team ORLEN",
    "driver": { "id": "zhou", "name": "Guanyu Zhou" }
  }
}
```

The geometry endpoint returns [GeoJSON](https://geojson.org/), so it works as it is with Leaflet, Mapbox, MapLibre or any GIS tool.

## SQLite

The database is what the API reads, so it has everything, in a form that is easy to join. It is not stored in git: it is created the first time you start the server or run `npm run import-db`, at `data/db/racedex.db`.

Open it with any SQLite client ([SQLite Studio](https://sqlitestudio.pl/), DBeaver, the `sqlite3` CLI, `sqlite3` in Python...). The [database diagram](database.svg) shows every table and how they relate; the structure is in [`data/schema.sql`](../data/schema.sql), whose comments explain each column.

The core of it: an **event** (race weekend) has **sessions**; the results, lap times and pit stops of a session point to an **entry** (a driver in a car configuration), which points to the driver, the team, the chassis and the engine.

Wins of each driver (all-time top 5):

```sql
SELECT d.name, COUNT(*) AS wins
FROM raceResults r
JOIN entries e ON e.id = r.entryId
JOIN drivers d ON d.id = e.driverId
WHERE r.positionText = '1'
GROUP BY d.id
ORDER BY wins DESC
LIMIT 5;
```

Fastest lap of every 2023 race (milliseconds):

```sql
SELECT s.eventId, MIN(l.time) AS fastestLap
FROM lapTimes l
JOIN sessions s ON s.id = l.sessionId
WHERE s.eventId LIKE '2023-%' AND s.abbreviation = 'R'
GROUP BY s.eventId;
```

Notes:

- The Constructors' Championship is not stored: it is calculated from the race results (`pointsCountForWCC` marks the results that do not score for it).
- A driver that was entered but did not take part in a race still has a row in `raceResults`, with a code in `positionText` (`DNS`, `DNQ`, `WD`...). Filter on `positionText` if you only want the ones that started.

## CSV files

The CSV files in [`data/csv`](../data/csv) are the source of truth: the database is built from them. They are plain UTF-8 text, so they open anywhere.

- One file per table in the root (`drivers.csv`, `circuits.csv`, `entries.csv`...).
- The big tables are split **per session**: `data/csv/seasons/<year>/<round> - <GP name>/<session> - <Results|Lap times|Pit stops|Stints>.csv`. The `sessionId` column is not stored there, it comes from the path (`2023-01-R`).

Reading everything in pandas:

```python
import pandas as pd
from pathlib import Path

drivers = pd.read_csv("data/csv/drivers.csv")
laps = pd.concat(
    pd.read_csv(f).assign(sessionId=f.parent.name)
    for f in Path("data/csv/seasons").glob("*/*/R - Lap times.csv")
)
```

If you prefer SQL, import the database once and query it instead: it is faster and the foreign keys are already checked.

> Use LibreOffice rather than Excel to open the files: Excel tends to alter encodings and date formats.

## How complete is the data?

It is not equally detailed for every era: some sessions did not exist in the past, and lap times and pit stops were not recorded until much later.

| Period | Race results | Qualifying | Practice | Lap times | Pit stops |
| ------ | ------------ | ---------- | -------- | --------- | --------- |
| 1950s  | 🟢 100%      | 🟢 100%    | ⚪ 0%    | ⚪ 0%     | ⚪ 0%     |
| 1980s  | 🟢 100%      | 🟢 100%    | 🟠 22%   | ⚪ 0%     | ⚪ 0%     |
| 1990s  | 🟢 100%      | 🟢 100%    | 🟢 100%  | 🟠 40%    | 🟡 59%    |
| 2010s  | 🟢 100%      | 🟢 100%    | 🟢 100%  | 🟢 100%   | 🟢 100%   |

The percentage is the share of Grands Prix of the period that have that kind of data. The full report, season by season, is in [`data/COVERAGE.md`](../data/COVERAGE.md). Stints, weather and race neutralisations are optional per race (see [Contributing data](CONTRIBUTING_DATA.md#optional-per-race-weather-neutralisations-and-stints)). The terms used in the API (layout, corner, sector, neutralisation...) are defined in the [glossary](GLOSSARY.md).

## License and attribution

- The **data** is licensed under [CC BY-NC-SA 4.0](../DATA_LICENSE.md): you can share and adapt it, you must give credit, you cannot use it commercially, and what you build from it must use the same license.
- The **code** is licensed under [GNU AGPL v3](../LICENSE).

Suggested attribution:

> Data from [RaceDex](https://github.com/enrique-lozano/RaceDex-API), licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

The sources the data comes from are listed in [`data/SOURCES.md`](../data/SOURCES.md).
