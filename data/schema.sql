--
-- File generated with SQLiteStudio v3.4.3 on sá. feb. 11 11:43:19 2023
--
-- Text encoding used: UTF-8
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: circuits
DROP TABLE IF EXISTS circuits;
CREATE TABLE IF NOT EXISTS circuits
( id VARCHAR(255) NOT NULL COLLATE NOCASE PRIMARY KEY
, name VARCHAR(255) NOT NULL COLLATE NOCASE
, fullName VARCHAR(255) NOT NULL COLLATE NOCASE
, previousNames VARCHAR(255) COLLATE NOCASE
, type VARCHAR(255) NOT NULL COLLATE NOCASE CHECK (type IN ('RACE', 'ROAD', 'STREET'))
, placeName VARCHAR(255) NOT NULL COLLATE NOCASE
, countryId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES countries(alpha2Code)
, latitude DECIMAL(10,6)
, longitude DECIMAL(10,6)
);

-- Table: companies
-- One company can play several roles (Honda: engine manufacturer + constructor + entrant).
DROP TABLE IF EXISTS companies;
CREATE TABLE IF NOT EXISTS companies
( id VARCHAR(255) NOT NULL COLLATE NOCASE PRIMARY KEY
, name VARCHAR(255) NOT NULL COLLATE NOCASE
, fullName VARCHAR(255) NOT NULL COLLATE NOCASE
, countryId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES countries(alpha2Code) -- country of origin, NOT the licence nationality
, founder VARCHAR(255) COLLATE NOCASE
, yearFounded INTEGER
);

-- Table: constructors
-- Designer of the FIA "Listed Parts" (the chassis). It has no lineage: lineage belongs to entrants. Includes specialist builders (Lola, Dallara).
DROP TABLE IF EXISTS constructors;
CREATE TABLE IF NOT EXISTS constructors
( id VARCHAR(255) NOT NULL COLLATE NOCASE PRIMARY KEY
, companyId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES companies(id)
, name VARCHAR(255) NOT NULL COLLATE NOCASE
, fullName VARCHAR(255) NOT NULL COLLATE NOCASE
, countryId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES countries(alpha2Code) -- country of origin of the marque; the licence nationality is per season (entrantSeasons)
, wikiUrl VARCHAR(255) COLLATE NOCASE
, summary VARCHAR(5000) COLLATE NOCASE
, photo VARCHAR(255) COLLATE NOCASE
);

-- Table: chassis
-- A chassis model. The same chassis can be raced by many entrants (customers, privateers).
DROP TABLE IF EXISTS chassis;
CREATE TABLE IF NOT EXISTS chassis
( id VARCHAR(255) NOT NULL COLLATE NOCASE PRIMARY KEY -- <constructorId>-<name slug>, e.g. tyrrell-012. <constructorId>-unknown when the name is unknown
, constructorId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES constructors(id) -- who designed it, whatever the entrant declared (Larrousse 1990 = lola)
, name VARCHAR(255) COLLATE NOCASE -- model (012, MP4/4, LH95). NULL only for the <constructorId>-unknown placeholders
);

-- Table: countries
DROP TABLE IF EXISTS countries;
CREATE TABLE IF NOT EXISTS countries
( alpha2Code VARCHAR(2) NOT NULL COLLATE NOCASE PRIMARY KEY
, alpha3Code VARCHAR(3) NOT NULL COLLATE NOCASE UNIQUE
, region VARCHAR(255) NOT NULL COLLATE NOCASE
, subregion VARCHAR(255) COLLATE NOCASE
);

