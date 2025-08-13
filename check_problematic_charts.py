#!/usr/bin/env python3
"""
Check and diagnose problematic charts
"""

import json
import os
from pathlib import Path

# Problematic charts from user's list
PROBLEMATIC_CHARTS = {
    # Strange chart format, missing political colours, strange bunch of bars
    'bankruptcies': 'data/cached/ssb/bankruptcies-total.json',
    'cpi-weights-subgroup': 'data/cached/ssb/cpi-weights-subgroup.json',
    'gdp-growth': 'data/cached/ssb/gdp-growth.json',
    'housing-starts': 'data/cached/ssb/housing-starts.json',
    'job-vacancies': 'data/cached/ssb/job-vacancies.json',
    'living-arrangements-national': 'data/cached/ssb/living-arrangements-national.json',
    'trade-balance': 'data/cached/ssb/trade-balance.json',
    
    # Totally empty chart
    'wholesale-retail': 'data/cached/ssb/wholesale-retail.json',
    'unemployment-duration-quarterly': 'data/cached/ssb/unemployment-duration-quarterly.json',
    'salmon-export-volume': 'data/cached/ssb/salmon-export-volume.json',
    'salmon-export': 'data/cached/ssb/salmon-export.json',
    'population-development-quarterly': 'data/cached/ssb/population-development-quarterly.json',
    'oil-gas-investment': 'data/cached/ssb/oil-gas-investment.json',
    'labor-force-quarterly': 'data/cached/ssb/labor-force-quarterly.json',
    'labor-force-monthly': 'data/cached/ssb/labor-force-monthly.json',
    'labor-force-flows': 'data/cached/ssb/labor-force-flows.json',
    'labor-force-annual': 'data/cached/ssb/labor-force-annual.json',
    'job-vacancies': 'data/cached/ssb/job-vacancies.json',
    'energy-accounts': 'data/cached/ssb/energy-accounts.json',
    'employment-status-quarterly': 'data/cached/ssb/employment-status-quarterly.json',
    'employment-status-annual': 'data/cached/ssb/employment-status-annual.json',
    'education-labor-quarterly': 'data/cached/ssb/education-labor-quarterly.json',
    'crime-rate': 'data/cached/ssb/crime-rate.json',
    'credit-indicator-k3': 'data/cached/ssb/credit-indicator-k3.json',
    'cpi-seasonally-adjusted-recent': 'data/cached/ssb/cpi-seasonally-adjusted-recent.json',
    
    # Strange aggregation of data, jumpy or down to zero
    'government-debt': 'data/cached/norges-bank/government-debt.json',
    'interest-rate': 'data/cached/norges-bank/interest-rate.json',
}

def check_file_exists(filepath):
    """Check if file exists and return basic info"""
    path = Path(filepath)
    if not path.exists():
        return False, "File does not exist"
    
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Basic structure check
        if not isinstance(data, dict):
            return True, f"Data is not a dict: {type(data)}"
        
        # Check for required fields
        if 'dataset' not in data:
            return True, "Missing 'dataset' field"
        
        dataset = data['dataset']
        if 'value' not in dataset:
            return True, "Missing 'value' field in dataset"
        
        values = dataset['value']
        if not values:
            return True, "Empty values array"
        
        # Count data points
        data_points = len(values)
        
        # Check for time dimension
        time_dim = None
        for dim in dataset.get('dimension', {}).get('id', []):
            if dim == 'Tid':
                time_dim = dataset['dimension']['Tid']
                break
        
        if time_dim:
            time_values = time_dim.get('category', {}).get('index', {})
            time_count = len(time_values)
            return True, f"OK - {data_points} data points, {time_count} time periods"
        else:
            return True, f"OK - {data_points} data points, no time dimension found"
            
    except json.JSONDecodeError as e:
        return True, f"Invalid JSON: {e}"
    except Exception as e:
        return True, f"Error reading file: {e}"

def analyze_data_structure(filepath):
    """Analyze the data structure in detail"""
    path = Path(filepath)
    if not path.exists():
        return "File does not exist"
    
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if 'dataset' not in data:
            return "No dataset field"
        
        dataset = data['dataset']
        
        # Check dimensions
        dimensions = dataset.get('dimension', {})
        dim_ids = dimensions.get('id', [])
        
        # Check values
        values = dataset.get('value', {})
        
        # Check time dimension
        time_dim = None
        for i, dim_id in enumerate(dim_ids):
            if dim_id == 'Tid':
                time_dim = dimensions.get('Tid', {})
                break
        
        result = {
            'dimensions': dim_ids,
            'dimension_count': len(dim_ids),
            'values_count': len(values),
            'has_time': time_dim is not None,
            'time_categories': len(time_dim.get('category', {}).get('index', {})) if time_dim else 0
        }
        
        return result
        
    except Exception as e:
        return f"Error: {e}"

def main():
    print("=== CHECKING PROBLEMATIC CHARTS ===\n")
    
    missing_files = []
    problematic_files = []
    ok_files = []
    
    for chart_name, filepath in PROBLEMATIC_CHARTS.items():
        print(f"Checking {chart_name}...")
        exists, status = check_file_exists(filepath)
        
        if not exists:
            missing_files.append((chart_name, filepath))
            print(f"  ❌ {status}")
        elif "OK" in status:
            ok_files.append((chart_name, filepath))
            print(f"  ✅ {status}")
        else:
            problematic_files.append((chart_name, filepath))
            print(f"  ⚠️  {status}")
        
        # Detailed analysis for existing files
        if exists:
            structure = analyze_data_structure(filepath)
            if isinstance(structure, dict):
                print(f"    Structure: {structure['dimensions']} dims, {structure['values_count']} values, time: {structure['has_time']}")
            else:
                print(f"    Structure: {structure}")
        
        print()
    
    print("=== SUMMARY ===")
    print(f"✅ OK files: {len(ok_files)}")
    print(f"⚠️  Problematic files: {len(problematic_files)}")
    print(f"❌ Missing files: {len(missing_files)}")
    
    if missing_files:
        print("\n=== MISSING FILES ===")
        for chart_name, filepath in missing_files:
            print(f"  {chart_name}: {filepath}")
    
    if problematic_files:
        print("\n=== PROBLEMATIC FILES ===")
        for chart_name, filepath in problematic_files:
            print(f"  {chart_name}: {filepath}")

if __name__ == '__main__':
    main()
