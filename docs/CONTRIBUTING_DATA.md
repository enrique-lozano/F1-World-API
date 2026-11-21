# Contributing data

Found a wrong lap time, a missing result or a driver with the wrong nationality? You can fix it without programming. The data is stored as plain CSV files in this repository, and every change is reviewed in a pull request.

## 1. See the data

- **In the API**: run it locally ([instructions](USING_THE_DATA.md#get-it-running)) and open <http://localhost:3200/api/docs> to try every endpoint, or paste a URL such as <http://localhost:3200/api/drivers/sutil> in your browser.
- **As a diagram**: [`database.svg`](database.svg) shows every table and how they relate. The source is [`database.dbml`](database.dbml), which you can paste in [dbdiagram.io](https://dbdiagram.io) to explore it.
- **In the database**: open `data/db/racedex.db` with [SQLite Studio](https://sqlitestudio.pl/) or any SQLite client.
- **On GitHub**: browse [`data/csv`](../data/csv) directly. The `.geojson` files in [`data/tracks`](../data/tracks) are drawn as maps.
- **What is missing**: [`data/COVERAGE.md`](../data/COVERAGE.md) shows which kinds of data exist for each season, and which circuit layouts still have no shape.

## 2. Fix or add data

1. [Fork the repo](https://docs.github.com/en/get-started/quickstart/fork-a-repo) and create a branch (`fix/<short-description>`).
2. Find the file to edit ([where is each data?](#where-is-each-data)). Open it with LibreOffice or a text editor: avoid Excel, which tends to alter encodings and date formats.
3. Rebuild the database to check that your change is valid:

   ```bash
   npm install
   npm run import-db
   ```

   The import is atomic: it is built in a temporary file and replaces the real database only if everything succeeded, so a mistake in a CSV never leaves you with a broken database. It reports errors for rows that point to something that does not exist (a driver, an entry, a layout...).

4. Run the API (`npm run dev`) and check that the change shows up as you expect.
5. Open a pull request. Say which source you used to verify the change: it helps the review a lot. Data changes use the `data` scope in the commit message (`fix(data): Correct Sutil's date of birth`).

If you edit the database directly instead (for example with SQLite Studio), write your changes back to CSV, because the database is not stored in git:

```bash
npm run export-db
```

It only rewrites the files whose content actually changed, so `git status` shows exactly what you modified.

## Where is each data?

| I want to fix...                              | File (in `data/csv/`)                                                       |
| --------------------------------------------- | --------------------------------------------------------------------------- |
| A driver (name, birth, nationality, photo)    | `drivers.csv`                                                               |
| Family relationships between drivers          | `driversFamilyRelationships.csv`                                            |
| A team, its sales and renames                 | `entrants.csv`, `entrantSuccessions.csv`, `entrantSeasons.csv`              |
| A chassis, engine or constructor              | `chassis.csv`, `engines.csv`, `engineManufacturers.csv`, `constructors.csv` |
| Who raced for which team (and with which car) | `entries.csv`                                                               |
| A race weekend (name, laps, layout)           | `events.csv`                                                                |
| A Grand Prix (the recurring event)            | `grandsPrix.csv`                                                            |
| A circuit or one of its layouts               | `circuits.csv`, `circuitLayouts.csv`                                        |
| The shape of a layout                         | `data/tracks/<circuitLayoutId>.geojson`                                     |
| Race, qualifying or practice results          | `seasons/<year>/<round> - <GP>/<session> - Results.csv`                     |
| Lap times                                     | `seasons/<year>/<round> - <GP>/R - Lap times.csv`                           |
| Pit stops                                     | `seasons/<year>/<round> - <GP>/R - Pit stops.csv`                           |
| Tyre stints                                   | `seasons/<year>/<round> - <GP>/R - Stints.csv`                              |
| Weather, safety cars, red flags               | `weatherPeriods.csv`, `raceNeutralisations.csv`                             |
| Why a driver retired, and result codes        | `retirementReasons.csv`, `resultStatuses.csv`                               |

The big tables are split **per session**. The `sessionId` column is not stored in those files: it is deduced from the path (`2023-01-R`). The photos of the drivers are not in this repository but in [racedex-assets](https://github.com/enrique-lozano/racedex-assets) (see [Photos of the drivers](#photos-of-the-drivers)).

The terms used below (entrant, layout, neutralisation...) are defined in the [glossary](GLOSSARY.md).

## Rules to follow when editing

### Teams, constructors, chassis and engines

- An **entrant** (`entrants`) is who registers and runs the cars: the "team". Its identity lasts for the whole history, and a sale or rename creates a new entrant linked in `entrantSuccessions`. Per-season facts (own constructor, licence nationality) are in `entrantSeasons`.
- A **constructor** (`constructors`) designs the chassis (`chassis`). A team can race the chassis of another constructor.
- An **entry** (`entries`) is a driver in a car configuration: entrant season, registered name (`entrantName`, sponsors included), chassis, engine (`engines`, with who built it) and, if the engine is rebadged, its brand (`engineBrandId`). The results of every session refer to an entry.
- The `id` of an entry is `{season}-{ABBR}`: the season and the 3-letter abbreviation of the driver (`2023-ALO`). The car number is added when the driver used several that season or another driver of that season shares the abbreviation (`1950-CHI-47`), and a letter when the rest is still the same, for example another chassis (`1961-GRE-14-a`).

### Race results of the drivers that did not start

Every driver entered for a race has a row in its `R - Results.csv`, also the ones that did not take the start. `positionText` is then one of the codes of [`resultStatuses.csv`](../data/csv/resultStatuses.csv) instead of a position:

| Code   | Meaning                                                                                     |
| ------ | ------------------------------------------------------------------------------------------- |
| `DNS`  | Did not start: was due to start and did not (for example, a failure on the way to the grid) |
| `DNQ`  | Did not qualify                                                                             |
| `DNPQ` | Did not pre-qualify                                                                         |
| `EX`   | Excluded                                                                                    |
| `DNP`  | Did not practice                                                                            |
| `WD`   | Withdrawn by the team or the driver before the race, also after practice or qualifying      |
| `DNA`  | Did not arrive                                                                              |

They go after the drivers that took the start, in that order, and the non-qualifiers by their qualifying time. A test driver (third, reserve or Friday driver) has `testDriver` = 1 in his entry and no race row: the API gives him `TD` in those GPs.

The Constructors' Championship is not stored: it is calculated from the race results (`pointsCountForWCC` marks the results that do not score for it).

### Circuits and layouts

A circuit (`circuits.csv`) is the venue; each of its configurations is a layout (`circuitLayouts.csv`), and every event points to the layout that was raced (`events.circuitLayoutId`). A new layout is needed when the race lap changes, that is, its length or its sequence of corners: a new chicane, a shortened lap, an oval versus the road course. Changes of kerbs, asphalt or corner names are not new layouts. A layout that comes back after some years is the same row.

The length is a hint, not the test: a few metres of difference between sources is not a new layout, and two consecutive layouts can have the same length and corners (Zandvoort 1973-78 and 1979). The decided cases, and the ones that are not, are in [ADR 0001](adr/0001-circuit-layouts.md).

The layout `id` is `<circuitId>-<first season it was used>` (`silverstone-2010`), and `name` is only filled when the layout is known by one (`Nordschleife`). `length` is in metres. The import fails if a layout has no events, and warns if its id does not have the first season it was raced.

### Track shapes

The shape of a layout is optional and lives in `data/tracks/<circuitLayoutId>.geojson` (see [ADR 0002](adr/0002-track-geometry-as-geojson-files.md)); GitHub draws it as a map. Each file is a `FeatureCollection` of WGS84 `[longitude, latitude]` points with:

- exactly one `Feature` with `properties.kind: "track"`: a closed `LineString`, in the direction of the race when the layout has a `direction`;
- optionally, one `Feature` with `properties.kind: "pit-lane"`: a `LineString` from the pit entry to the pit exit;
- optionally, the ends of the sectors 1 and 2: one `Feature` each with `properties.kind: "sector"`, `sector: 1` or `2`, and a `Point` on the track. They are valid for every season the layout was raced; if the timing lines moved, give each point the seasons it applies to with `from` and/or `until`;
- optionally, for the layouts raced from 1994 (when the pit speed limit started), `pit-limit-start` and `pit-limit-end`: a `Point` each, on the pit lane, where the speed limit begins and ends;
- optionally, the corners: one `Feature` each with `properties.kind: "corner"`, a `number` (as in the official track map) and, if it has one, a `name`, and a `Point` on the apex of the corner.

The first point of the `track` is the start line only when its `properties` say `"startLine": true`; then the import derives the distances of the corners and of the sectors from it along the track, in the direction of the race (tables `circuitLayoutCorners` and `circuitLayoutSectors`, not CSV files), and fails if one of those points is more than 20 m from the track. Sector 3 ends at the start line, so only the ends of sectors 1 and 2 are stored.

Keep the points sparse (a point every 30-40 m is enough, a few KB per file). `npm run import-db` loads the files and fails if:

- a file does not belong to a layout, or is malformed;
- the length of its track differs more than 5% from the `length` of the layout;
- the track is more than 1 km from the `latitude`/`longitude` of its circuit;
- it has corners and they are not as many as the `turns` of the layout (numbered from 1 to `turns`).

The layouts still without a shape, and which to draw first, are in [`data/COVERAGE.md`](../data/COVERAGE.md).

### Optional per race: weather, neutralisations and stints

These tables are optional per race: a race without them keeps all its other data. Their time axis is the **leader's lap** (not the clock), so they join with `lapTimes` and `pitStops` and work for races whose only known time is the date. Lap 0 is "before the first lap".

- `weatherPeriods.csv`: the weather of a race session as ranges of laps, storing only the changes. The row with `lapStart` 1 always exists and describes the start of the race (`weather`: `CLEAR`, `PARTLY_CLOUDY`, `CLOUDY`, `SHOWERS`, `LIGHT_RAIN`, `HEAVY_RAIN`). The temperatures are optional (Celsius).
- `raceNeutralisations.csv`: every interruption of the pace of a race, ordered inside its session. `SAFETY_CAR` is a pace car that bunches the field (it covers the full-course caution of other series); `FULL_COURSE_YELLOW` is the virtual safety car and its equivalents (everybody slows down, no pace car); `RED_FLAG` stops the race. `lapEnd` is the lap on which racing resumes (for a safety car, the lap after the one in which it comes in). The virtual safety cars exist only for 2022 and 2023, and the safety cars and red flags of 2023 come from the race control messages, so some `lapEnd` are empty.
- `seasons/<year>/<round> - <GP>/R - Stints.csv`: the sets of tyres of each driver: `stint`, `lapStart` (the end is the start of the next stint minus 1), `compound` (relative to the dry compounds of the weekend: `SOFT` is the softest; with two dry compounds they are `SOFT` and `HARD`) and `tyreAge` (laps already done when it started). Only loaded when the compound is known (2022 and 2023 so far).

### Photos of the drivers

The `photo` column of `drivers.csv` has the URL of the image of each driver, or is empty if there is none. The images are in [racedex-assets](https://github.com/enrique-lozano/racedex-assets) and served with GitHub Pages. When they change, update the column and import the CSV files again:

```bash
npm run set-driver-photos
npm run import-db
```

The script asks GitHub which images exist. Use `npm run set-driver-photos -- --dir <path to a local copy of racedex-assets>` to read them from disk instead.

## Sources

Say where a correction comes from in your pull request. The sources we already use, and their licenses, are in [`data/SOURCES.md`](../data/SOURCES.md). Do not copy data from a source with a license that does not allow it: race results and lap times are facts, but the way some sites present them is protected. If in doubt, ask in the pull request.

## Other ways to help

- **Report a problem** you cannot fix yourself in the [issues](https://github.com/enrique-lozano/RaceDex-API/issues).
- **Add data for a season that has none** (practice sessions of the 80s, lap times before 1996...). Check [`data/COVERAGE.md`](../data/COVERAGE.md) for the gaps.
- **Add a new table or column** to the database. This is a code change: see [Contributing code](CODE_CONTRIBUTING.md).
