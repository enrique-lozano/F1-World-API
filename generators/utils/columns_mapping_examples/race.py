# Example of keys for a race obj:

from generators.functions import *
from generators.utils.columnDict import ColumnDict

columns_dict: ColumnDict = {
    "entrantId": lambda x, y: find_entrant_id(x["Driver"]),
    "positionOrder": lambda x, y: int(x["Index"]) + 1,
    "positionText": lambda x, y: setDNF(str(x["Pos."])),
    "gridPosition": lambda x, y: x["Grid"],
    "gridPenalty": "",
    "time": lambda x, y: convert_none_values(
        convert_to_milliseconds(str(x["Time/Retired"]))
    )
    if x["Index"] == 0
    else convert_none_values(
        convert_to_milliseconds_based_on_first(x, y, "Time/Retired")
    ),
    "timePenalty": "",
    "laps": lambda x, y: x["Vueltas"],
    "points": lambda x, y: convert_none_values(to_number_with_sums(x["Puntos"])),
    "pointsGained": lambda x, y: to_number_with_sums(x["Puntos"]),
    "pointsCountForWDC": 1,
    "reasonRetired": lambda x, y: str(x["Time/Retired"])
    if str(x["Pos."]).lower() in ["ret"]
    else "",
}
