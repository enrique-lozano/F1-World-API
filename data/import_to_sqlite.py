import sqlite3

import pandas as pd

sqlite_db = sqlite3.connect("db/myDB.db")

with open("schema.sql", "r") as file:
    db_schema = file.read()

    sqlite_db.executescript(db_schema)

files = [
    "countries",
    "countriesCommonNames",
    "countriesOfficialNames",
    "constructors",
    "companies",
    "previousNextConstructors",
    "circuits",
    "grandsPrix",
    "drivers",
    "driversFamilyRelationships",
    "engineManufacturers",
    "tyreManufacturers",
    "events",
    "redFlags",
    "safetyCars",
    "pitStops",
    "lapTimes",
    "preQualifyingResults",
    "qualifyingResults",
    "fp1_results",
    "fp2_results",
    "fp3_results",
    "fp4_results",
    "warmingUpResults",
    "raceResults",
    "seasonEntrants",
    "eventEntrants",
]

for file in files:
    df = pd.read_csv(f"csv/{file}.csv", keep_default_na=False, na_values=[""])
    df.to_sql(file, sqlite_db, if_exists="append", index=False)

print("\nAll done! Data correctly imported to the DB")

sqlite_db.close()
