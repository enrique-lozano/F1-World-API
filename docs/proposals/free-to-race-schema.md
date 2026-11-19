# Proposal: schema for stints and tyres, weather, gap per lap and race control

> Superseded by [`race-timeline-schema.md`](race-timeline-schema.md), which is implemented. Kept for the options considered.

Status: superseded by `race-timeline-schema.md` (kept as the record of the first analysis, sources and sizes of OpenF1). Origin: point 9 of `data-review/HANDOFF_CIRCUIT_LAYOUTS.md` (the replay pages of free-to-race.com).

## What we want to show

| Feature | Question the page answers |
| --- | --- |
| Stints and tyres | Which compound did each driver run, from which lap to which lap, how old were the tyres? |
| Weather | Air and track temperature, humidity, wind, rain during the race. |
| Gap per lap | How far was each driver from the leader, and from the car ahead, at the end of each lap? |
| Race control | The flags, safety cars, penalties and investigations, lap by lap. |

Scope: the data only exists for 2023 onwards (OpenF1). Everything below is optional per session, like geometries: a race without the data keeps all its normal data.

## What we already have

| Existing table / CSV | Covers | Gap |
| --- | --- | --- |
| `lapTimes` (`R - Lap times.csv`: entryId, lap, time, position) | Time and race position at the end of every lap | No gap |
| `pitStops` (`R - Pit stops.csv`: entryId, lap, time, timeOfDay, annotation) | The lap of every stop | No tyres |
| `entries.tyreManufacturerId` | The tyre brand of the car | No compound |
| `sessions` (`startDateTime`, ISO UTC), `events` | Where to hang session data | - |
| `redFlags`, `safetyCars` (per event, by lap) | Summary of two kinds of interruptions | Not a log, no flags, no penalties |
| `raceResults.timePenalty`, `gridPenalty` | Outcome of penalties | Not the message |

Two consequences:

- **Gap per lap is already in `lapTimes`.** The gap to the leader at the end of lap N is the sum of the lap times of the driver minus the sum of the leader's (the leader of that lap is the car with `position` 1). The gap to the car ahead is the same against the car with `position - 1`. No new data is needed, only a calculation (in the API or the frontend).
- **The boundaries of a stint are already in `pitStops`** (lap of the stop). What is missing is the compound and the age of the tyre, so a stint table needs very few columns.

## Sources (OpenF1, `https://api.openf1.org/v1`)

Checked with `curl` on 2023 sessions. Free, no key for history; limit of 3 requests per second. Join keys: `session_key` -> our `sessionId` (by `year` + date in `sessions`, resolved once in the import script) and `driver_number` -> our `entryId` (`entries.driverNumber` of that season; watch the drivers with several numbers or entries in a season).

| Endpoint | Rows for the 2023 Bahrain GP (race) | Fields we would use | Fills |
| --- | --- | --- | --- |
| `stints` | 70 (all drivers) | `driver_number`, `stint_number`, `lap_start`, `lap_end`, `compound` (SOFT, MEDIUM, HARD, INTERMEDIATE, WET), `tyre_age_at_start` | `stints` |
| `weather` | 161 (one per minute, from before the start) | `date`, `air_temperature`, `track_temperature`, `humidity`, `pressure`, `wind_speed`, `wind_direction`, `rainfall` (0/1) | `weather` |
| `race_control` | 75 | `date`, `lap_number`, `category` (Flag, SafetyCar, Drs, CarEvent, Other), `flag`, `scope`, `sector`, `driver_number`, `message` | `raceControlMessages` |
| `intervals` | 27 797 (a sample every few seconds, not per lap) | `gap_to_leader`, `interval` | Not stored (see gap) |
| `laps` | one per driver per lap | `date_start`, `lap_duration`, sectors, speeds | Not needed: `lapTimes` has the times; used only to cross-check |

Caveats found while checking: some endpoints answer "No results" for some sessions (`intervals`, `weather` and `race_control` returned nothing for a practice session that had other data), the lapped cars have no numeric gap, and the data of the first seasons can have holes. The import must tolerate missing data and report it, as it does for other optional data.

## Proposed tables

