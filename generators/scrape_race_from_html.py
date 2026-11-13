# %%
import pandas as pd
from utils.columnDict import ColumnDict

from constants import *
from functions import *

# %% [markdown]
# #### Step 1: Set Up
#
# Check the `constants.py` file to check that everything is correct. In that file you can specify more things like the API URL or the output path. If your are going to search for entrants, is _mandatory_ that you specify the season constant in this file, to search for the correct entrants
#

# %%
""" 
    Specify a key-value pair where the values are the tables to download (can be locally or in a URL). The
    script will download one CSV file per value.

    The keys string of each value will be the names that the exported files will have
"""

HTML_PATH: dict[str, str] = {
    "my-race-1": "./my-html.html",
    "my-race-2": "https://f1-results-example.com",
}

# %%
# Auto-create the output directory if needed:
if not os.path.exists(OUTPUT_PATH):
    os.makedirs(OUTPUT_PATH)

# %% [markdown]
# #### Step 2:
#
# Now you should create a dictionary of the columns that your CSV will have. The keys will be the column names and the values of the dict the function that will be applied to our HTML pandas dataframe.
#
# You have some examples in the `columns_mapping_examples` directory. You can copy one of the dictionaries from this folder and start to try! You have also several function helpers in the file `functions.py`, to help you parsing the table
#

# %%
columns_dict: ColumnDict = {
    "entryId": lambda x, y: find_entry_id(x["Piloto"]),
    "positionOrder": lambda x, y: int(x["Index"]) + 1,
    "positionText": lambda x, y: setDNF(str(x["Pos."])),
    "gridPosition": lambda x, y: x["Parrilla"],
    "gridPenalty": "",
    "time": lambda x, y: convert_none_values(
        convert_to_milliseconds(str(x["Tiempo/Retirado"]))
    )
    if x["Index"] == 0
    else convert_none_values(
        convert_to_milliseconds_based_on_first(x, y, "Tiempo/Retirado")
    ),
    "timePenalty": "",
    "laps": lambda x, y: x["Vueltas"],
    "points": lambda x, y: convert_none_values(to_number_with_sums(x["Puntos"])),
    "pointsGained": lambda x, y: to_number_with_sums(x["Puntos"]),
    "pointsCountForWDC": 1,
    "retirementReasonId": lambda x, y: retirement_reason_id(str(x["Tiempo/Retirado"]))
    if str(x["Pos."]).lower() in ["ret"]
    else "",
}


# %% [markdown]
# ### Step 3:
#
# The execution of the script start now!
#

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
for key in HTML_PATH.keys():
    df_from_html = pd.read_html(HTML_PATH[key], flavor="bs4")[0]
    df_from_html["Index"] = df_from_html.index

    print(f"✅ Table with {len(df_from_html.index)} rows readed from source.\n")
    print(f"    Columns: {df_from_html.columns.to_list()}")

    download_df(create_df_from_other(df_from_html), key)
