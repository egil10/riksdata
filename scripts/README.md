# Scripts Directory

This directory contains Python scripts for data fetching and processing.

## Oslo Indices Fetcher

### `fetch/fetch_oslo_indices.py`

Fetches OSEAX and OSEBX data from Yahoo Finance using yfinance and saves it to JSON format.

#### Usage

```bash
cd scripts
python fetch/fetch_oslo_indices.py
```

#### Features

- Fetches OSEAX (Oslo Stock Exchange All Share Index) data
- Attempts to fetch OSEBX (Oslo Stock Exchange Benchmark Index) data
- Saves data in JSON format compatible with the dashboard
- Updates metadata automatically
- Handles rate limiting and alternative tickers

#### Dependencies

Install required packages:

```bash
pip install -r requirements.txt
```

#### Output

- Data saved to `data/cached/oslo-indices/`
- Metadata updated in `data/cached/metadata.json`
- Console output showing fetch results

#### Data Format

The script generates JSON files with the following structure:

```json
{
  "metadata": {
    "source": "Yahoo Finance",
    "ticker": "^OSEAX",
    "name": "OSEAX",
    "description": "OSEAX - Oslo Stock Exchange Index",
    "frequency": "monthly",
    "last_updated": "2025-08-17T14:53:47.134224",
    "data_points": 96,
    "date_range": {
      "start": "2013-03-01",
      "end": "2021-02-01"
    }
  },
  "data": [
    {
      "date": "2013-03-01",
      "value": 518.7000122070312,
      "volume": 3228000000,
      "open": 520.530029296875,
      "high": 529.6799926757812,
      "low": 516.219970703125
    }
  ]
}
```

## Requirements

### `requirements.txt`

Lists Python dependencies for the data fetching scripts:

- yfinance>=0.2.18
- pandas>=1.5.0
- requests>=2.28.0
- python-dateutil>=2.8.0
