# F1-World Database

This directory serves as the central hub for managing the API data. This data is present in two directories/formats:

### CSV Files

Files in `.csv` format (in the `csv` directory). This format facilitates tracking changes in the API data and modifying them effortlessly using programs familiar to the user, such as Excel and OpenOffice (the latter is more recommended).

Once you make changes in this directory, if you want the changes to be reflected in the API responses you should run the following command to re-import the database:

```
npm run import-db
```

This files are the only data files that are saved to the remote repository. Before you push any changes to the repository, make sure you have read our [contributing guidelines](https://github.com/enrique-lozano/F1-World-API/blob/main/CONTRIBUTING.md).

### DB Files

Inside the `db` directory, once we imported the database (see [here](https://github.com/enrique-lozano/F1-World-API?tab=readme-ov-file#create-the-database-in-sqlite)), a database file (a SQLite database) called `myDB.db` will be created, along with other temporary files that are usually produced during the execution of other scripts, and that can be ignored. 

The `myDB.db` will be the source of data for the API. You can modify the content of this database with programs like [SQLite Studio](https://sqlitestudio.pl/). 

If you modify the database file directly here, you probably want to export the updated data to the CSV files, since the database files will be not saved in git. For that, you can run:

```
npm run export-db
```
