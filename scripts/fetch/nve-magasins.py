#!/usr/bin/env python3
"""
NVE Magasinstatistikk Data Fetcher
Fetches reservoir data from NVE API and caches it locally
"""

import json
import requests
import os
from datetime import datetime
from pathlib import Path

# Configuration
BASE_URL = "https://biapi.nve.no/magasinstatistikk"
CACHE_DIR = Path("data/cached/nve")
CACHE_DIR.mkdir(parents=True, exist_ok=True)

def fetch_json(endpoint):
    """Fetch JSON data from NVE API"""
    url = f"{BASE_URL}{endpoint}"
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return response.json()

def get_area_mapping(areas_data):
    """Create mapping from area numbers to names"""
    mapping = {}
    
    # Add Norway (omrnr 0)
    mapping[0] = "Norge"
    
    # Add elspot areas (NO1-NO5)
    for area in areas_data[0]["elspot"]:
        omrnr = area["omrnr"]
        navn = area["navn"]
        if navn.startswith("NO "):
            # Convert "NO 1" to "NO1"
            mapping[omrnr] = navn.replace(" ", "")
        else:
            mapping[omrnr] = navn
    
    return mapping

def normalize_all_series(data, area_mapping):
    """Normalize the main data series"""
    normalized = []
    for row in data:
        omrnr = row["omrnr"]
        area_name = area_mapping.get(omrnr, f"Unknown_{omrnr}")
        
        normalized.append({
            "year": int(row["iso_aar"]),
            "week": int(row["iso_uke"]),
            "area": area_name,
            "fillPct": float(row["fyllingsgrad"]) * 100,  # Convert to percentage
            "capacityTWh": float(row["kapasitet_TWh"]),
            "fillingTWh": float(row["fylling_TWh"]),
            "changePct": float(row["endring_fyllingsgrad"]) * 100
        })
    return normalized

def normalize_min_max_median(data, area_mapping):
    """Normalize the min/max/median statistics"""
    normalized = []
    for row in data:
        omrnr = row["omrnr"]
        area_name = area_mapping.get(omrnr, f"Unknown_{omrnr}")
        
        normalized.append({
            "area": area_name,
            "week": int(row["iso_uke"]),
            "min": float(row["minFyllingsgrad"]) * 100,  # Convert to percentage
            "max": float(row["maxFyllingsgrad"]) * 100,  # Convert to percentage
            "median": float(row["medianFyllingsGrad"]) * 100  # Convert to percentage
        })
    return normalized

def write_json_file(data, filename):
    """Write data to JSON file with metadata"""
    metadata = {
        "source": "NVE Magasinstatistikk",
        "url": "https://biapi.nve.no/magasinstatistikk",
        "description": "Norwegian reservoir statistics from NVE",
        "last_updated": datetime.now().isoformat(),
        "data_points": len(data) if isinstance(data, list) else 1
    }
    
    output = {
        "metadata": metadata,
        "data": data
    }
    
    filepath = CACHE_DIR / filename
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Wrote {filepath} ({len(json.dumps(output))} bytes)")

def main():
    """Main function to fetch and cache all NVE data"""
    print("Fetching NVE Magasinstatistikk data...")
    
    try:
        # Fetch areas first to get the mapping
        print("Fetching areas...")
        areas = fetch_json("/api/Magasinstatistikk/HentOmråder")
        write_json_file(areas, "areas.json")
        
        # Create area mapping
        area_mapping = get_area_mapping(areas)
        print(f"Area mapping: {area_mapping}")
        
        # Fetch all data series
        print("Fetching all series data...")
        all_series = fetch_json("/api/Magasinstatistikk/HentOffentligData")
        normalized_all = normalize_all_series(all_series, area_mapping)
        write_json_file(normalized_all, "all-series.json")
        
        # Fetch min/max/median statistics
        print("Fetching min/max/median statistics...")
        min_max_median = fetch_json("/api/Magasinstatistikk/HentOffentligDataMinMaxMedian")
        normalized_stats = normalize_min_max_median(min_max_median, area_mapping)
        write_json_file(normalized_stats, "min-max-median.json")
        
        print("✓ All NVE data fetched and cached successfully!")
        
    except requests.RequestException as e:
        print(f"✗ Error fetching data: {e}")
        return 1
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