All are per session and live in the season folders, next to the lap times (`R - Stints.csv`, `R - Weather.csv`, `R - Race control.csv`; the `sessionId` column is deduced from the path, like in the other session files). Names follow the plural camelCase of the schema. Only the race is covered at first; the keys allow other sessions later.

### `stints`

| Column | Type | Note |
| --- | --- | --- |
| `entryId` | FK -> `entries(id)` | |
| `sessionId` | FK -> `sessions(id)` | |
| `stint` | INTEGER, > 0 | 1, 2, 3... in order |
| `lapStart` | INTEGER, > 0 | First lap on this set. `lapEnd` is not stored: it is the `lapStart` of the next stint minus 1, or `raceResults.laps` for the last one |
| `compound` | CHECK IN ('SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET') | As the tyre is called on the broadcast. NULL if unknown |
| `tyreAge` | INTEGER, >= 0 | Laps already done on the set when the stint started (0 = new). NULL if unknown |

Primary key `(entryId, sessionId, stint)`. A stint is a set of tyres between two stops (`pitStops`): a validation in the import can check that the stints of a driver match his stops, plus the changes made under a red flag, which are not in `pitStops`. No foreign key to `pitStops` (it would not hold for red-flag changes).

Reuse: `entries`, `sessions`, `pitStops` (for the check). New: one table.

### `weather`

| Column | Type | Note |
| --- | --- | --- |
| `sessionId` | FK -> `sessions(id)` | |
| `dateTime` | VARCHAR(20), ISO 8601 UTC | Same format as `sessions.startDateTime` |
| `airTemperature` | DECIMAL(4,1) | Celsius |
| `trackTemperature` | DECIMAL(4,1) | Celsius |
| `humidity` | INTEGER | % |
| `pressure` | DECIMAL(5,1) | mbar |
| `windSpeed` | DECIMAL(4,1) | m/s |
| `windDirection` | INTEGER | degrees, 0-359 |
| `rainfall` | BOOLEAN | 1 if it was raining |

Primary key `(sessionId, dateTime)`. A sample every 5 minutes is enough for a chart (see sizes). It is by time, not by lap: converting time to lap is a display matter (it can be done with `sessions.startDateTime` plus lap times).

Reuse: `sessions`. New: one table.

### `raceControlMessages`

| Column | Type | Note |
| --- | --- | --- |
| `sessionId` | FK -> `sessions(id)` | |
| `number` | INTEGER, > 0 | Order in the session (time ties make `dateTime` unusable as a key) |
| `dateTime` | VARCHAR(20), ISO 8601 UTC | |
| `lap` | INTEGER, > 0 | NULL before the start or when the source has none |
| `category` | CHECK IN ('FLAG', 'SAFETY_CAR', 'DRS', 'CAR_EVENT', 'OTHER') | Same names as the source, as an enum |
| `flag` | CHECK IN (...), NULL | GREEN, YELLOW, DOUBLE YELLOW, RED, BLUE, CLEAR, CHEQUERED, BLACK AND WHITE... Only for category FLAG |
| `scope` | CHECK IN ('TRACK', 'SECTOR', 'DRIVER'), NULL | |
| `sector` | INTEGER, NULL | |
| `entryId` | FK -> `entries(id)`, NULL | Only when the message is about one driver |
| `message` | VARCHAR(255) | Text as published (`TURN 4 INCIDENT INVOLVING CARS ... NOTED`) |

Primary key `(sessionId, number)`. Reuse: `entries`, `sessions`. `redFlags` and `safetyCars` stay as they are (they cover all history, 1950 onwards, and are per event); for 2023+ they could be checked against this log, not replaced.

### Gap per lap: no new table

Option A below. If the owner prefers it stored, see option C.

## Considered options

### Option A (recommended): three small tables, gap calculated

`stints`, `weather`, `raceControlMessages` as above, all optional, CSV per session. The gap per lap is calculated from `lapTimes` by the API (a field of the lap endpoint, or a new endpoint) and never stored.

- Pros: smallest schema; no duplicated number that could disagree with `lapTimes`; the CSV stay small and reviewable; covers every feature of the page.
- Cons: gap is only as good as `lapTimes` (the first lap has the grid offset, and a car that is lapped needs "+1 LAP" logic); a calculation per request (cheap: about 1 000 rows per race).