-- Table: drivers
DROP TABLE IF EXISTS drivers;
CREATE TABLE IF NOT EXISTS drivers
( id VARCHAR(255) NOT NULL COLLATE NOCASE PRIMARY KEY
, name VARCHAR(255) NOT NULL COLLATE NOCASE
, firstName VARCHAR(255) NOT NULL COLLATE NOCASE
, lastName VARCHAR(255) NOT NULL COLLATE NOCASE
, fullName VARCHAR(255) NOT NULL COLLATE NOCASE
, abbreviation VARCHAR(3) NOT NULL COLLATE NOCASE
, permanentNumber VARCHAR(2) COLLATE NOCASE
, gender VARCHAR(255) NOT NULL COLLATE NOCASE CHECK (gender IN ('MALE', 'FEMALE'))
, dateOfBirth VARCHAR(10) NOT NULL CHECK (dateOfBirth GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]') -- YYYY-MM-DD
, dateOfDeath VARCHAR(10) CHECK (dateOfDeath GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]')
, placeOfBirth VARCHAR(255) NOT NULL COLLATE NOCASE
, countryOfBirthCountryId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES countries(alpha2Code)
, nationalityCountryId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES countries(alpha2Code)
, secondNationalityCountryId VARCHAR(255) COLLATE NOCASE REFERENCES countries(alpha2Code)
, photo VARCHAR(10000)
);

-- Table: driversFamilyRelationships
DROP TABLE IF EXISTS driversFamilyRelationships;
CREATE TABLE IF NOT EXISTS driversFamilyRelationships
( driverA VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES drivers(id)
, driverB VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES drivers(id)
, AisToB VARCHAR(255) NOT NULL COLLATE NOCASE CHECK (AisToB IN ('CHILD', 'CHILD_IN_LAW', 'GRANDCHILD', 'GRANDPARENT', 'GRANDPARENTS_SIBLING', 'HALF_SIBLING', 'PARENT', 'PARENT_IN_LAW', 'PARENTS_SIBLING', 'PARENTS_SIBLINGS_CHILD', 'SIBLING', 'SIBLING_IN_LAW', 'SIBLINGS_CHILD', 'SIBLINGS_CHILD_IN_LAW', 'SIBLINGS_GRANDCHILD'))
, PRIMARY KEY (driverA, driverB, AisToB)
);

-- Table: engineManufacturers
-- Builds engines. Also used as the BRAND of a rebadged engine (Ford on a Cosworth, TAG Heuer on a Renault).
DROP TABLE IF EXISTS engineManufacturers;
CREATE TABLE IF NOT EXISTS engineManufacturers
( id VARCHAR(255) NOT NULL COLLATE NOCASE PRIMARY KEY
, companyId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES companies(id)
, name VARCHAR(255) NOT NULL COLLATE NOCASE
, countryId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES countries(alpha2Code)
);

-- Table: engines
-- An engine model, parsed from the old free-text names, e.g. "Energy F1 2014 V6 t h 1.6" = name Energy F1 2014, V6, 1.6 l, turbocharged, hybrid.
DROP TABLE IF EXISTS engines;
CREATE TABLE IF NOT EXISTS engines
( id VARCHAR(255) NOT NULL COLLATE NOCASE PRIMARY KEY -- <manufacturerId>-<name slug>, e.g. cosworth-dfy. Engines without a name use their specification
, manufacturerId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES engineManufacturers(id) -- who actually BUILT it (Cosworth for the Ford DFV)
, name VARCHAR(255) COLLATE NOCASE -- model: DFY, EF4B, 158. NULL when the source only has the specification ("L4 4.5")
, layout VARCHAR(1) COLLATE NOCASE -- V, L (inline), F (flat), W, H
, cylinders INTEGER CHECK (cylinders > 0)
, displacement DECIMAL(4,2) CHECK (displacement > 0) -- litres, as in the source names (3.0, 1.5)
, aspiration VARCHAR(255) NOT NULL COLLATE NOCASE CHECK (aspiration IN ('NATURALLY_ASPIRATED', 'SUPERCHARGED', 'TURBOCHARGED')) -- SUPERCHARGED = "c" (compressor), TURBOCHARGED = "t"
, hybrid BOOLEAN NOT NULL DEFAULT 0 CHECK (hybrid IN (0, 1)) -- "h" in the source names
);

