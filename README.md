# RaceDex 🏎️🗂️

**Every Formula 1 Grand Prix since 1950, as open data.** 74 seasons, 1,101 races, around 560,000 lap times, 20,000 pit stops, 900 drivers and the full story of the teams, engines and chassis behind them. Free to use through a REST API, a SQLite database or plain CSV files.

Use it for your own website or app, for data analysis, for research or just for curiosity. It starts with Formula 1 and is designed to grow into other motorsport competitions.

## The data in numbers 📊

|                         |                |
| ----------------------- | -------------- |
| Seasons                 | 74 (1950–2023) |
| Grands Prix             | 1,101          |
| Sessions                | 5,649          |
| Race result rows        | ~114,000       |
| Lap times               | ~560,000       |
| Pit stops               | ~20,000        |
| Drivers                 | 900            |
| Teams (entrants)        | 633            |
| Constructors            | 184            |
| Circuits                | 77             |
| Circuit layouts         | 162            |
| Safety cars / red flags | 305 / 88       |

## What's inside 🔎

- **Results** of every race, qualifying and practice session, with the status of each driver, including the ones that never took the start (did not qualify, withdrawn, excluded...) and the reason for each retirement.
- **Lap times and pit stops**, lap by lap, for the modern era (see the coverage below).
- **Race control events**: safety cars and red flags.
- **Teams done right**: a team keeps its identity through sales and renames, and the chassis constructor and the engine manufacturer are tracked separately. A team can race the chassis of another constructor, and an engine can be rebadged under another brand.
- **Drivers**, their nationalities, test drivers and the family relationships between them.
- **Championships**, with the Constructors' standings calculated from the race results.
- **Circuits, Grands Prix, tyre manufacturers** and more. See the [database diagram](docs/database.svg) for the complete picture.

## How complete is it? ✅

Not equally for every era: race results and qualifying are complete since 1950, practice sessions from the 90s, and lap times and pit stops from the 2000s (partial in the 90s). The report by decade and season is in [data/COVERAGE.md](data/COVERAGE.md).

## Get started 🚀

| I want to...                                  | Read                                             |
| --------------------------------------------- | ------------------------------------------------ |
| **Use the data** in an app, a query or a CSV  | [Using the RaceDex data](docs/USING_THE_DATA.md) |
| **Fix or add data** (no programming needed)   | [Contributing data](docs/CONTRIBUTING_DATA.md)   |
| **Contribute code**                           | [Contributing code](docs/CODE_CONTRIBUTING.md)   |
| Understand a term (layout, entrant, stint...) | [Glossary](docs/GLOSSARY.md)                     |

### Quick start

You need [Node.js](https://nodejs.org/en/download/) **22 or newer**.

```bash
git clone https://github.com/enrique-lozano/RaceDex-API.git
cd RaceDex-API
npm install
npm run dev
```

On the first run the SQLite database is built from the CSV files (it takes a few seconds). Then open <http://localhost:3200/api/drivers/sutil> in your browser:

<img src="docs/screenshots/browser-json-res.png" alt="Data in the browser">

All the endpoints are documented with Swagger at <http://localhost:3200/api/docs>:

<img src="docs/screenshots/swagger.png" alt="Swagger screenshot">

> The content you see may differ from what is shown in the screenshots.

## Contributing 🙋🏻

Contributions are very welcome, from fixing a wrong lap time to adding new features. Read the [contributing guidelines](CONTRIBUTING.md) to get started. All the data comes from the sources listed in [data/SOURCES.md](data/SOURCES.md).

## License

- **Code**: [GNU AGPL v3](LICENSE).
- **Data**: [CC BY-NC-SA 4.0](DATA_LICENSE.md). The data is compiled from several sources; see [DATA_LICENSE.md](DATA_LICENSE.md) for the details and the attribution you must give when reusing it.
