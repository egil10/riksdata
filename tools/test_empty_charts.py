#!/usr/bin/env python3
"""
Test data parsing for charts that appear empty
"""

import json
import os

def test_chart_data_parsing():
    """Test data parsing for the specific charts mentioned by the user"""
    
    charts_to_test = [
        ('crime-rate-chart', 'data/cached/ssb/crime-rate.json'),
        ('gdp-growth-chart', 'data/cached/ssb/gdp-growth.json'),
        ('housing-starts-chart', 'data/cached/ssb/housing-starts.json'),
        ('job-vacancies-chart', 'data/cached/ssb/job-vacancies.json'),
        ('living-arrangements-national-chart', 'data/cached/ssb/living-arrangements-national.json'),
        ('trade-balance-chart', 'data/cached/ssb/trade-balance.json'),
        ('oil-fund-chart', 'data/static/oil-fund.json')
    ]
    
    print("🔍 Testing data parsing for 'empty' charts...")
    print()
    
    for chart_id, data_path in charts_to_test:
        print(f"📊 Testing {chart_id}:")
        
        # Check if file exists
        if not os.path.exists(data_path):
            print(f"  ❌ Data file not found: {data_path}")
            continue
        
        # Load and analyze the data
        try:
            with open(data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            print(f"  ✅ Data file loaded: {data_path}")
            print(f"  📁 File size: {os.path.getsize(data_path)} bytes")
            
            # Analyze data structure
            if isinstance(data, dict):
                print(f"  📋 Data keys: {list(data.keys())}")
                
                # Check for common data structures
                if 'data' in data:
                    if isinstance(data['data'], list):
                        print(f"  📊 Data array length: {len(data['data'])}")
                        if len(data['data']) > 0:
                            print(f"  📈 First data point: {data['data'][0]}")
                        else:
                            print(f"  ⚠️  Data array is empty!")
                    else:
                        print(f"  📊 Data type: {type(data['data'])}")
                        print(f"  📈 Data content: {data['data']}")
                
                # Check for SSB-specific structure
                if 'dataset' in data:
                    dataset = data['dataset']
                    if 'value' in dataset:
                        values = dataset['value']
                        print(f"  📊 SSB values length: {len(values)}")
                        if len(values) > 0:
                            print(f"  📈 First few values: {list(values.items())[:3]}")
                        else:
                            print(f"  ⚠️  SSB values are empty!")
                
                # Check for Norges Bank structure
                if 'dataSets' in data:
                    datasets = data['dataSets']
                    print(f"  📊 Norges Bank datasets: {len(datasets)}")
                    if len(datasets) > 0:
                        first_dataset = datasets[0]
                        if 'series' in first_dataset:
                            series = first_dataset['series']
                            print(f"  📈 Series count: {len(series)}")
                            if len(series) > 0:
                                first_series = list(series.values())[0]
                                if 'observations' in first_series:
                                    observations = first_series['observations']
                                    print(f"  📊 Observations count: {len(observations)}")
                                    if len(observations) > 0:
                                        first_obs = list(observations.values())[0]
                                        print(f"  📈 First observation: {first_obs}")
                                    else:
                                        print(f"  ⚠️  Observations are empty!")
            
            else:
                print(f"  📊 Data type: {type(data)}")
                print(f"  📈 Data content: {data}")
            
        except Exception as e:
            print(f"  ❌ Error loading data: {e}")
        
        print()

def check_canvas_elements():
    """Check if canvas elements exist in HTML for these charts"""
    
    charts_to_check = [
        'crime-rate-chart',
        'gdp-growth-chart',
        'housing-starts-chart',
        'job-vacancies-chart',
        'living-arrangements-national-chart',
        'trade-balance-chart',
        'oil-fund-chart'
    ]
    
    print("🎯 Checking canvas elements in HTML:")
    
    with open('index.html', 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    for chart_id in charts_to_check:
        canvas_pattern = f'<canvas id="{chart_id}"'
        if canvas_pattern in html_content:
            print(f"  ✅ {chart_id}: Canvas element found")
        else:
            print(f"  ❌ {chart_id}: Canvas element missing")
    
    print()

def check_js_loading():
    """Check if these charts are being loaded in JavaScript"""
    
    charts_to_check = [
        'crime-rate-chart',
        'gdp-growth-chart',
        'housing-starts-chart',
        'job-vacancies-chart',
        'living-arrangements-national-chart',
        'trade-balance-chart',
        'oil-fund-chart'
    ]
    
    print("📜 Checking JavaScript loading calls:")
    
    with open('src/js/main.js', 'r', encoding='utf-8') as f:
        js_content = f.read()
    
    for chart_id in charts_to_check:
        load_pattern = f"loadChartData('{chart_id}'"
        if load_pattern in js_content:
            print(f"  ✅ {chart_id}: LoadChartData call found")
        else:
            print(f"  ❌ {chart_id}: LoadChartData call missing")
    
    print()

if __name__ == "__main__":
    check_canvas_elements()
    check_js_loading()
    test_chart_data_parsing()
    
    print("🔍 SUMMARY:")
    print("If all checks above show ✅ but charts still appear empty,")
    print("the issue is likely in the data parsing logic in charts.js")
    print("or the charts are failing to load due to JavaScript errors.")
