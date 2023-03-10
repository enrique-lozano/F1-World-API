import csv
import os
import sqlite3

import pandas as pd

sqlite_db = sqlite3.connect("db/myDB.db")
c = sqlite_db.cursor()

tables = [
    "countries",
    "countriesCommonNames",
    "countriesOfficialNames",
    "companies",
    "eventEntrants",
    "previousNextConstructors",
    "circuits",
    "grandsPrix",
    "drivers",
    "driversFamilyRelationships",
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
    "sprintQualifyingResults",
    "seasonEntrants",
]


for table in tables:
    c.execute(f"SELECT * FROM {table}")
    columns = [column[0] for column in c.description]
    results = []
    for row in c.fetchall():
        results.append(dict(zip(columns, row)))

    with open(f"csv/{table}.csv", "w+", newline="", encoding="utf-8") as new_file:
        fieldnames = columns
        writer = csv.DictWriter(new_file, fieldnames=fieldnames)
        writer.writeheader()
        for line in results:
            writer.writerow(line)

print("\nAll done! Data correctly export to csv")

sqlite_db.close()
