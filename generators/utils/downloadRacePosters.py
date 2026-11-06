# %% [markdown]
# Utility to bulk download the images of the race events, located in their corresponding file inside the db directory.

# %%
import os
import json
import pandas as pd
from urllib import request
from urllib.request import Request

# %%
# Path of the current data
INPUT_PATH = "./../../data/csv"

# Path to generate the new db files
OUTPUT_PATH = "./../generated/Race Posters"

if not os.path.exists(OUTPUT_PATH):
    os.makedirs(OUTPUT_PATH)


# %%
def download_image(url, name):
    if not type(url) is str:
        return

    source = request.urlopen(
        Request(
            url,
            headers={"User-Agent": "Mozilla/5.0"},
        )
    ).read()

    with open(f"{OUTPUT_PATH}/{name}", "wb") as f:
        f.write(source)



# %%
df = pd.read_csv(f"{INPUT_PATH}/events.csv")


# %%
# Loop through the list and download each image
for i, event in df.iterrows():
    if "posterURL" in event:
        download_image(event["posterURL"], f"{event['id']}.jpg")
