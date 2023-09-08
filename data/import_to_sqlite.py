import csv
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
    "qualifying1_results",
    "qualifying2_results",
    "fp1_results",
    "fp2_results",
    "fp3_results",
    "fp4_results",
    "warmingUpResults",
    "raceResults",
    "sprintQualifyingResults",
    "seasonEntrants",
    "eventEntrants",
]

with open("csv/eventEntrants.csv", "r") as csv_file:
    csv_reader = csv.reader(csv_file)

    # Create a dictionary to store rows where the first two columns are equal
    rows = []

    # Iterate through each row in the CSV
    for index, row in enumerate(csv_reader):
        # print(row)
        # Get the values of the first two columns
        first_column = row[0]
        second_column = row[1]

        rows.append(row[0] + "-" + row[1] + "-" + row[2] + "-" + row[4])

# Print the rows where the first two columns are equal
# print(rows)

from collections import Counter

# Count the occurrences of each element
element_counts = Counter(rows)

# Print repeated elements
for element, count in element_counts.items():
    if count > 1:
        print(f"'{element}' is repeated {count} times.")

print("------------------------")

for file in files:
    df = pd.read_csv(f"csv/{file}.csv", keep_default_na=False, na_values=[""])
    df.to_sql(file, sqlite_db, if_exists="append", index=False)

print("\nAll done! Data correctly imported to the DB")

sqlite_db.close()
