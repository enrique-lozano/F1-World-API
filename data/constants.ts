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
  'redFlags',
  'safetyCars',
  'pitStops',
  'lapTimes',
  'preQualifyingResults',
  'qualifyingResults',
  'qualifying1_results',
  'qualifying2_results',
  'fp1_results',
  'fp2_results',
  'fp3_results',
  'fp4_results',
  'warmingUpResults',
  'raceResults',
  'sprintQualifyingResults',
  'seasonEntrants',
  'eventEntrants'
];
