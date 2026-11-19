# Proposal: stints, weather and race neutralisations, by lap

Status: implemented for the seasons 1976, 2022 and 2023. Replaces `free-to-race-schema.md` (its stints and its "gap is calculated" decision are kept; weather and race control are redesigned). Full schema: [`race-timeline-schema.dbml`](race-timeline-schema.dbml) (the whole database with the changes applied).

## Rules that drive the design

1. **Store at the coarsest level that is true.** Detail is optional, never required. A 1958 race with "dry, sunny" is one row; the same table holds a 2024 race with rain from lap 23.
2. **The axis is the leader's lap.** Not the clock: old sessions only have a date, and the lap joins directly with `lapTimes` and `pitStops`. Lap 0 means before the first lap. Converting a clock time to a lap is the job of the import, once.
3. **Store changes, not samples.** Ranges of laps (`lapStart`, the end is the next row) keep the size flat whatever the source frequency is.
4. **Concepts, not series vocabulary.** The enums say what happened to the race, and the UI picks the name per category.
5. **Nothing that is free text without a use.** Race control messages are not stored.

## Unified concepts

| Concept | Enum value | Covers |
| --- | --- | --- |
| Pace car, field bunches up | `SAFETY_CAR` | F1 safety car, IndyCar full-course caution |
| All slow down, gaps kept, no pace car | `FULL_COURSE_YELLOW` | F1 virtual safety car, FCY of WEC and Formula E |
| Race stopped | `RED_FLAG` | All |
| Softest to hardest dry tyre | `SOFT`, `MEDIUM`, `HARD` | F1 C1-C5 labels, IndyCar alternate (`SOFT`) and primary (`HARD`) |
| Rain tyres | `INTERMEDIATE`, `WET` | F1; IndyCar wet is `WET` |

Note on IndyCar: its yellow ("full-course caution") brings out a pace car and bunches the field, so it maps to `SAFETY_CAR`, not to the virtual one. The FCY of the endurance series and Formula E is the one that maps to the VSC.

## Tables (summary)

| Table | Key | What it holds |
| --- | --- | --- |
| `weatherPeriods` | `(sessionId, lapStart)` | `weather` (`CLEAR`, `PARTLY_CLOUDY`, `CLOUDY`, `SHOWERS`, `LIGHT_RAIN`, `HEAVY_RAIN`) at the start of the race, air and track temperature. All nullable; the base row (`lapStart` 1) always exists |
| `raceNeutralisations` | `(sessionId, number)` | `kind`, `lapStart`, `lapEnd`, `cause`, and for red flags `resumed` (kept as in the source: `Y`, `N`, `R`, `S`) and `excluded` |
| `stints` | `(entryId, sessionId, stint)` | `lapStart`, `compound`, `tyreAge` |

Removed: `redFlags` and `safetyCars` (migrated into `raceNeutralisations`). The gap per lap is still calculated from `lapTimes`, not stored (option A of the previous proposal).

### Migration of the existing CSV

- `redFlags.csv` (88 rows): `eventId` -> the race session of the event; `lap` -> `lapStart`; `incident` -> `description` (and `cause` when it is only "Rain." or similar); `excluded` and `resumed` are copied as they are (`resumed` has four values in the source, `Y`, `N`, `R` and `S`, and the meaning of `R` and `S` is not documented, so it is not turned into a boolean).
- `safetyCars.csv` (305 rows): `deployed` -> `lapStart`; `retreated` -> `lapEnd`; `cause` -> the `cause` enum (`Accident/Rain` -> the main one). `fullLaps` is dropped: it is almost `lapEnd - lapStart` and a different count of the same fact.
- `redFlags.csv` and `safetyCars.csv` become one `raceNeutralisations.csv` in the root of `csv/`, and `weatherPeriods.csv` is also in the root: they have a handful of rows per race, so one file per race would be hundreds of tiny files. `stints` has about 50 rows per race, so it is per race: `R - Stints.csv`.

## Sizes

| Table | Rows per race | Whole history (~1 100 races) |
| --- | --- | --- |
| `weatherPeriods` | 1-3 | ~2 000 |
| `raceNeutralisations` | 0-4 | ~400 today (the two old tables), a few hundred more with the VSC from 2015 |
| `stints` | ~50 (2018+) | ~10 000 if loaded for 2011+ |

Together about 1.5% of the database. The API should return them per session, with the gap per lap as columns (arrays), not one object per driver and lap.

## What is not stored

Race control messages, yellow flags per sector, DRS messages, humidity, wind and pressure, raw `intervals`, sector times, clock times, and anything from OpenF1 keys. Measured weather samples are collapsed to changes by the import.

## Decisions taken

- `weather` is the sky and rain at the start of the race (the level of the icons of statsf1), with the six values above. There is no `trackCondition`: no source gives it.
- Only the base row of `weatherPeriods` is loaded for now. Rows for later changes (rain starting at lap 23) are possible without changing the schema.
- Neutralisations and per-lap weather are for the race only.
- Penalties are left out until a source exists.
- A stint is only loaded when the compound or the age is known.

## Sources used

- 1976 (no source of lap data): the weather and the temperature come from Open-Meteo (ERA5 reanalysis) at the circuit, taking 14:00 local as the start time since only the date is known. The neutralisations are the old `redFlags` and `safetyCars`.
- 2022: stints, virtual safety cars and temperatures from FastF1.
- 2023: the same from OpenF1 (FastF1 now needs an F1 account for the seasons after 2022). The `rainfall` flag of the first minutes decides whether it was raining at the start.
- Open questions: what `R` and `S` mean in `resumed`.
