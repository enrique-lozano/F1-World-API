import path from 'path';

export const dbFilePath = path.resolve(__dirname, 'db/test.db'); // Desired name for the SQLite database file
export const csvDirectory = path.join(__dirname, 'csv'); // Path of the CSV files

export const tableNames = [
  'countries',
  'countriesCommonNames',
  'countriesOfficialNames',
  'constructors',
  'companies',
  'previousNextConstructors',
  'circuits',
  'grandsPrix',
  'drivers',
  'driversFamilyRelationships',
  'engineManufacturers',
  'tyreManufacturers',
  'events',
  'sessions',
  'redFlags',
  'safetyCars',
  'seasonEntrants',
  'sessionEntrants',
  'pitStops',
  'lapTimes',
  'qualifyingResults',
  'fpResults',
  'raceResults'
] as const;
