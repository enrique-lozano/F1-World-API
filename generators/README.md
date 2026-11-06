# Generators 🔃

Python scripts that update the data as new races take place. Lap times are fetched from the Ergast API, while results, pit stops and other tables are scraped from the official Formula 1 website. See the header of each script for details.

The scripts are plain Python files in the [percent format](https://jupytext.readthedocs.io/en/latest/formats-scripts.html#the-percent-format): each `# %%` marks a cell, so VS Code (Python/Jupyter extensions) can still run them cell by cell, but they are much easier to review in a pull request than notebooks.

## Setup

Python 3.10+ is required.

```bash
cd generators
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

The scripts read the API, so start it first (`npm run dev` from the project root). Settings such as the output folder, API URL or current season are in [`constants.py`](constants.py).

Generated files are written to `generators/generated/` (ignored by git). Review them, copy the ones you want into [`data/csv`](../data/csv) and run `npm run import-db`.

> If the Ergast API is discontinued, lap times would stop being updated. They could be extracted from the FIA documents, but that would require a complex scraping.