-- Table: tyreManufacturers
DROP TABLE IF EXISTS tyreManufacturers;
CREATE TABLE IF NOT EXISTS tyreManufacturers
( id VARCHAR(255) NOT NULL COLLATE NOCASE PRIMARY KEY
, companyId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES companies(id)
, name VARCHAR(255) NOT NULL COLLATE NOCASE
, countryId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES countries(alpha2Code)
, primaryColor VARCHAR(10) NOT NULL COLLATE NOCASE
, secondaryColor VARCHAR(10) NOT NULL COLLATE NOCASE
);

-- Table: grandsPrix
DROP TABLE IF EXISTS grandsPrix;
CREATE TABLE IF NOT EXISTS grandsPrix
( id VARCHAR(255) NOT NULL COLLATE NOCASE PRIMARY KEY
, name VARCHAR(255) NOT NULL COLLATE NOCASE
, fullName VARCHAR(255) NOT NULL COLLATE NOCASE
, shortName VARCHAR(255) NOT NULL COLLATE NOCASE
, countryId VARCHAR(255) COLLATE NOCASE REFERENCES countries(alpha2Code)
);

-- Table: entrants
-- Who registers and runs the cars (the "team", e.g. Tyrrell 1966-98); its identity holds for the whole history. The registered names, sponsors included, live in entries.entrantName.
DROP TABLE IF EXISTS entrants;
CREATE TABLE IF NOT EXISTS entrants
( id VARCHAR(255) NOT NULL COLLATE NOCASE PRIMARY KEY -- scuderia-ferrari, tyrrell-racing, rrc-walker-racing-team
, name VARCHAR(255) NOT NULL COLLATE NOCASE -- clean team name, no sponsors: the most recent or best-known one
, companyId VARCHAR(255) COLLATE NOCASE REFERENCES companies(id) -- NULL for private individuals and for the "private entry" placeholder
);

-- Table: entrantSuccessions
-- Handover of a team to another entrant. A chain: tyrrell-racing -> bar (1999) -> honda-racing (2006) -> brawn-gp (2009) -> mercedes (2010).
DROP TABLE IF EXISTS entrantSuccessions;
CREATE TABLE IF NOT EXISTS entrantSuccessions
( predecessorId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES entrants(id)
, successorId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES entrants(id)
, year INTEGER NOT NULL -- first season of the successor
, type VARCHAR(255) NOT NULL COLLATE NOCASE CHECK (type IN ('MERGER', 'RENAME', 'REVIVAL', 'TAKEOVER')) -- RENAME: same organisation, new name (Racing Point -> Aston Martin); TAKEOVER: sold or bought (Tyrrell -> BAR); REVIVAL: returns after a gap
, PRIMARY KEY (predecessorId, successorId, year)
, CHECK (predecessorId <> successorId)
);

-- Table: entrantSeasons
-- Facts of an entrant that hold for a whole season. The sponsor name is NOT here, since it can change within a season (Ferrari 2021): see entries.entrantName.
DROP TABLE IF EXISTS entrantSeasons;
CREATE TABLE IF NOT EXISTS entrantSeasons
( id VARCHAR(255) NOT NULL COLLATE NOCASE PRIMARY KEY -- <season>-<entrantId>, e.g. 2021-scuderia-ferrari
, entrantId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES entrants(id)
, season INTEGER NOT NULL
, ownConstructorId VARCHAR(255) COLLATE NOCASE REFERENCES constructors(id) -- constructor whose chassis the team builds itself that season. NULL = customer team (Tyrrell with Matra in 1968-69)
, licenceCountryId VARCHAR(255) COLLATE NOCASE REFERENCES countries(alpha2Code) -- nationality of the ASN that issued the licence (decides the anthem), NOT where it is based or owned: Wolf = CA, Jordan 1998 = IE. NULL when unknown
, UNIQUE (entrantId, season)
);

