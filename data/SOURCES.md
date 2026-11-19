# Sources and acknowledgements

RaceDex would not exist without the work of the people and projects behind these sources. Thank you!

- [Wikipedia](https://www.wikipedia.org/): season, race, driver and team articles, used for cross-checking and filling gaps.
- [f1db](https://github.com/f1db/f1db) (CC BY 4.0): open Formula 1 database, used as a reference for historical data and as the starting point of the circuit layouts (length, corners and the layout used in each race).
- [Jolpica F1](https://api.jolpi.ca/) and the original [Ergast](https://ergast.com/mrd/) API: results and lap times.
- [bacinger/f1-circuits](https://github.com/bacinger/f1-circuits) (MIT): the shape of the current circuits (`tracks/`), reviewed and adapted here.
- [OpenStreetMap](https://www.openstreetmap.org/copyright) (ODbL): © OpenStreetMap contributors. The shape of 13 layouts that are not in bacinger (`bahrain-2010`, `bahrain-2020`, `aida-1994`, `buddh-2011`, `catalunya-2007`, `catalunya-2021`, `dijon-1977`, `fuji-2007`, `indianapolis-1950`, `jerez-1994`, `mosport-1967`, `yas-marina-2009`, `yeongam-2010`) was traced from it, and so were the pit lanes of nine layouts (`bahrain-2004`, `jeddah-2021`, `baku-2016`, `miami-2022`, `monaco-2003`, `catalunya-2023`, `montreal-2002`, `spielberg-1997`, `hungaroring-2003`).
- [OpenF1](https://openf1.org): the telemetry of the 2023 races, used once to measure where the start line and the end of sectors 1 and 2 are on each shape, and the pit lanes that OpenStreetMap does not have. Only the measured distances and lines are kept here.
- [FastF1](https://github.com/theOehrly/Fast-F1) (MIT): a library over the timing data of Formula 1, used once to get the stints, the virtual safety cars and the temperatures of the 2022 and 2023 races (`stints`, `raceNeutralisations`, `weatherPeriods`). Only the facts are kept here.
- [Open-Meteo](https://open-meteo.com/) (CC BY 4.0, ERA5 reanalysis of Copernicus): cloud cover, precipitation and air temperature at the circuit, used to fill the `weather` at the start of the races from 1976 on. It is a model with cells of about 25 km, not a measure on the track, so it is the least reliable of the sources.
- [Formula 1](https://www.formula1.com/): official results, pit stops and other recent data.
- [Formula One History](https://www.formulaonehistory.com/): historical entries and results.
- [StatsF1](https://www.statsf1.com/): historical statistics, used for cross-checking.
- [Old Racing Cars](https://www.oldracingcars.com/): chassis and entries of the early years.

Race results and lap times are facts, and we claim no ownership over them. See the [data license](../DATA_LICENSE.md) for the terms of use, and open an issue if you are a rights holder and think something here should be attributed or removed.
