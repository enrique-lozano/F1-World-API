import json
from typing import List
from urllib import parse, request

import numpy as np
import pandas as pd
from constants import *
from pandas import DataFrame
from unidecode import unidecode


def make_api_call(url: str) -> dict:
    return json.loads(request.urlopen(url).read())

def download_df(df: DataFrame | None, name: str):
    """ Download a pandas DataFrame if is not None """
    if df is not None:
        df.to_csv(f"{OUTPUT_PATH}/{name}.csv", index=False)

def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False

def find_entrant_id(driver_name: str, car_name: str = ""):
    # driver_name = unidecode(driver_name).replace("-", " ")

    def get_driver_api_path(driver:str):
        return parse.quote(f"{API_PATH}/drivers?name={driver}&birthBefore={SEASON - 10}-01-01&birthAfter={SEASON - 70}-01-01&include=id",
                            safe=':/?&=-')

    driver_res = make_api_call(get_driver_api_path(driver_name))

    if driver_res["totalElements"] == 0 and len(driver_name.split(" ")[-1]) > 3:
        driver_res = make_api_call(
            get_driver_api_path(driver_name.split(" ")[-1]))
        
    if driver_res["totalElements"] == 0 and len(driver_name.split(" ")) > 2:
        # Try the search removing the last part of the driver name if name has more than 3 words
        driver_res = make_api_call(
            get_driver_api_path(' '.join(driver_name.split(' ')[:-1])))
                                     
    results = list(driver_res["data"])

    to_return = []

    for driver in results:
        possible_entrants = make_api_call(
            f"{API_PATH}/session-entrants?driverId={driver["id"]}&season={SEASON}&include=id")
                
        for entrant in list(possible_entrants["data"]):
            to_return.append(entrant["id"])

    if(len(results) > 0):
        return "???".join(to_return)
    
    print(f"[WARN]: Driver entrant not found for {driver_name}")
    
    return "???"

def setDNF(text: str):
    return set_if_value_is_one_of(text, ["nc", "ret"], "DNF")

def set_if_value_is_one_of(to_convert: str, not_accepted_values: List[str], transform_to: str, case_sensitive = False):
    if case_sensitive:
        if to_convert in not_accepted_values:
            return transform_to
        
    if not case_sensitive:
        if to_convert.lower() in [item.lower() for item in not_accepted_values]:
            return transform_to
    
    return to_convert


def convert_none_values(x, convert_to = ""):
    """ 
        Return another value (defaults to an empty string) if the specified param is `None`, 
        and the param itself othewise
    """
    
    if x is None:
        return convert_to

    return x

def to_number_with_sums(value: str, value_if_error = 0):
    try:
        parts = [int(x) for x in value.split("+")]
    except:
        return value_if_error    
    
    try:
        return int(sum(parts))
    except:
        return sum(parts)


def convert_to_milliseconds_based_on_first(
    series: pd.Series, df: DataFrame, columnName:str
):
    """ 
        A function to convert values like '+3.378s' from a series to ms, based on the 
        time of the first result
    """
    first_time = convert_to_milliseconds(str(df.at[0, columnName]))

    if first_time is None:
        return None

    if "lap" not in series[columnName]:
        to_return = convert_to_milliseconds(
            str(series[columnName]).replace("+", "").replace("s", "")
        )

        if to_return is not None:
            return to_return + first_time

    return None

def convert_to_milliseconds(text: str):
    """Receives a string in the format `HH:mm:ss.SSS` and return the converted milliseconds"""

    if not isinstance(text, str) and not np.isnan(float(text)):
        return round(float(text) * 1000)

    try:
        splitted = list(map(float, text.split(":")))
    except:
        return None

    result = splitted[-1]
    if len(splitted) >= 2:
        result += splitted[-2] * 60
    if len(splitted) >= 3:
        result += splitted[-3] * 3600

    return round(result * 1000)
