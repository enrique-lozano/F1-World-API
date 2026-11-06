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
DROP TABLE IF EXISTS companies;
CREATE TABLE IF NOT EXISTS companies
( id VARCHAR(255) NOT NULL COLLATE NOCASE PRIMARY KEY
, name VARCHAR(255) NOT NULL COLLATE NOCASE
, fullName VARCHAR(255) NOT NULL COLLATE NOCASE
, countryId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES countries(alpha2Code)
, founder VARCHAR(255) COLLATE NOCASE
, yearFounded INTEGER
);

-- Table: constructors
DROP TABLE IF EXISTS constructors;
CREATE TABLE IF NOT EXISTS constructors
( id VARCHAR(255) NOT NULL COLLATE NOCASE PRIMARY KEY
, name VARCHAR(255) NOT NULL COLLATE NOCASE
, fullName VARCHAR(255) NOT NULL COLLATE NOCASE
, countryId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES countries(alpha2Code)
, wikiUrl VARCHAR(255) COLLATE NOCASE
, summary VARCHAR(5000) COLLATE NOCASE
, photo VARCHAR(255) COLLATE NOCASE
);

-- Table: previousNextConstructors
DROP TABLE IF EXISTS previousNextConstructors;
CREATE TABLE IF NOT EXISTS previousNextConstructors
( constructorId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES constructors(id)
, parentConstructorId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES constructors(id)
, yearFrom INTEGER NOT NULL
, yearTo INTEGER CHECK (yearTo >= yearFrom)
, PRIMARY KEY (constructorId, parentConstructorId, yearFrom)
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
DROP TABLE IF EXISTS engineManufacturers;
CREATE TABLE IF NOT EXISTS engineManufacturers
( id VARCHAR(255) NOT NULL COLLATE NOCASE PRIMARY KEY
, name VARCHAR(255) NOT NULL COLLATE NOCASE
, countryId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES countries(alpha2Code)
);

-- Table: tyreManufacturers
DROP TABLE IF EXISTS tyreManufacturers;
CREATE TABLE IF NOT EXISTS tyreManufacturers
( id VARCHAR(255) NOT NULL COLLATE NOCASE PRIMARY KEY
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

-- Table: sessionEntrants
DROP TABLE IF EXISTS sessionEntrants;
CREATE TABLE IF NOT EXISTS sessionEntrants
( id VARCHAR(255) NOT NULL COLLATE NOCASE PRIMARY KEY 
, driverId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES drivers(id)
, driverNumber INTEGER NOT NULL CHECK (driverNumber >= 0)
, seasonEntrantId VARCHAR(255) COLLATE NOCASE REFERENCES seasonEntrants(id)
, entrantName VARCHAR(255) NOT NULL
, chassisManufacturerId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES companies(id)
, chassisName VARCHAR(255)
, engineName VARCHAR(255)
, engineManufacturerId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES companies(id)
, tyreManufacturerId VARCHAR(255) COLLATE NOCASE REFERENCES tyreManufacturers(id)
, note VARCHAR(255)
);

-- Table: lapTimes
DROP TABLE IF EXISTS lapTimes;
CREATE TABLE IF NOT EXISTS lapTimes 
( entrantId VARCHAR(255) COLLATE NOCASE REFERENCES sessionEntrants(id)
, sessionId VARCHAR(10) NOT NULL REFERENCES sessions(id) ON UPDATE CASCADE
, lap INTEGER NOT NULL CHECK (lap > 0)
, time INTEGER CHECK (time > 0) -- milliseconds
, pos INTEGER CHECK (pos > 0)
, PRIMARY KEY (entrantId, sessionId, lap)
);

-- Table: pitStops
DROP TABLE IF EXISTS pitStops;
CREATE TABLE IF NOT EXISTS pitStops 
( entrantId VARCHAR(255) COLLATE NOCASE REFERENCES sessionEntrants(id)
, sessionId VARCHAR(10) NOT NULL REFERENCES sessions(id) ON UPDATE CASCADE
, lap INTEGER NOT NULL CHECK (lap > 0)
, time INTEGER CHECK (time >= 0) -- milliseconds
, timeOfDay VARCHAR(10)
, annotation VARCHAR(255)
, PRIMARY KEY (entrantId, sessionId, lap)
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
, entrantId VARCHAR(255) COLLATE NOCASE REFERENCES sessionEntrants(id)
, positionOrder INTEGER CHECK (positionOrder > 0)
, positionText VARCHAR(3)
, laps INTEGER CHECK (laps >= 0)
, time INTEGER CHECK (time > 0) -- milliseconds
, PRIMARY KEY (sessionId, entrantId)
);

-- Table: qualifyingResults
DROP TABLE IF EXISTS qualifyingResults;
CREATE TABLE IF NOT EXISTS qualifyingResults
( sessionId VARCHAR(10) NOT NULL REFERENCES sessions(id)
, entrantId VARCHAR(255) COLLATE NOCASE REFERENCES sessionEntrants(id)
, positionOrder INTEGER CHECK (positionOrder > 0)
, positionText VARCHAR(3)
, laps INTEGER CHECK (laps >= 0)
, time INTEGER CHECK (time > 0) -- milliseconds
, PRIMARY KEY (sessionId, entrantId)
);

-- Table: raceResults
DROP TABLE IF EXISTS raceResults;
CREATE TABLE IF NOT EXISTS raceResults
( sessionId VARCHAR(10) NOT NULL REFERENCES sessions(id)
, entrantId VARCHAR(255) COLLATE NOCASE REFERENCES sessionEntrants(id)
, positionOrder INTEGER NOT NULL CHECK (positionOrder > 0)
, positionText VARCHAR(4) NOT NULL
, time INTEGER -- milliseconds
, gridPosition INTEGER CHECK (gridPosition >= 0)
, gridPenalty VARCHAR(10)
, laps INTEGER CHECK (laps >= 0)
, points REAL CHECK (points >= 0) -- not an integer: shortened races award half points
, pointsCountForWDC BOOLEAN NOT NULL CHECK (pointsCountForWDC IN (0, 1))
, pointsGained INTEGER
, timePenalty INTEGER
, reasonRetired VARCHAR(255)
, PRIMARY KEY (sessionId, entrantId, positionOrder)
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

-- Table: seasonEntrants
DROP TABLE IF EXISTS seasonEntrants;
CREATE TABLE IF NOT EXISTS seasonEntrants
( id VARCHAR(255) NOT NULL COLLATE NOCASE PRIMARY KEY 
, season INTEGER NOT NULL 
, name VARCHAR(255) NOT NULL COLLATE NOCASE
, countryId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES countries(alpha2Code)
);

COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
