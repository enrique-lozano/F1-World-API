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
, type VARCHAR(255) NOT NULL COLLATE NOCASE
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
, yearTo INTEGER
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

-- Table: countriesOfficialNames
DROP TABLE IF EXISTS countriesOfficialNames;
CREATE TABLE IF NOT EXISTS countriesOfficialNames
( countryId VARCHAR(255)  PRIMARY KEY NOT NULL COLLATE NOCASE REFERENCES countries(alpha2Code) 
, en VARCHAR(255) COLLATE NOCASE NOT NULL
, ces VARCHAR(255) COLLATE NOCASE
, deu VARCHAR(255) COLLATE NOCASE
, est VARCHAR(255) COLLATE NOCASE
, fin VARCHAR(255) COLLATE NOCASE
, fra VARCHAR(255) COLLATE NOCASE
, hrv VARCHAR(255) COLLATE NOCASE
, hun VARCHAR(255) COLLATE NOCASE
, ita VARCHAR(255) COLLATE NOCASE
, jpn VARCHAR(255) COLLATE NOCASE
, kor VARCHAR(255) COLLATE NOCASE
, nld VARCHAR(255) COLLATE NOCASE
, per VARCHAR(255) COLLATE NOCASE
, pol VARCHAR(255) COLLATE NOCASE
, por VARCHAR(255) COLLATE NOCASE
, rus VARCHAR(255) COLLATE NOCASE
, slk VARCHAR(255) COLLATE NOCASE
, spa VARCHAR(255) COLLATE NOCASE
, swe VARCHAR(255) COLLATE NOCASE
, urd VARCHAR(255) COLLATE NOCASE
, zho VARCHAR(255) COLLATE NOCASE
, cym VARCHAR(255) COLLATE NOCASE
);

