# A circuit has many layouts, and events link to the layout

A circuit (the venue) changes over its history, so its length and its corners are not properties of the circuit but of a **layout**: each `event` points to the layout that was raced (`events.circuitLayoutId`) and the circuit is deduced from it. A new layout exists whenever the race lap changes, that is, its length or its corner sequence; a layout that returns years later is the same row, so its seasons are deduced from the events.

## Considered options

- **Columns on `circuits`, valid for a range of years.** Rejected: layouts come back (the Nürburgring GP circuit, Imola) and seasons overlap (Monza used two layouts in 1955-61), so year ranges would be ambiguous and would have to be kept in sync with the events.
- **Keep `events.circuitId` and add `events.circuitLayoutId`.** Rejected: the same fact twice, and it can drift. The API still returns `circuit` in the event, derived by a join.

## What is a new layout

The rule is about the lap, not about the numbers. The length is a hint, not a test:

- **A new chicane, a shortened lap, a new corner, the other way round, an oval versus the road course** are new layouts.
- **Kerbs, asphalt, run-off areas, corner names** are not.
- **There is no tolerance in metres.** Sources disagree by a few metres (Wikipedia infoboxes, remeasurements, rounding) without the lap having changed, and a real change can leave the length the same. Zandvoort 1973-78 and 1979, or Marina Bay 2013-14 and 2015-22, have the same length and corners and are still different layouts in the sources; Hockenheim, Monza, Monaco and Spa have several layouts whose length differs by a few metres and are right as they are. What counts is a documented change of the lap (Losail 2021 and 2023, 5,380 m and 5,419 m).
- **A one-race layout is a layout** if the race lap was different (Bahrain Endurance 2010, Bahrain Outer 2020).
- Each event points to the layout of **its** race, so a layout change in the middle of a season only moves the events after it.

Cases not decided yet: moving the start line without changing the lap (it changes the numbering of the corners), changes of the pit lane, and two layouts whose first season is the same (their ids would collide).

## Consequences

- A layout is identified as `<circuitId>-<first season it was used>` (`silverstone-2010`). `npm run import-db` warns if an id does not follow it, which happens after splitting a layout.
- The first version of the layouts and of the events' link to them was imported once from [f1db](https://github.com/f1db/f1db) and corrected afterwards against Wikipedia. [TracingInsights](https://tracinginsights.com/stats/circuits) shows the same layouts, but it is built on f1db, so it does not confirm them.
- `turns` is the official number of corners, as the sources count it (a chicane can be one corner or two). It differs between sources for some layouts (Monza), and `direction` was extrapolated from the most recent layout for many historic ones. Neither is checked.
- Splitting or merging a layout means changing `circuitLayouts.csv`, the `circuitLayoutId` of the events involved, the id and file name of its shape and the layout of its sectors, all by hand.
