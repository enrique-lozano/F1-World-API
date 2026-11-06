# %% [markdown]
# File used to generate the first annotations on the pit stops. The rest of the annotations has been enter manually
#

# %%
import pandas as pd

# %%
DATASETS_PATH = "./../data/"

pit_stops = pd.read_json(DATASETS_PATH + "pitStops.json")
pit_stops.head()

# %%
pit_stops.info()


# %%
pit_stops["year"] = pit_stops["eventId"].apply(lambda x: str(x).split("-")[0]).astype("Int64")
pit_stops["pitStopIndex"] = pit_stops.index

pit_stops.groupby(["year"])["time"].describe()


# %% [markdown]
# Here we realize that some pit stops are too large to be real. More than 1000 secs (more than 15mins). So we continue to see what happen:

# %%
pit_stops[(pit_stops["time"] > 1000000) & (pit_stops["year"] == 2016)]

# %% [markdown]
# We can see that red flags are taken into account and count as a Pit Stop. We should fix that

# %%
pit_stops[(pit_stops["driverId"] == "daniel-ricciardo") & (pit_stops["eventId"] == "2016-1")]

# %% [markdown]
# We see that also the "red flags pit stops" count for the total number of pits for the driver. By the moment, we just want to remove the rows of this pits, because we want the median time of the pit. We could deal with the pitStopNumber later on.

# %%
red_flags = pd.read_json(DATASETS_PATH + "redFlags.json")

red_flags.head()

# %%
pit_stops.rename(columns={"lap": "pitStopLap"}, inplace=True)

merged = pd.merge(
    red_flags, pit_stops, on=["eventId"]
)

# %%
# Get the data of the laps with pit stops refearing as a red flag
merged = merged[
    (~merged["pitStopLap"].isna())
    & (
        (merged["pitStopLap"] == merged["lap"])
        | ((merged["pitStopLap"] == merged["lap"] - 1) & (merged["time"] > 200))
        | ((merged["pitStopLap"] == merged["lap"] - 2) & (merged["time"] > 300))
    )
]

merged.info()


# %%
# Add annotations to the pit stops in special cases like this:
pit_stops["annotation"] = ""
pit_stops.loc[merged["pitStopIndex"], "annotation"] = "Red flag"

# %%
# Check that annotations has been added correctly
pit_stops[pit_stops["annotation"] == "Red flag"]

# %%
pit_stops[(pit_stops["time"] > 200000) & (pit_stops["annotation"] == "")]


# %%
# Pit stops that took less than 13.75seg
pit_stops[pit_stops["time"] < 13750].head()

# %% [markdown]
# We can now stop worrying about excessively long stops. There are only a couple of them that are isolated cases and we can manually delete them later. However, we see that there are very short pits. This is in many cases due to drive-throughs, which we must identify

# %%
# Preparing for dropping unreal low-time pits. First, calculate the standard deviation per race, and then, get the values with a high variation from that value
std_per_race = (
    pit_stops[pit_stops["annotation"] == ""]
    .groupby(["eventId", "year"])["time"]
    .aggregate(["std", "median"])
)
std_per_race = std_per_race.rename(
    columns={"std": "pitStopSegsRaceVariation", "median": "pitStopSegsRaceMedian"}
)
std_per_race


# %%
std_per_race = pd.merge(pit_stops[pit_stops["annotation"] == ""], std_per_race, on="eventId")
std_per_race.info()

# %%
# Values with a non-normal low pit-stop
std_per_race["deviation"] = (
    std_per_race["time"] - std_per_race["pitStopSegsRaceMedian"]
) / std_per_race["pitStopSegsRaceVariation"]

low_pit_stops = std_per_race[std_per_race["deviation"] < -1.5].sort_values(by="eventId")

low_pit_stops.tail()


# %%
pit_stops[pit_stops["eventId"] == "2022-2"].sort_values("time")

# %%
low_pit_stops[low_pit_stops["time"] < 13250].head()


# %%
# Now we can get which of this values are because a drive-through

# First, create a df containing all penalties that have the same driver and race that a non-usual low-time pit stop 

penalties = pd.read_json(DATASETS_PATH + "penalties.json")
low_pits_with_penalties = pd.merge(low_pit_stops, penalties, on=["eventId", "driverId"])

print(f"{len(low_pits_with_penalties)} rows with rare low-pit time and a penalty in the same race:\n")
low_pits_with_penalties.sort_values("time").head()

# %%
# Secondly, we filter that df with only the penalties that are drive-through
low_pits_with_penalties = low_pits_with_penalties[
    low_pits_with_penalties["Outcome"].apply(
        lambda x: "Drive-through penalty" in str(x).split(",")
    )
]

print(f"{len(low_pits_with_penalties)} rows with drive-through:\n")
low_pits_with_penalties.sort_values("time").head()


# %%
pit_stops.loc[low_pits_with_penalties["pitStopIndex"].astype("int").to_list(), "annotation"] = "Drive-through"

# %%
# Remove pits where cars follow the SC
index_to_note = (
    pit_stops[
        ((pit_stops["eventId"] == "2017-8") & (pit_stops["pitStopLap"] == 17))
        | ((pit_stops["eventId"] == "2021-6") & (pit_stops["pitStopLap"] == 47))
    ]["pitStopIndex"]
    .astype("int")
    .to_list()
)

pit_stops.loc[index_to_note, "annotation"] = "All cars follow the SC through the pit lane"


# %%
pit_stops.groupby("annotation").count()

# %%
# Same way as before, but with the long pits
long_pit_stops = std_per_race[(std_per_race["deviation"] > 1.5) & (std_per_race["time"] < 45000)].sort_values(by="eventId")

long_pits_with_penalties = pd.merge(
    long_pit_stops, penalties, on=["eventId", "driverId"]
)

# Secondly, we filter that df with only the penalties that are drive-through
long_pits_with_penalties = long_pits_with_penalties[
    long_pits_with_penalties["Outcome"].apply(
        lambda x: "Ten-second stop-go penalty" in str(x).split(",")
        or "Ten-second time penalty" in str(x).split(",")
        or "Five-second time penalty" in str(x).split(",")
    )
]

long_pits_with_penalties.head()


# %%
pit_stops.loc[
    long_pits_with_penalties["pitStopIndex"].astype("int").to_list(), "annotation"
] = (long_pits_with_penalties["Outcome"].apply(lambda x: str(x).split(",")[0])).values

# %%
# ---------------- FINAL MODIFICATIONS ------------------

pit_stops.drop(columns=["year", "pitStopIndex"], inplace=True)
pit_stops.rename(columns={"pitStopLap": "lap"}, inplace=True)

pit_stops.groupby("annotation").count()

# %%
pit_stops.to_json("./pitStops.json", "records")
