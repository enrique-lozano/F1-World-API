# %% [markdown]
# File used to complete the initial constructor descriptions from Wikipedia. The script will only modify the constructors without a description. We no longer require this extense script, since once runned, each constructor will have the wikipedia link as an attribute (we do not need to merge drom Ergast)

# %%
import pandas as pd
from pandas import DataFrame
from zipfile import ZipFile
import os
import bs4 as bs
from urllib import request
from unidecode import unidecode
import re

# %%
# Path of the current data
INPUT_PATH = "./../../src/assets/db/"

# Path to generate the new db files
OUTPUT_PATH = "./../generated/Data to replace to the DB"

if not os.path.exists(OUTPUT_PATH):
   os.makedirs(OUTPUT_PATH)

# %%
ZIP_URL = 'http://ergast.com/downloads/f1db_csv.zip'
TEMP_FILEZIP = "tempfile.zip"
TEMP_FOLDER = "temp/"

zipresp = request.urlopen(ZIP_URL)
tempzip = open(TEMP_FILEZIP, "wb")
tempzip.write(zipresp.read())
tempzip.close()

zf = ZipFile(TEMP_FILEZIP)
zf.extractall(path = TEMP_FOLDER)
zf.close()
os.remove(TEMP_FILEZIP)

# %%
pd.read_json(INPUT_PATH + "constructors.json").info()

# %%
constructors_in_db = pd.read_json(INPUT_PATH + "constructors.json")
constructors_from_ergast = pd.read_csv(TEMP_FOLDER + "constructors.csv")


def find_constructorId(constructor_name: str):
    constructor_name = unidecode(constructor_name).replace("-", " ").lower()

    for index, row in constructors_in_db.iterrows():
        if constructor_name == unidecode(row["name"]).replace("-", " ").lower():
            return str(row["id"])

    for index, row in constructors_in_db.iterrows():
        if constructor_name == unidecode(row["fullName"]).replace("-", " ").lower():
            return str(row["id"])

    for index, row in constructors_in_db.iterrows():
        if (
            constructor_name.split(" ")[-1]
            in unidecode(row["fullName"]).replace("-", " ").lower()
        ):
            return str(row["id"])

    return ""


constructors_from_ergast["dbId"] = constructors_from_ergast.apply(
    lambda x: find_constructorId(x["name"]), axis=1
)


# %%
new_df = (
    constructors_in_db.merge(
        constructors_from_ergast, left_on="id", right_on="dbId", how="left", indicator=True
    )
    .rename(columns={"name_x": "name", "url": "wikiUrl"})
    .drop(
        columns=[
            "dbId",
            "constructorId",
            "constructorRef",
            "name_y",
            "nationality",
            "_merge"
        ]
    ).drop_duplicates("id")
)

new_df


# %%
import math
from re import X


def find_descr(url: str):
    to_return: list[str] = []

    if not type(url) == str:
        return to_return

    try:
        source = request.urlopen(url).read()
    except:
        return to_return

    soup = bs.BeautifulSoup(source, "lxml")

    page_content = soup.find("div", {"class": "mw-parser-output"})

    if type(page_content) is bs.element.Tag:
        tags = page_content.select("p:not(.mw-empty-elt), meta")

        for tag in tags:
            if tag.name == "meta":
                break

            to_push = re.sub(r"[\(\[].*?[\)\]]", "", tag.text.replace("\n", ""))
            to_return.append(to_push)

    return to_return


def getSummary(x):
    to_return = find_descr(x["wikiUrl"])
    if len(to_return) > 0:
        return to_return[:2]


new_df["summary"] = new_df.apply(lambda x: getSummary(x), axis=1)


# %%
new_df

# %%
new_df.to_json(f"{OUTPUT_PATH}/constructors.json", "records")
