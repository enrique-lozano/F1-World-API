-- Indexes of the database.
--
-- They are created AFTER importing the rows (see db-import.ts), since building
-- an index once is much faster than updating it on every insert.
--
-- Primary keys are already indexed. The composite primary keys of the results
-- tables start with `sessionId`, so they cover the lookups by session; the
-- `lapTimes` and `pitStops` ones start with `entrantId`, so they don't.

-- Rows of a session
CREATE INDEX idx_lapTimes_sessionId ON lapTimes (sessionId);
CREATE INDEX idx_pitStops_sessionId ON pitStops (sessionId);
CREATE INDEX idx_sessions_eventId ON sessions (eventId);

-- Rows of an entrant (all the results/laps/stops of a driver go through it)
CREATE INDEX idx_raceResults_entrantId ON raceResults (entrantId);
CREATE INDEX idx_qualifyingResults_entrantId ON qualifyingResults (entrantId);
CREATE INDEX idx_fpResults_entrantId ON fpResults (entrantId);

-- Entrants by driver / team / supplier
CREATE INDEX idx_sessionEntrants_driverId ON sessionEntrants (driverId);
CREATE INDEX idx_sessionEntrants_seasonEntrantId ON sessionEntrants (seasonEntrantId);
CREATE INDEX idx_sessionEntrants_chassisManufacturerId ON sessionEntrants (chassisManufacturerId);
CREATE INDEX idx_sessionEntrants_engineManufacturerId ON sessionEntrants (engineManufacturerId);
CREATE INDEX idx_sessionEntrants_tyreManufacturerId ON sessionEntrants (tyreManufacturerId);
CREATE INDEX idx_seasonEntrants_season ON seasonEntrants (season);

-- Events
CREATE INDEX idx_events_grandPrixId ON events (grandPrixId);
CREATE INDEX idx_events_circuitId ON events (circuitId);

-- Drivers
CREATE INDEX idx_drivers_nationalityCountryId ON drivers (nationalityCountryId);
CREATE INDEX idx_driversFamilyRelationships_driverB ON driversFamilyRelationships (driverB);

-- Red flags and safety cars are looked up by their PK (eventId, ...) prefix.
