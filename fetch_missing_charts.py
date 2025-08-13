#!/usr/bin/env python3
"""
Fetch missing charts that are causing empty displays
"""

import requests
import json
import time
from pathlib import Path

# Missing datasets that need to be fetched
MISSING_DATASETS = [
    {"id": "1065", "name": "wholesale-retail", "title": "Wholesale Retail Sales"},
    {"id": "04552", "name": "unemployment-duration-quarterly", "title": "Unemployment Duration Quarterly"},
    {"id": "13760", "name": "labor-force-monthly", "title": "Labor Force Monthly"},
    {"id": "14483", "name": "labor-force-quarterly", "title": "Labor Force Quarterly"},
    {"id": "13618", "name": "labor-force-annual", "title": "Labor Force Annual"},
    {"id": "11433", "name": "labor-force-flows", "title": "Labor Force Flows"},
    {"id": "928197", "name": "energy-accounts", "title": "Energy Accounts"},
    {"id": "05110", "name": "employment-status-quarterly", "title": "Employment Status Quarterly"},
    {"id": "05111", "name": "employment-status-annual", "title": "Employment Status Annual"},
    {"id": "14077", "name": "education-labor-quarterly", "title": "Education & Labor Quarterly"},
]

# Norges Bank datasets that need fixing
NORGES_BANK_DATASETS = [
    {"id": "GOVT_KEYFIGURES/V_O+N_V+V_I+ATRI+V_IRS..B.GBON", "name": "government-debt", "title": "Government Debt"},
    {"id": "IR/M.KPRA..", "name": "interest-rate", "title": "Key Policy Rate"},
]

def fetch_ssb_dataset(dataset_id, dataset_name, title):
    """Fetch a single SSB dataset"""
    url = f"https://data.ssb.no/api/v0/dataset/{dataset_id}.json?lang=en"
    
    try:
        print(f"Fetching {title} ({dataset_id})...")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        # Add metadata
        data['_metadata'] = {
            'source': 'SSB',
            'title': title,
            'url': url,
            'fetched_at': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # Save to file
        cache_dir = Path("data/cached/ssb")
        cache_dir.mkdir(parents=True, exist_ok=True)
        
        filepath = cache_dir / f"{dataset_name}.json"
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"  ✅ Saved to {filepath}")
        return True
        
    except Exception as e:
        print(f"  ❌ Failed: {e}")
        return False

def fetch_norges_bank_dataset(dataset_id, dataset_name, title):
    """Fetch a single Norges Bank dataset"""
    url = f"https://data.norges-bank.no/api/data/{dataset_id}"
    
    try:
        print(f"Fetching {title} ({dataset_id})...")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        # Add metadata
        data['_metadata'] = {
            'source': 'Norges Bank',
            'title': title,
            'url': url,
            'fetched_at': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # Save to file
        cache_dir = Path("data/cached/norges-bank")
        cache_dir.mkdir(parents=True, exist_ok=True)
        
        filepath = cache_dir / f"{dataset_name}.json"
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"  ✅ Saved to {filepath}")
        return True
        
    except Exception as e:
        print(f"  ❌ Failed: {e}")
        return False

def main():
    print("=== FETCHING MISSING CHARTS ===\n")
    
    # Fetch SSB datasets
    print("Fetching SSB datasets...")
    ssb_success = 0
    ssb_failed = 0
    
    for dataset in MISSING_DATASETS:
        if fetch_ssb_dataset(dataset['id'], dataset['name'], dataset['title']):
            ssb_success += 1
        else:
            ssb_failed += 1
        
        # Small delay to be respectful to the API
        time.sleep(1)
    
    print(f"\nSSB Results: {ssb_success} successful, {ssb_failed} failed")
    
    # Fetch Norges Bank datasets
    print("\nFetching Norges Bank datasets...")
    nb_success = 0
    nb_failed = 0
    
    for dataset in NORGES_BANK_DATASETS:
        if fetch_norges_bank_dataset(dataset['id'], dataset['name'], dataset['title']):
            nb_success += 1
        else:
            nb_failed += 1
        
        # Small delay to be respectful to the API
        time.sleep(1)
    
    print(f"\nNorges Bank Results: {nb_success} successful, {nb_failed} failed")
    
    print(f"\n=== SUMMARY ===")
    print(f"Total successful: {ssb_success + nb_success}")
    print(f"Total failed: {ssb_failed + nb_failed}")

if __name__ == '__main__':
    main()