### Option B: store everything OpenF1 offers

Add the `intervals` (a sample every few seconds), the `weather` per minute and the `laps` (sectors, speeds, mini-sectors) as tables.

- Pros: richer, can show things the page does not need yet (live-like gap, speed traps, sector colours).
- Cons: `intervals` alone is about 28 000 rows per race, around 670 000 per season, as large as the whole database today (about 700 000 rows), and the files would not be reviewable. Against "minimal"; rejected.

### Option C: store the gap as columns of `lapTimes`

Add `gapToLeader` and `interval` (ms, NULL for lapped cars) to `lapTimes` / `R - Lap times.csv`, filled from `intervals` sampled at the end of each lap (using `date_start` + `lap_duration` of `laps`).

- Pros: the page reads a ready value; official-looking numbers, also for the laps where the calculation is ambiguous.
- Cons: two columns that are 100% derivable and could disagree with the times next to them; they only exist from 2023, so the CSV would have empty columns for 70 years; the import needs the extra `laps` endpoint and a time-matching step that is the most fragile part of the whole proposal.

Recommendation: A. If the calculated gap turns out to be wrong in too many races when compared with OpenF1 (a one-off check, not stored), move to C for those races only.

## Sizes (2023 season, 22 races, ~20 drivers; race session only)

| Table | Rows per race | Rows per season | CSV size per season | 2023-2025 (about 70 races) |
| --- | --- | --- | --- | --- |
| `stints` | ~50-70 | ~1 400 | ~50 KB | ~4 000 |
| `weather` (every 5 min) | ~25-30 | ~600 | ~35 KB | ~2 000 |
| `weather` (every minute, as the source) | ~130 | ~2 900 | ~170 KB | ~9 000 |
| `raceControlMessages` | ~75 | ~1 700 | ~150 KB | ~5 000 |
| Gap (option C only, 2 columns on `lapTimes`) | ~1 100 values | ~24 000 | ~+250 KB | ~70 000 |
| `intervals` raw (option B) | ~28 000 | ~610 000 | ~30 MB | ~1.9 M |

Option A adds about 7 000 rows for three seasons, a 1% growth of the database.

## What stays in CSV and what is not stored

- In CSV (source of truth, in git): `stints`, `weather`, `raceControlMessages`, under `csv/seasons/<year>/<round> - <GP>/`. The tables are added in `constants.ts` after `entries` and `sessions`, with their indexes in `indexes.sql` (on `entryId` and `sessionId`).
- Not stored: the raw `intervals`; `laps` details (sector times, speeds, mini-sectors); `weather` samples between the kept ones; the gap per lap (calculated); `lapEnd` of a stint (calculated); any OpenF1 key (`session_key`, `meeting_key`), the provenance of a row or the date it was downloaded, as the repo does for other outside sources (see ADR 0002).
- Not covered: sessions other than the race (practice, qualifying, sprint) in the first version; the data before 2023 (there is no source; `redFlags` and `safetyCars` keep covering it by event).
- Outside the database: the import script that downloads OpenF1 and writes the CSV is a one-off tool, like `set-driver-photos`; the API never calls OpenF1 at runtime.

## Open questions for the owner

1. Compounds: keep what the broadcast calls them (SOFT, MEDIUM, HARD, INTERMEDIATE, WET) or the Pirelli codes (C1-C5), which need a per-event allocation table (`eventTyreAllocations`)? The proposal uses the first, as OpenF1 does.
2. Weather: race only or all sessions? Every minute (the source) or every 5 minutes (smaller, enough for a chart)?
3. Do you want the gap calculated (A) or stored (C)? And if calculated, do the lapped cars show "+1 LAP" or nothing?
4. Race control: all messages, or only the ones that matter (flags, safety car, penalties, investigations) and leave out the weather forecasts, DRS enabled and the like (`category` OTHER)? It would cut the volume by about a third.
5. Is it worth keeping `redFlags` and `safetyCars` for 2023+ once the log exists, or should the log feed them?
6. Should the stints also be checked against `pitStops` in the import (fail, or only warn)? Red-flag tyre changes will not match.
7. Does the schema need an entry per driver and stint when a driver changes car number or a reserve takes over mid-season (the join `driver_number` -> `entryId`)?
