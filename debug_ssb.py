#!/usr/bin/env python3
"""
Debug SSB data structure
"""

import requests
import json

def debug_ssb_structure(api_name, url):
    print(f"\n{api_name} Data Structure Analysis")
    print("=" * 50)
    
    response = requests.get(url)
    data = response.json()
    
    # Print top-level structure
    print("Top-level keys:", list(data.keys()))
    
    if 'dataset' in data:
        dataset = data['dataset']
        print("\nDataset keys:", list(dataset.keys()))
        
        if 'dimension' in dataset:
            dimension = dataset['dimension']
            print("\nDimension keys:", list(dimension.keys()))
            
            # Check if Tid exists
            if 'Tid' in dimension:
                tid = dimension['Tid']
                print("\nTid keys:", list(tid.keys()))
                
                if 'category' in tid:
                    category = tid['category']
                    print("\nCategory keys:", list(category.keys()))
                    
                    if 'label' in category:
                        labels = category['label']
                        print(f"\nFirst 5 time labels:")
                        for i, (key, value) in enumerate(list(labels.items())[:5]):
                            print(f"  {key}: {value}")
                    
                    if 'index' in category:
                        indices = category['index']
                        print(f"\nFirst 5 time indices:")
                        for i, (key, value) in enumerate(list(indices.items())[:5]):
                            print(f"  {key}: {value}")
            else:
                print("\n❌ No 'Tid' dimension found!")
                print("Available dimensions:", list(dimension.keys()))
        
        if 'value' in dataset:
            value = dataset['value']
            print(f"\nValue type: {type(value)}")
            if isinstance(value, dict):
                print(f"Value keys (first 10): {list(value.keys())[:10]}")
                print(f"First 5 values:")
                for i, (key, val) in enumerate(list(value.items())[:5]):
                    print(f"  {key}: {val}")
            elif isinstance(value, list):
                print(f"Value list length: {len(value)}")
                print(f"First 5 values: {value[:5]}")

def main():
    apis = {
        "House Prices": "https://data.ssb.no/api/v0/dataset/1060.json?lang=en",
        "Wages": "https://data.ssb.no/api/v0/dataset/1124.json?lang=en"
    }
    
    for name, url in apis.items():
        debug_ssb_structure(name, url)

if __name__ == "__main__":
    main()
