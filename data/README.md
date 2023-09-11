# F1-World Database

This directory serves as the data source for the entire API. It consists of two directories, each of which contains all the data in different formats:

- csv: Files in `.csv` format. You can easily open and modify them with programs like Excel or Libre Office (better than excel for csv files)
- db: The database (from SQLite) called `myDB.db` will be located here, along with other temporary files that are usually produced during the execution of other scripts, and that can be ignored. You can modify the content of this database with programs like [SQLite Studio](https://sqlitestudio.pl/)

You can modify any of the two directories, keeping in mind that **they must always be fully synchronized**. To do this, two scripts come into play in the root folder of this directory. The `db-import.ts` file contains a script that deletes all the database tables and creates them again with the data from the csv directory, while the `db-export.ts` file contains a script that downloads all the database tables to csv.

To run any of this two scripts, you can type `npm run import-db` or `npm run export-db` respectively.

Before you push any changes to the repository, make sure you have read our [contributing guidelines](https://github.com/enrique-lozano/F1-World-API/blob/main/CONTRIBUTING.md)
