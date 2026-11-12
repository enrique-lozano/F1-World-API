# %% [markdown]
# ### Data generator from Ergast
#
# Retrieve the data from the ergast API. Currently used for lap times only. The results will be saved in csv files, and should completely replace the files currently in the database with the same name. New data coming from Ergast will be merged with the previous data
#

# %%
import pandas as pd

from utils.columnDict import ColumnDict

from constants import *
from functions import *

# %%
# Auto-create the output directory if needed:
if not os.path.exists(OUTPUT_PATH):
    os.makedirs(OUTPUT_PATH)

# %%
ZIP_URL = "http://ergast.com/downloads/f1db_csv.zip"
TEMP_FILEZIP = "tempfile.zip"
TEMP_FOLDER = "temp/"

zipresp = request.urlopen(ZIP_URL)
tempzip = open(TEMP_FILEZIP, "wb")
tempzip.write(zipresp.read())
tempzip.close()

zf = ZipFile(TEMP_FILEZIP)
zf.extractall(path=TEMP_FOLDER)
zf.close()
os.remove(TEMP_FILEZIP)

# %%
""" ---------------------------------------------
----------------- LAP TIMES ---------------------
--------------------------------------------- """

lap_times_from_ergast = pd.read_csv(TEMP_FOLDER + "lap_times.csv")
races_from_ergast = pd.read_csv(TEMP_FOLDER + "races.csv")
drivers_from_ergast = pd.read_csv(TEMP_FOLDER + "drivers.csv")

drivers_from_ergast["full_name"] = (
    drivers_from_ergast["forename"] + " " + drivers_from_ergast["surname"]
)

lap_times_from_ergast = lap_times_from_ergast.merge(
    races_from_ergast.loc[:, ["raceId", "round", "year"]], on="raceId"
).merge(drivers_from_ergast.loc[:, ["driverId", "full_name"]], on="driverId")

lap_times_from_ergast = lap_times_from_ergast.loc[
    lap_times_from_ergast["year"] == SEASON
]

lap_times_from_ergast.head()

# %%
columns_dict: ColumnDict = {
    "sessionId": lambda x, y: f"{x["year"]}-{str(x["round"]).zfill(2) if x["round"] < 10 else x["round"]}-R",
    "entryId": lambda x, y: find_entry_id(x["full_name"]),
    "time": lambda x, y: x["milliseconds"],
    "pos": lambda x, y: x["position"],
    "lap": lambda x, y: x["lap"],
}


# %%
def create_df_from_other(start_df: DataFrame):
    """
    Create an entire new DataFrame parting on the values of
    another one and the specified transformations
    """

    df_to_return = pd.DataFrame()

    for column in columns_dict.keys():
        columnValue = columns_dict[column]

        if type(columnValue) == str or type(columnValue) == int:
            df_to_return[column] = columnValue
            continue

        df_to_return[column] = start_df.apply(
            lambda x: columnValue(x, start_df), axis=1
        )

    return df_to_return


# %%
download_df(create_df_from_other(lap_times_from_ergast), "ola")
