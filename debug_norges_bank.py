#!/usr/bin/env python3
"""
Debug Norges Bank API structure
"""

import requests
import json

def debug_norges_bank_structure(api_name, url):
    print(f"\n{api_name} Data Structure Analysis")
    print("=" * 50)
    
    response = requests.get(url)
    data = response.json()
    
    if 'data' in data and 'dataSets' in data['data']:
        dataset = data['data']['dataSets'][0]
        series = dataset['series']
        
        print(f"Number of series: {len(series)}")
        
        # Find series with most observations
        best_series = None
        max_observations = 0
        
        for series_key, series_data in series.items():
            if 'observations' in series_data:
                observation_count = len(series_data['observations'])
                if observation_count > max_observations:
                    max_observations = observation_count
                    best_series = series_key
        
        print(f"Best series: {best_series} with {max_observations} observations")
        
        if best_series:
            best_series_data = series[best_series]
            observations = best_series_data['observations']
            
            print(f"\nFirst 10 observations from {best_series}:")
            for i, (key, value) in enumerate(list(observations.items())[:10]):
                print(f"  {key}: {value}")
            
            print(f"\nLast 5 observations:")
            for key, value in list(observations.items())[-5:]:
                print(f"  {key}: {value}")

def main():
    apis = {
        "Interest Rate": "https://data.norges-bank.no/api/data/IR/M.KPRA..?format=sdmx-json&startPeriod=2000-01-01&endPeriod=2025-08-01&locale=no",
        "Government Debt": "https://data.norges-bank.no/api/data/GOVT_KEYFIGURES/V_O+N_V+V_I+ATRI+V_IRS..B.GBON?endPeriod=2025-08-01&format=sdmx-json&locale=no&startPeriod=2000-01-01"
    }
    
    for name, url in apis.items():
        debug_norges_bank_structure(name, url)

if __name__ == "__main__":
    main()
