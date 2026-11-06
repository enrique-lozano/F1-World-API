# %% [markdown]
# ### Data getter from kaggle
#
# Get race events as safety cars and red flags from. We can not get the CSV files from the script because login with Kaggle is needed, so we should download and put the datasets in the input folder (deafults to `./temp`) manually. The source is: https://www.kaggle.com/datasets/jtrotman/formula-1-race-events

# %%
import pandas as pd
import os


# %%
RED_FLAGS_FILE = "temp/red_flags.csv"
SAFETY_CARS_FILE = "temp/safety_cars.csv"

# Path of the current data
INPUT_PATH = "./../data/csv/"

# Path to generate the new db files
OUTPUT_PATH = "generated/Data to replace to the DB"

if not os.path.exists(OUTPUT_PATH):
    os.makedirs(OUTPUT_PATH)


# %%
current_races = pd.read_csv(INPUT_PATH + "events.csv").merge(
    pd.read_csv(INPUT_PATH + "grandsPrix.csv"), right_on="id", left_on="grandPrixId"
)

current_races["year"] = current_races["id_x"].apply(lambda x: str(x).split("-")[0])

current_races.head()


# %%
""" ---------------------------------------------
----------------- RED FLAGS ---------------------
--------------------------------------------- """

red_flags = pd.read_csv(RED_FLAGS_FILE)

red_flags["year"] = red_flags["Race"].apply(lambda x: str(x).split(" ")[0])
red_flags["grand_prix"] = red_flags["Race"].apply(
    lambda x: " ".join(str(x).split(" ")[1:])
)

red_flags.head()

# %%
red_flags = red_flags.merge(
    current_races, left_on=["grand_prix", "year"], right_on=["fullName", "year"]
)

red_flags = red_flags[["Lap", "Resumed", "Incident", "Excluded", "id_x"]]

# Renaming columns:
red_flags.columns = [x.lower() for x in red_flags.columns]
red_flags.rename(columns={"id_x": "eventId"}, inplace=True)

# Save the data:
red_flags.to_csv(f"{OUTPUT_PATH}/redFlags.csv", index=False)


# %%
""" ---------------------------------------------
---------------- SAFETY CAR ---------------------
--------------------------------------------- """


safety_cars = pd.read_csv(SAFETY_CARS_FILE)

safety_cars["year"] = safety_cars["Race"].apply(lambda x: str(x).split(" ")[0])
safety_cars["grand_prix"] = safety_cars["Race"].apply(
    lambda x: " ".join(str(x).split(" ")[1:])
)

safety_cars.head()

# %%
safety_cars = safety_cars.merge(
    current_races, left_on=["grand_prix", "year"], right_on=["fullName", "year"]
)

safety_cars = safety_cars[["Cause", "Deployed", "Retreated", "FullLaps", "id_x"]]

safety_cars["Retreated"] = safety_cars["Retreated"].astype("Int64")

# Renaming columns:
safety_cars.columns = [x.lower() for x in safety_cars.columns]
safety_cars.rename(columns={"id_x": "eventId"}, inplace=True)

# Save the data:
safety_cars.to_csv(f"{OUTPUT_PATH}/safetyCars.csv", index=False)
