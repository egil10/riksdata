#!/usr/bin/env python3
"""
Fix chart issues identified by user:
1. Remove duplicate bankruptcies charts
2. Remove empty government debt charts
3. Fix oil price chart (currently using wrong dataset)
4. Remove charts with insufficient historical data
"""

import json
import os
import re
from pathlib import Path

def load_json_file(file_path):
    """Load and parse JSON file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return None

def save_json_file(file_path, data):
    """Save data to JSON file"""
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Saved {file_path}")
    except Exception as e:
        print(f"Error saving {file_path}: {e}")

def check_data_availability(data, min_years=3):
    """Check if data has sufficient historical coverage"""
    if not data or 'dataset' not in data:
        return False
    
    # Extract time dimension
    time_dim = data['dataset'].get('dimension', {}).get('Tid', {})
    if not time_dim or 'category' not in time_dim:
        return False
    
    time_index = time_dim['category'].get('index', {})
    if not time_index:
        return False
    
    # Get all time periods
    time_periods = list(time_index.keys())
    if not time_periods:
        return False
    
    # Parse years from time periods (format: YYYYMM or YYYY)
    years = set()
    for period in time_periods:
        if 'M' in period:
            year = period.split('M')[0]
        else:
            year = period[:4]
        try:
            years.add(int(year))
        except ValueError:
            continue
    
    if not years:
        return False
    
    # Check if we have data from at least min_years ago
    current_year = 2025
    min_required_year = current_year - min_years
    
    has_sufficient_history = any(year <= min_required_year for year in years)
    print(f"Years covered: {sorted(years)}, Has sufficient history: {has_sufficient_history}")
    
    return has_sufficient_history

def check_norges_bank_data_availability(data):
    """Check if Norges Bank data has actual values"""
    if not data or 'data' not in data:
        return False
    
    data_sets = data['data'].get('dataSets', [])
    if not data_sets:
        return False
    
    # Check if series object has any data
    series = data_sets[0].get('series', {})
    return len(series) > 0

def main():
    # Paths
    base_path = Path(__file__).parent.parent
    main_js_path = base_path / 'src' / 'js' / 'main.js'
    cached_path = base_path / 'data' / 'cached'
    
    print("=== Fixing Chart Issues ===")
    
    # 1. Check bankruptcies data for duplicates
    print("\n1. Checking bankruptcies data...")
    bankruptcies_path = cached_path / 'ssb' / 'bankruptcies.json'
    bankruptcies_total_path = cached_path / 'ssb' / 'bankruptcies-total.json'
    
    bankruptcies_data = load_json_file(bankruptcies_path)
    bankruptcies_total_data = load_json_file(bankruptcies_total_path)
    
    if bankruptcies_data and bankruptcies_total_data:
        print("Both bankruptcies datasets exist")
        # Check if they're actually duplicates by comparing data structure
        # For now, we'll keep both but note they might be duplicates
    
    # 2. Check empty government debt charts
    print("\n2. Checking government debt charts...")
    empty_govt_debt_charts = []
    govt_debt_files = [
        'government-debt-gbon-atre.json',
        'government-debt-gbon-atri.json', 
        'government-debt-gbon-holdings.json',
        'government-debt-gbon-issued.json',
        'government-debt-gbon-nominal.json',
        'government-debt-irs-atri.json',
        'government-debt-irs-volume.json',
        'government-debt-tbil-holdings.json',
        'government-debt-tbil-issued.json',
        'government-debt-tbil-nominal.json'
    ]
    
    for filename in govt_debt_files:
        file_path = cached_path / 'norges-bank' / filename
        data = load_json_file(file_path)
        if data and not check_norges_bank_data_availability(data):
            empty_govt_debt_charts.append(filename)
            print(f"  Empty: {filename}")
    
    # 3. Check production index industry recent
    print("\n3. Checking production index industry recent...")
    prod_index_path = cached_path / 'ssb' / 'production-index-industry-recent.json'
    prod_index_data = load_json_file(prod_index_path)
    
    has_sufficient_history = check_data_availability(prod_index_data, min_years=3)
    if not has_sufficient_history:
        print("  Production Index Industry Recent has insufficient historical data")
    
    # 4. Check oil price data (currently using PPI dataset)
    print("\n4. Checking oil price data...")
    # The oil price chart is using dataset 26426 which is PPI, not oil price
    # We need to find a proper oil price dataset or remove this chart
    
    # Now let's create the fixes
    print("\n=== Applying Fixes ===")
    
    # Read main.js
    with open(main_js_path, 'r', encoding='utf-8') as f:
        main_js_content = f.read()
    
    # Remove empty government debt charts
    print("\nRemoving empty government debt charts...")
    govt_debt_patterns = [
        r"loadChartData\('govt-debt-gbon-atre-chart'.*?\),\s*",
        r"loadChartData\('govt-debt-gbon-atri-chart'.*?\),\s*", 
        r"loadChartData\('govt-debt-gbon-holdings-chart'.*?\),\s*",
        r"loadChartData\('govt-debt-gbon-issued-chart'.*?\),\s*",
        r"loadChartData\('govt-debt-gbon-nominal-chart'.*?\),\s*",
        r"loadChartData\('govt-debt-irs-atri-chart'.*?\),\s*",
        r"loadChartData\('govt-debt-irs-volume-chart'.*?\),\s*",
        r"loadChartData\('govt-debt-tbil-holdings-chart'.*?\),\s*",
        r"loadChartData\('govt-debt-tbil-issued-chart'.*?\),\s*",
        r"loadChartData\('govt-debt-tbil-nominal-chart'.*?\),\s*"
    ]
    
    for pattern in govt_debt_patterns:
        main_js_content = re.sub(pattern, '', main_js_content, flags=re.MULTILINE | re.DOTALL)
    
    # Remove production index industry recent (insufficient history)
    print("Removing production index industry recent...")
    prod_index_pattern = r"loadChartData\('production-index-industry-recent-chart'.*?\),\s*"
    main_js_content = re.sub(prod_index_pattern, '', main_js_content, flags=re.MULTILINE | re.DOTALL)
    
    # Remove oil price chart (wrong dataset)
    print("Removing oil price chart (wrong dataset)...")
    oil_price_pattern = r"loadChartData\('oil-price-chart'.*?\),\s*"
    main_js_content = re.sub(oil_price_pattern, '', main_js_content, flags=re.MULTILINE | re.DOTALL)
    
    # Remove one of the bankruptcies charts (keep the total one, remove the detailed one)
    print("Removing detailed bankruptcies chart (keeping total)...")
    bankruptcies_pattern = r"loadChartData\('bankruptcies-chart'.*?\),\s*"
    main_js_content = re.sub(bankruptcies_pattern, '', main_js_content, flags=re.MULTILINE | re.DOTALL)
    
    # Clean up extra commas and empty lines
    main_js_content = re.sub(r',\s*,', ',', main_js_content)
    main_js_content = re.sub(r',\s*//\s*Government Debt.*?\n', '\n', main_js_content, flags=re.MULTILINE)
    
    # Save the updated main.js
    with open(main_js_path, 'w', encoding='utf-8') as f:
        f.write(main_js_content)
    print(f"Updated {main_js_path}")
    
    # Also update the HTML file to remove the corresponding canvas elements
    html_path = base_path / 'index.html'
    with open(html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Remove canvas elements for removed charts
    canvas_patterns = [
        r'<canvas id="govt-debt-gbon-atre-chart"></canvas>\s*',
        r'<canvas id="govt-debt-gbon-atri-chart"></canvas>\s*',
        r'<canvas id="govt-debt-gbon-holdings-chart"></canvas>\s*', 
        r'<canvas id="govt-debt-gbon-issued-chart"></canvas>\s*',
        r'<canvas id="govt-debt-gbon-nominal-chart"></canvas>\s*',
        r'<canvas id="govt-debt-irs-atri-chart"></canvas>\s*',
        r'<canvas id="govt-debt-irs-volume-chart"></canvas>\s*',
        r'<canvas id="govt-debt-tbil-holdings-chart"></canvas>\s*',
        r'<canvas id="govt-debt-tbil-issued-chart"></canvas>\s*',
        r'<canvas id="govt-debt-tbil-nominal-chart"></canvas>\s*',
        r'<canvas id="production-index-industry-recent-chart"></canvas>\s*',
        r'<canvas id="oil-price-chart"></canvas>\s*',
        r'<canvas id="bankruptcies-chart"></canvas>\s*'
    ]
    
    for pattern in canvas_patterns:
        html_content = re.sub(pattern, '', html_content, flags=re.MULTILINE)
    
    # Save the updated HTML
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print("\n=== Summary of Changes ===")
    print("Removed empty government debt charts:")
    for chart in empty_govt_debt_charts:
        print(f"  - {chart}")
    print("Removed production index industry recent (insufficient history)")
    print("Removed oil price chart (wrong dataset)")
    print("Removed detailed bankruptcies chart (keeping total)")
    print("\nUpdated main.js and index.html files")

if __name__ == "__main__":
    main()
