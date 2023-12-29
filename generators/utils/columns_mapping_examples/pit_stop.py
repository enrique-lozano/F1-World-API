# Example of keys for a pit stop obj:

from generators.functions import *
from generators.utils.columnDict import ColumnDict

columns_dict: ColumnDict = {
    "entrantId": lambda x, y: find_entrant_id(x["Driver"]),
    "timeOfDay": lambda x, y: x["Time of  Day"],
    "time": lambda x, y: convert_none_values(convert_to_milliseconds(str(x["Time"]))),
    "lap": lambda x, y: x["Lap"],
    "annotation": "",
}