-- Table: countriesCommonNames
DROP TABLE IF EXISTS countriesCommonNames;
CREATE TABLE IF NOT EXISTS countriesCommonNames
( countryId VARCHAR(255)  PRIMARY KEY NOT NULL COLLATE NOCASE REFERENCES countries(alpha2Code)
, en VARCHAR(255) COLLATE NOCASE NOT NULL
, ces VARCHAR(255) COLLATE NOCASE
, deu VARCHAR(255) COLLATE NOCASE
, est VARCHAR(255) COLLATE NOCASE
, fin VARCHAR(255) COLLATE NOCASE
, fra VARCHAR(255) COLLATE NOCASE
, hrv VARCHAR(255) COLLATE NOCASE
, hun VARCHAR(255) COLLATE NOCASE
, ita VARCHAR(255) COLLATE NOCASE
, jpn VARCHAR(255) COLLATE NOCASE
, kor VARCHAR(255) COLLATE NOCASE
, nld VARCHAR(255) COLLATE NOCASE
, per VARCHAR(255) COLLATE NOCASE
, pol VARCHAR(255) COLLATE NOCASE
, por VARCHAR(255) COLLATE NOCASE
, rus VARCHAR(255) COLLATE NOCASE
, slk VARCHAR(255) COLLATE NOCASE
, spa VARCHAR(255) COLLATE NOCASE
, swe VARCHAR(255) COLLATE NOCASE
, urd VARCHAR(255) COLLATE NOCASE
, zho VARCHAR(255) COLLATE NOCASE
, cym VARCHAR(255) COLLATE NOCASE
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
, gender VARCHAR(255) NOT NULL COLLATE NOCASE
, dateOfBirth VARCHAR(11) NOT NULL
, dateOfDeath VARCHAR(11)
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
, AisToB VARCHAR(255) NOT NULL COLLATE NOCASE
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

-- Table: eventEntrants
DROP TABLE IF EXISTS eventEntrants;
CREATE TABLE IF NOT EXISTS eventEntrants
( id VARCHAR(255) NOT NULL COLLATE NOCASE PRIMARY KEY 
, driverId TEXT NOT NULL REFERENCES drivers(id)
, driverNumber INTEGER NOT NULL
, seasonEntrantId VARCHAR(255) REFERENCES seasonEntrants(id)
, entrantName VARCHAR(255) NOT NULL
, chassisManufacturerId VARCHAR(255) REFERENCES companies(id) NOT NULL
, chassisName VARCHAR(255)
, engineName VARCHAR(255)
, engineManufacturerId VARCHAR(255)  REFERENCES companies(id) NOT NULL
, tyreManufacturerId VARCHAR(255) REFERENCES tyreManufacturers(id)
, note VARCHAR(255)
);

-- Table: lapTimes
DROP TABLE IF EXISTS lapTimes;
CREATE TABLE IF NOT EXISTS lapTimes 
( entrantId VARCHAR(255) COLLATE NOCASE REFERENCES eventEntrants(id)
, eventId TEXT  NOT NULL REFERENCES events (id)
, lap INTEGER NOT NULL
, time NUMERIC
, pos INTEGER
, PRIMARY KEY (entrantId, eventId, lap)
);

-- Table: pitStops
DROP TABLE IF EXISTS pitStops;
CREATE TABLE IF NOT EXISTS pitStops 
( entrantId VARCHAR(255) COLLATE NOCASE REFERENCES eventEntrants(id)
, eventId TEXT  NOT NULL REFERENCES events (id)
, lap INTEGER NOT NULL
, time NUMERIC
, timeOfDay VARCHAR(10)
, annotation VARCHAR(255)
, PRIMARY KEY (entrantId, eventId, lap)
);

-- Table: events
DROP TABLE IF EXISTS events;
CREATE TABLE IF NOT EXISTS events
( id VARCHAR(10) NOT NULL PRIMARY KEY
, raceDate VARCHAR(11) NOT NULL
, grandPrixId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES grandsPrix(id)
, name VARCHAR(255) NOT NULL COLLATE NOCASE
, qualyFormat VARCHAR(255) NOT NULL COLLATE NOCASE
, circuitId VARCHAR(255) NOT NULL COLLATE NOCASE REFERENCES circuits(id)
, scheduledLaps INTEGER
, posterURL VARCHAR(255) COLLATE NOCASE
);

-- Table: warming_up_results
DROP TABLE IF EXISTS warming_up_results;
CREATE TABLE IF NOT EXISTS warming_up_results
( eventId VARCHAR(10) NOT NULL REFERENCES events(id)
, entrantId VARCHAR(255) COLLATE NOCASE REFERENCES eventEntrants(id)
, positionOrder INTEGER
, positionText VARCHAR(3)
, laps INTEGER
, time INTEGER 
, PRIMARY KEY (eventId, entrantId)
);

-- Table: fp1_results
DROP TABLE IF EXISTS fp1_results;
CREATE TABLE IF NOT EXISTS fp1_results
( eventId VARCHAR(10) NOT NULL REFERENCES events(id)
, entrantId VARCHAR(255) COLLATE NOCASE REFERENCES eventEntrants(id)
, positionOrder INTEGER
, positionText VARCHAR(3)
, laps INTEGER
, time INTEGER
, PRIMARY KEY (eventId, entrantId)
);

-- Table: fp2_results
DROP TABLE IF EXISTS fp2_results;
CREATE TABLE IF NOT EXISTS fp2_results
( eventId VARCHAR(10) NOT NULL REFERENCES events(id)
, entrantId VARCHAR(255) COLLATE NOCASE REFERENCES eventEntrants(id)
, positionOrder INTEGER
, positionText VARCHAR(3)
, laps INTEGER
, time INTEGER
, PRIMARY KEY (eventId, entrantId)
);

-- Table: fp3_results
DROP TABLE IF EXISTS fp3_results;
CREATE TABLE IF NOT EXISTS fp3_results
( eventId VARCHAR(10) NOT NULL REFERENCES events(id)
, entrantId VARCHAR(255) COLLATE NOCASE REFERENCES eventEntrants(id)
, positionOrder INTEGER
, positionText VARCHAR(3)
, laps INTEGER
, time INTEGER
, PRIMARY KEY (eventId, entrantId)
);

-- Table: fp4_results
DROP TABLE IF EXISTS fp4_results;
CREATE TABLE IF NOT EXISTS fp4_results
( eventId VARCHAR(10) NOT NULL REFERENCES events(id)
, entrantId VARCHAR(255) COLLATE NOCASE REFERENCES eventEntrants(id)
, positionOrder INTEGER
, positionText VARCHAR(3)
, laps INTEGER
, time INTEGER
, PRIMARY KEY (eventId, entrantId)
);

-- Table: warmingUpResults
DROP TABLE IF EXISTS warmingUpResults;
CREATE TABLE IF NOT EXISTS warmingUpResults
( eventId VARCHAR(10) NOT NULL REFERENCES events(id)
, entrantId VARCHAR(255) COLLATE NOCASE REFERENCES eventEntrants(id)
, positionOrder INTEGER
, positionText VARCHAR(3)
, laps INTEGER
, time INTEGER
, PRIMARY KEY (eventId, entrantId)
);

-- Table: preQualifyingResults
DROP TABLE IF EXISTS preQualifyingResults;
CREATE TABLE IF NOT EXISTS preQualifyingResults
( eventId VARCHAR(10) NOT NULL REFERENCES events(id)
, entrantId VARCHAR(255) COLLATE NOCASE REFERENCES eventEntrants(id)
, positionOrder INTEGER
, positionText VARCHAR(3)
, laps INTEGER
, time INTEGER
, PRIMARY KEY (eventId, entrantId)
);

-- Table: qualifying1_results
DROP TABLE IF EXISTS qualifying1_results;
CREATE TABLE IF NOT EXISTS qualifying1_results
( eventId VARCHAR(10) NOT NULL REFERENCES events(id)
, entrantId VARCHAR(255) COLLATE NOCASE REFERENCES eventEntrants(id)
, positionOrder INTEGER
, positionText VARCHAR(3)
, laps INTEGER
, time INTEGER
, PRIMARY KEY (eventId, entrantId)
);

-- Table: qualifying2_results
DROP TABLE IF EXISTS qualifying2_results;
CREATE TABLE IF NOT EXISTS qualifying2_results
( eventId VARCHAR(10) NOT NULL REFERENCES events(id)
, entrantId VARCHAR(255) COLLATE NOCASE REFERENCES eventEntrants(id)
, positionOrder INTEGER
, positionText VARCHAR(3)
, laps INTEGER
, time INTEGER
, PRIMARY KEY (eventId, entrantId)
);

-- Table: qualifyingResults
DROP TABLE IF EXISTS qualifyingResults;
CREATE TABLE IF NOT EXISTS qualifyingResults
( eventId VARCHAR(10) NOT NULL REFERENCES events(id)
, entrantId VARCHAR(255) COLLATE NOCASE REFERENCES eventEntrants(id)
, positionOrder INTEGER
, positionText VARCHAR(3)
, time INTEGER
, laps INTEGER
, q1Time INTEGER
, q2Time INTEGER
, q3Time INTEGER
, PRIMARY KEY (eventId, entrantId)
);

-- Table: raceResults
DROP TABLE IF EXISTS raceResults;
CREATE TABLE IF NOT EXISTS raceResults
( eventId VARCHAR(10) NOT NULL REFERENCES events(id)
, entrantId VARCHAR(255) COLLATE NOCASE REFERENCES eventEntrants(id)
, positionOrder INTEGER NOT NULL
, positionText VARCHAR(4) NOT NULL
, time INTEGER
, gridPosition INTEGER
, gridPenalty VARCHAR(10)
, laps INTEGER
, points INTEGER
, pointsCountForWDC BOOLEAN
, pointsGained INTEGER
, gap VARCHAR(255)
, timePenalty INTEGER
, reasonRetired VARCHAR(255)
, PRIMARY KEY (eventId, entrantId, positionOrder)
);

-- Table: sprintQualifyingResults
DROP TABLE IF EXISTS sprintQualifyingResults;
CREATE TABLE IF NOT EXISTS sprintQualifyingResults
( eventId VARCHAR(10) NOT NULL REFERENCES events(id)
, entrantId VARCHAR(255) COLLATE NOCASE REFERENCES eventEntrants(id)
, positionText VARCHAR(4) NOT NULL
, positionOrder INTEGER NOT NULL
, time INTEGER
, gridPos INTEGER
, laps INTEGER
, points INTEGER
, gap VARCHAR(255)
, timePenalty INTEGER
, reasonRetired VARCHAR(255)
, PRIMARY KEY (eventId, entrantId)
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
