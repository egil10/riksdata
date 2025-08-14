#!/usr/bin/env python3
"""
Test chart data parsing by simulating JavaScript logic
"""

import json
import os
from datetime import datetime

def parse_time_label(time_label):
    """Simulate the parseTimeLabel function from utils.js"""
    try:
        # Handle yearly format: "2023"
        if time_label.isdigit() and len(time_label) == 4:
            return datetime(int(time_label), 1, 1)
        
        # Handle year interval format: "2007-2008" (use the first year)
        if '-' in time_label and len(time_label.split('-')) == 2:
            start_year = time_label.split('-')[0]
            if start_year.isdigit():
                return datetime(int(start_year), 1, 1)
        
        # Handle monthly format: "2023M01", "2023M02", etc.
        if 'M' in time_label and len(time_label) == 7:
            year = time_label[:4]
            month = time_label[5:7]
            if year.isdigit() and month.isdigit():
                return datetime(int(year), int(month), 1)
        
        # Handle quarterly format: "2023K1", "2023K2", etc.
        if 'K' in time_label and len(time_label) == 6:
            year = time_label[:4]
            quarter = time_label[5]
            if year.isdigit() and quarter.isdigit():
                month = (int(quarter) - 1) * 3 + 1
                return datetime(int(year), month, 1)
        
        return None
    except:
        return None

def test_ssb_data_parsing(data_path, chart_title):
    """Test SSB data parsing for a specific chart"""
    print(f"🔍 Testing {chart_title} ({data_path}):")
    
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        dataset = data.get('dataset', {})
        dimension = dataset.get('dimension', {})
        values = dataset.get('value', [])
        
        if not dimension or not values:
            print("  ❌ No dimension or values found")
            return []
        
        # Get time dimension
        tid_dimension = dimension.get('Tid', {})
        if not tid_dimension:
            print("  ❌ No time dimension found")
            return []
        
        time_labels = tid_dimension.get('category', {}).get('label', {})
        time_indices = tid_dimension.get('category', {}).get('index', {})
        
        if not time_labels or not time_indices:
            print("  ❌ No time labels or indices found")
            return []
        
        # Get content dimension if it exists
        content_dimension = dimension.get('ContentsCode', {})
        content_labels = {}
        content_indices = {}
        if content_dimension:
            content_labels = content_dimension.get('category', {}).get('label', {})
            content_indices = content_dimension.get('category', {}).get('index', {})
        
        # Find target content index
        target_content_index = 0
        if content_indices:
            # Look for specific content types
            for key, label in content_labels.items():
                label_lower = str(label).lower()
                if any(term in label_lower for term in ['index', 'total', 'rate', 'main']):
                    target_content_index = content_indices[key]
                    print(f"  📊 Selected content: {label}")
                    break
            else:
                # Use first available content
                if content_indices:
                    first_key = list(content_indices.keys())[0]
                    target_content_index = content_indices[first_key]
                    print(f"  📊 Using first content: {content_labels.get(first_key, 'Unknown')}")
        
        # Parse data points
        data_points = []
        num_content_types = len(content_indices) if content_indices else 1
        
        for time_key, time_label in time_labels.items():
            time_index = time_indices[time_key]
            date = parse_time_label(str(time_label))
            
            if date:
                value_index = time_index * num_content_types + target_content_index
                if value_index < len(values):
                    value = values[value_index]
                    if value is not None:
                        data_points.append({
                            'date': date.strftime('%Y-%m-%d'),
                            'value': float(value)
                        })
        
        # Sort by date
        data_points.sort(key=lambda x: x['date'])
        
        print(f"  ✅ Found {len(data_points)} data points")
        if data_points:
            print(f"  📈 Date range: {data_points[0]['date']} to {data_points[-1]['date']}")
            print(f"  📊 Sample values: {[d['value'] for d in data_points[:5]]}")
        
        return data_points
        
    except Exception as e:
        print(f"  ❌ Error parsing data: {e}")
        return []

def test_static_oil_fund_data(data_path):
    """Test static oil fund data parsing"""
    print(f"🔍 Testing Oil Fund Value ({data_path}):")
    
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        data_array = data.get('data', [])
        if not data_array:
            print("  ❌ No data array found")
            return []
        
        data_points = []
        for item in data_array:
            year = item.get('year')
            total = item.get('total')
            if year and total is not None:
                date = datetime(year, 1, 1)
                data_points.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'value': float(total)
                })
        
        data_points.sort(key=lambda x: x['date'])
        
        print(f"  ✅ Found {len(data_points)} data points")
        if data_points:
            print(f"  📈 Date range: {data_points[0]['date']} to {data_points[-1]['date']}")
            print(f"  📊 Sample values: {[d['value'] for d in data_points[:5]]}")
        
        return data_points
        
    except Exception as e:
        print(f"  ❌ Error parsing data: {e}")
        return []

def main():
    """Test all the charts mentioned as 'empty'"""
    charts_to_test = [
        ('crime-rate-chart', 'data/cached/ssb/crime-rate.json', 'Crime Rate'),
        ('gdp-growth-chart', 'data/cached/ssb/gdp-growth.json', 'GDP Growth'),
        ('housing-starts-chart', 'data/cached/ssb/housing-starts.json', 'Housing Starts'),
        ('job-vacancies-chart', 'data/cached/ssb/job-vacancies.json', 'Job Vacancies'),
        ('living-arrangements-national-chart', 'data/cached/ssb/living-arrangements-national.json', 'Living Arrangements National'),
        ('trade-balance-chart', 'data/cached/ssb/trade-balance.json', 'Trade Balance'),
        ('oil-fund-chart', 'data/static/oil-fund.json', 'Oil Fund Value')
    ]
    
    print("🔍 Testing data parsing for 'empty' charts...")
    print()
    
    results = {}
    
    for chart_id, data_path, chart_title in charts_to_test:
        if not os.path.exists(data_path):
            print(f"❌ Data file not found: {data_path}")
            continue
        
        if chart_id == 'oil-fund-chart':
            data_points = test_static_oil_fund_data(data_path)
        else:
            data_points = test_ssb_data_parsing(data_path, chart_title)
        
        results[chart_id] = data_points
        print()
    
    # Summary
    print("📋 SUMMARY:")
    print()
    for chart_id, data_points in results.items():
        status = "✅" if len(data_points) > 0 else "❌"
        print(f"  {status} {chart_id}: {len(data_points)} data points")
    
    print()
    print("If all charts show ✅ with data points, the issue is likely")
    print("in the JavaScript rendering or chart.js configuration.")

if __name__ == "__main__":
    main()
