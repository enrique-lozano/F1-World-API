-- Indexes of the database.
--
-- They are created AFTER importing the rows (see db-import.ts), since building
-- an index once is much faster than updating it on every insert.
--
-- Primary keys are already indexed. The composite primary keys of the results
-- tables start with `sessionId`, so they cover the lookups by session; the
-- `lapTimes` and `pitStops` ones start with `entryId`, so they don't.

-- Rows of a session
CREATE INDEX idx_lapTimes_sessionId ON lapTimes (sessionId);
CREATE INDEX idx_pitStops_sessionId ON pitStops (sessionId);
CREATE INDEX idx_sessions_eventId ON sessions (eventId);

-- Rows of an entry (all the results/laps/stops of a driver go through it)
CREATE INDEX idx_raceResults_entryId ON raceResults (entryId);
CREATE INDEX idx_raceResults_retirementReasonId ON raceResults (retirementReasonId);
CREATE INDEX idx_qualifyingResults_entryId ON qualifyingResults (entryId);
CREATE INDEX idx_fpResults_entryId ON fpResults (entryId);

-- Entries by driver / team / chassis / engine / tyres
CREATE INDEX idx_entries_driverId ON entries (driverId);
CREATE INDEX idx_entries_entrantSeasonId ON entries (entrantSeasonId);
CREATE INDEX idx_entries_chassisId ON entries (chassisId);
CREATE INDEX idx_entries_engineId ON entries (engineId);
CREATE INDEX idx_entries_engineBrandId ON entries (engineBrandId);
CREATE INDEX idx_entries_tyreManufacturerId ON entries (tyreManufacturerId);

-- Entrants, their seasons and their lineage (entrantSeasons also has a unique index on (entrantId, season))
CREATE INDEX idx_entrantSeasons_season ON entrantSeasons (season);
CREATE INDEX idx_entrantSeasons_ownConstructorId ON entrantSeasons (ownConstructorId);
CREATE INDEX idx_entrantSuccessions_successorId ON entrantSuccessions (successorId);

-- Chassis, engines and the companies behind them
CREATE INDEX idx_chassis_constructorId ON chassis (constructorId);
CREATE INDEX idx_engines_manufacturerId ON engines (manufacturerId);
CREATE INDEX idx_constructors_companyId ON constructors (companyId);

-- Events
CREATE INDEX idx_events_grandPrixId ON events (grandPrixId);
CREATE INDEX idx_events_circuitId ON events (circuitId);

-- Drivers
CREATE INDEX idx_drivers_nationalityCountryId ON drivers (nationalityCountryId);
CREATE INDEX idx_driversFamilyRelationships_driverB ON driversFamilyRelationships (driverB);

-- Red flags and safety cars are looked up by their PK (eventId, ...) prefix.
