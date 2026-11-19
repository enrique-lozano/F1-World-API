# The ends of the timing sectors are points of the layout's shape

Where sector 1 and sector 2 end is two `sector` points (`"sector": 1` or `2`) in the `.geojson` of the layout (ADR 0002), on the track. Sector 3 ends at the start line, so it is not stored. The import derives their distance from the start line into `circuitLayoutSectors`, one row per point with the seasons it is valid for (`fromSeason`, `untilSeason`), and the race page takes the ends valid for its season.

The timing lines hardly ever move, so a point is valid for every season the layout was raced. If they did move, the point gets `from` and/or `until` (seasons) and another point takes over. Today no file uses them: the only measurement is the one of OpenF1 in 2023 (laps and telemetry), taken as the default for the whole life of each layout, which for the older seasons is an assumption and not a measure.

## Considered options

- **A CSV with one row per measured season** (the first version). Rejected: it duplicates what almost never changes, the distances break when the start line moves, and the lines could not be seen or fixed on a map.
- **A required `fromSeason` on every sector.** Rejected: it would be written once, with the same season, for every layout.

## Consequences

- A sector is a position on the shape, like a corner: it does not depend on where the start line is, and the import fails if it is more than 20 m from the track or the file has no `"startLine": true`.
- A change of the lines in the middle of a season, or different lines for different events, is not modelled. It would not corrupt anything (sector times are stored apart): the sector would be drawn in the wrong place for those races.
- Other series would need their own layout, as with Bahrain Endurance (ADR 0001).
