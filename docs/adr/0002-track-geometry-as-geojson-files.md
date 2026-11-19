# The geometry of a layout is a GeoJSON file in git, loaded into the database on import

The shape of each circuit layout lives in `data/tracks/<circuitLayoutId>.geojson` (WGS84 lat/lon, a point every 30-40 m, a few KB per file), and `import-db` copies it into its own table so the API never depends on files at runtime. Geometry is optional: a layout without it keeps all its text data. A file holds the `track`, when it is known the `pit-lane`, the `corner`s (one `Point` per corner, on its apex, with its official `number` and, if it has one, its `name`) and the ends of the two first `sector`s (ADR 0003). The `track` says `"startLine": true` when its first point is the start line, which is what the distances of the sectors and of the corners (derived by the import) need.

## Considered options

- **An encoded polyline in a column of `circuitLayouts.csv`.** Rejected: unreadable, and very long CSV rows make bad diffs.
- **Only in the database, outside git.** Rejected: the database is rebuilt from the CSV files, so anything outside them could not be reproduced or reviewed in a pull request.
- **Calling an external API (MultiViewer, OpenF1) at runtime.** Rejected: the project depends only on its own data. Whatever came from an outside source is added once, validated, and then kept here without its provenance.

## Consequences

- The corners are coordinates on the shape, not distances: they do not depend on where the start line is, and they can be dragged on a map (geojson.io, GitHub). `import-db` derives the distance of each one from the start line into `circuitLayoutCorners` and fails if a corner is more than 20 m from the track or the numbers repeat. There is no CSV of corners.
- The import checks the files: a closed track of about the length of the layout, no repeated points or spikes, a pit lane close to the track, and every corner and sector on the track.
- A corner has one `name`, the current one; a stretch with its own name (Senna S, a straight) is not modelled yet.
- GitHub renders `.geojson` files as a map, so a pull request shows the shape that changed.
- `export-db` does not write geometry: the files are the source of truth.
- The API sends a shape with a day of cache, so a corrected shape can take a day to reach a browser that already has it.
