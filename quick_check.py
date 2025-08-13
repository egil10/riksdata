#!/usr/bin/env python3
"""
Quick check of problematic charts status
"""

import json
from pathlib import Path

# Problematic charts to check
PROBLEMATIC_CHARTS = {
    'bankruptcies': 'data/cached/ssb/bankruptcies-total.json',
    'cpi-weights-subgroup': 'data/cached/ssb/cpi-weights-subgroup.json',
    'gdp-growth': 'data/cached/ssb/gdp-growth.json',
    'housing-starts': 'data/cached/ssb/housing-starts.json',
    'job-vacancies': 'data/cached/ssb/job-vacancies.json',
    'living-arrangements-national': 'data/cached/ssb/living-arrangements-national.json',
    'trade-balance': 'data/cached/ssb/trade-balance.json',
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
    'energy-accounts': 'data/cached/ssb/energy-accounts.json',
    'employment-status-quarterly': 'data/cached/ssb/employment-status-quarterly.json',
    'employment-status-annual': 'data/cached/ssb/employment-status-annual.json',
    'education-labor-quarterly': 'data/cached/ssb/education-labor-quarterly.json',
    'crime-rate': 'data/cached/ssb/crime-rate.json',
    'credit-indicator-k3': 'data/cached/ssb/credit-indicator-k3.json',
    'cpi-seasonally-adjusted-recent': 'data/cached/ssb/cpi-seasonally-adjusted-recent.json',
    'government-debt': 'data/cached/norges-bank/government-debt.json',
    'interest-rate': 'data/cached/norges-bank/interest-rate.json',
}

def check_file(filepath):
    """Check if file exists and has data"""
    path = Path(filepath)
    if not path.exists():
        return False, "Missing"
    
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Check for SSB format
        if 'dataset' in data:
            values = data['dataset'].get('value', {})
            return True, f"OK ({len(values)} values)"
        # Check for Norges Bank SDMX format
        elif 'data' in data and 'dataSets' in data['data']:
            dataSet = data['data']['dataSets'][0]
            series = dataSet.get('series', {})
            total_values = 0
            for seriesKey in series:
                observations = series[seriesKey].get('observations', {})
                total_values += len(observations)
            return True, f"OK ({total_values} values)"
        else:
            return True, "Wrong format"
            
    except Exception as e:
        return True, f"Error: {e}"

def main():
    print("=== QUICK CHECK OF PROBLEMATIC CHARTS ===\n")
    
    missing = []
    ok = []
    problematic = []
    
    for chart_name, filepath in PROBLEMATIC_CHARTS.items():
        exists, status = check_file(filepath)
        
        if not exists:
            missing.append(chart_name)
            print(f"❌ {chart_name}: {status}")
        elif "OK" in status:
            ok.append(chart_name)
            print(f"✅ {chart_name}: {status}")
        else:
            problematic.append(chart_name)
            print(f"⚠️  {chart_name}: {status}")
    
    print(f"\n=== SUMMARY ===")
    print(f"✅ OK: {len(ok)}")
    print(f"⚠️  Problematic: {len(problematic)}")
    print(f"❌ Missing: {len(missing)}")
    
    if missing:
        print(f"\nMissing charts: {', '.join(missing)}")

if __name__ == '__main__':
    main()
