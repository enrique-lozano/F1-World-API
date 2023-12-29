from typing import Any, Callable

import pandas as pd

type ColumnDict = dict[str, Callable[[pd.Series, pd.DataFrame], Any] | int | str]