-- Table: entries
-- A driver in a car configuration, reused by the results of any session (it was never per session). Any change of number, name, chassis, engine or tyres is a new row.
DROP TABLE IF EXISTS entries;
CREATE TABLE IF NOT EXISTS entries
( id VARCHAR(255) NOT NULL COLLATE NOCASE PRIMARY KEY
, driverId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES drivers(id)
, driverNumber INTEGER NOT NULL CHECK (driverNumber >= 0)
, entrantSeasonId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES entrantSeasons(id)
, entrantName VARCHAR(255) NOT NULL -- registered name, sponsors included. It can change within a season: each name is its own row (Ferrari 2021)
, chassisId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES chassis(id)
, engineId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES engines(id) -- who built the engine
, engineBrandId VARCHAR(255) COLLATE NOCASE REFERENCES engineManufacturers(id) -- brand the engine is sold under when it differs from the builder (Ford on a Cosworth). NULL = the builder
, tyreManufacturerId VARCHAR(255) COLLATE NOCASE REFERENCES tyreManufacturers(id)
, note VARCHAR(255) -- "TD" in 170 rows, meaning to be confirmed
);

-- Table: lapTimes
DROP TABLE IF EXISTS lapTimes;
CREATE TABLE IF NOT EXISTS lapTimes 
( entryId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES entries(id)
, sessionId VARCHAR(10) NOT NULL REFERENCES sessions(id) ON UPDATE CASCADE
, lap INTEGER NOT NULL CHECK (lap > 0)
, time INTEGER CHECK (time > 0) -- milliseconds
, position INTEGER CHECK (position > 0) -- position of the driver in the race at the end of this lap
, PRIMARY KEY (entryId, sessionId, lap)
);

-- Table: pitStops
DROP TABLE IF EXISTS pitStops;
CREATE TABLE IF NOT EXISTS pitStops 
( entryId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES entries(id)
, sessionId VARCHAR(10) NOT NULL REFERENCES sessions(id) ON UPDATE CASCADE
, lap INTEGER NOT NULL CHECK (lap > 0)
, time INTEGER CHECK (time >= 0) -- milliseconds
, timeOfDay VARCHAR(10)
, annotation VARCHAR(255)
, PRIMARY KEY (entryId, sessionId, lap)
);

-- Table: session
DROP TABLE IF EXISTS sessions;
CREATE TABLE IF NOT EXISTS sessions 
( id VARCHAR(10) NOT NULL PRIMARY KEY
, eventId VARCHAR(10) NOT NULL REFERENCES events (id) ON UPDATE CASCADE
, abbreviation TEXT NOT NULL
, startDateTime VARCHAR(20) -- ISO 8601 (UTC), e.g. 1950-05-13T00:00:00Z
);

-- Table: events
DROP TABLE IF EXISTS events;
CREATE TABLE IF NOT EXISTS events
( id VARCHAR(10) NOT NULL PRIMARY KEY
, grandPrixId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES grandsPrix(id)
, name VARCHAR(255) NOT NULL COLLATE NOCASE
, qualyFormat VARCHAR(255) NOT NULL COLLATE NOCASE
, circuitId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES circuits(id)
, scheduledLaps INTEGER CHECK (scheduledLaps > 0)
, posterURL VARCHAR(255) COLLATE NOCASE
);

-- Table: fpResults
DROP TABLE IF EXISTS fpResults;
CREATE TABLE IF NOT EXISTS fpResults
( sessionId VARCHAR(10) NOT NULL REFERENCES sessions(id)
, entryId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES entries(id)
, positionOrder INTEGER CHECK (positionOrder > 0)
, positionText VARCHAR(3)
, laps INTEGER CHECK (laps >= 0)
, time INTEGER CHECK (time > 0) -- milliseconds
, PRIMARY KEY (sessionId, entryId)
);

-- Table: qualifyingResults
DROP TABLE IF EXISTS qualifyingResults;
CREATE TABLE IF NOT EXISTS qualifyingResults
( sessionId VARCHAR(10) NOT NULL REFERENCES sessions(id)
, entryId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES entries(id)
, positionOrder INTEGER CHECK (positionOrder > 0)
, positionText VARCHAR(3)
, laps INTEGER CHECK (laps >= 0)
, time INTEGER CHECK (time > 0) -- milliseconds
, PRIMARY KEY (sessionId, entryId)
);

