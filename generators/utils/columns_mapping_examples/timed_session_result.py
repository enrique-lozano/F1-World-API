# Example of keys for a timed session result obj:

from generators.functions import *
from generators.utils.columnDict import ColumnDict

columns_dict: ColumnDict = {
    "entrantId": lambda x, y: find_entrant_id(x["Driver"]),
    "positionOrder": lambda x, y: int(x["Index"]) + 1,
    "positionText": lambda x, y: setDNF(str(x["Pos."])),
    "time": lambda x, y: convert_none_values(convert_to_milliseconds(str(x["Time"]))),
    "laps": lambda x, y: x["Laps"],
}
