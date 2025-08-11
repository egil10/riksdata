#!/usr/bin/env python3
"""
Debug SSB data structure - Focus on cycling issues
"""

import requests
import json

def debug_cycling_issue(api_name, url):
    print(f"\n{api_name} - Cycling Analysis")
    print("=" * 50)
    
    response = requests.get(url)
    data = response.json()
    
    dataset = data['dataset']
    dimension = dataset['dimension']
    value = dataset['value']
    
    # Check all dimensions to understand the data structure
    print("Available dimensions:", list(dimension.keys()))
    
    # Look for content codes or other dimensions that might explain cycling
    for dim_name, dim_data in dimension.items():
        if dim_name != 'Tid':  # Skip time dimension
            print(f"\n{dim_name} dimension:")
            if 'category' in dim_data and 'label' in dim_data['category']:
                labels = dim_data['category']['label']
                print(f"  Labels: {list(labels.values())[:10]}")  # Show first 10 labels
    
    # Check if there are multiple series causing cycling
    print(f"\nValue array length: {len(value)}")
    print(f"First 20 values: {value[:20]}")
    
    # Check for patterns in the data
    unique_values = set(value[:100])  # Check first 100 values
    print(f"Unique values in first 100: {len(unique_values)}")
    print(f"Sample unique values: {sorted(list(unique_values))[:10]}")

def main():
    apis = {
        "CPI": "https://data.ssb.no/api/v0/dataset/1086.json?lang=en",
        "Unemployment": "https://data.ssb.no/api/v0/dataset/1054.json?lang=en",
        "Producer Prices": "https://data.ssb.no/api/v0/dataset/26426.json?lang=en"
    }
    
    for name, url in apis.items():
        debug_cycling_issue(name, url)

if __name__ == "__main__":
    main()