-- Table: resultStatuses
-- Codes of the race results that are not a finishing position (`raceResults.positionText`), with their meaning. The
-- position of a classified driver is a number. `raceEntry`: counts as a race entry in the statistics; `started`: took the start.
DROP TABLE IF EXISTS resultStatuses;
CREATE TABLE IF NOT EXISTS resultStatuses
( code VARCHAR(4) NOT NULL PRIMARY KEY
, name VARCHAR(255) NOT NULL
, description VARCHAR(1000) NOT NULL
, raceEntry BOOLEAN NOT NULL CHECK (raceEntry IN (0, 1))
, started BOOLEAN NOT NULL CHECK (started IN (0, 1))
);

-- Table: retirementReasons
-- Why a car did not finish, was disqualified or did not start. The `name` is the text shown to the users.
DROP TABLE IF EXISTS retirementReasons;
CREATE TABLE IF NOT EXISTS retirementReasons
( id VARCHAR(255) NOT NULL COLLATE NOCASE PRIMARY KEY -- slug of the name, e.g. gearbox, spun-off
, name VARCHAR(255) NOT NULL COLLATE NOCASE
, category VARCHAR(255) NOT NULL COLLATE NOCASE CHECK (category IN ('ACCIDENT', 'DISQUALIFICATION', 'DRIVER_HEALTH', 'MECHANICAL', 'OTHER')) -- MECHANICAL: a failed component of the car (engine, gearbox, brakes...). ACCIDENT: collisions and spins. DRIVER_HEALTH: illness or injury. DISQUALIFICATION: infringement of the rules. OTHER: withdrawals, out of fuel...
);

-- Table: raceResults
DROP TABLE IF EXISTS raceResults;
CREATE TABLE IF NOT EXISTS raceResults
( sessionId VARCHAR(10) NOT NULL REFERENCES sessions(id)
, entryId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES entries(id)
, positionOrder INTEGER NOT NULL CHECK (positionOrder > 0)
, positionText VARCHAR(4) NOT NULL CHECK (positionText GLOB '[1-9]*' AND positionText NOT GLOB '*[^0-9]*' OR positionText IN ('DNF', 'NC', 'DSQ', 'DNS', 'DNQ', 'DNPQ', 'EX', 'DNP', 'WD', 'DNA')) -- the finishing position, or a code of resultStatuses (TD is never stored)
, time INTEGER -- milliseconds
, gridPosition INTEGER CHECK (gridPosition >= 0)
, gridPenalty VARCHAR(10)
, laps INTEGER CHECK (laps >= 0)
, points REAL CHECK (points >= 0) -- not an integer: shortened races award half points
, pointsCountForWDC BOOLEAN NOT NULL CHECK (pointsCountForWDC IN (0, 1))
, pointsCountForWCC BOOLEAN NOT NULL DEFAULT 1 CHECK (pointsCountForWCC IN (0, 1)) -- 0 when the result does not score for the Constructors' Championship: non-eligible third car (Renault, 1985 German GP), disqualified constructor (Larrousse 1990)
, pointsGained INTEGER
, timePenalty INTEGER
, retirementReasonId VARCHAR(255) COLLATE NOCASE REFERENCES retirementReasons(id) -- why the car did not finish (or was disqualified / did not start). NULL if it finished
, PRIMARY KEY (sessionId, entryId, positionOrder)
);

-- Table: redFlags
DROP TABLE IF EXISTS redFlags;
CREATE TABLE IF NOT EXISTS redFlags
( eventId VARCHAR(10) NOT NULL REFERENCES events(id)
, lap INTEGER NOT NULL
, incident VARCHAR(255) NOT NULL
, excluded VARCHAR(2000)
, resumed VARCHAR(1)
, PRIMARY KEY (eventId, lap, incident)
);

-- Table: safetyCars
DROP TABLE IF EXISTS safetyCars;
CREATE TABLE IF NOT EXISTS safetyCars
( eventId VARCHAR(10) NOT NULL REFERENCES events(id)
, deployed INTEGER NOT NULL
, fullLaps INTEGER
, retreated INTEGER
, cause VARCHAR(255)
, PRIMARY KEY (eventId, deployed)
);

COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
