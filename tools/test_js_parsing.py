#!/usr/bin/env python3
"""
Test JavaScript parsing functions by simulating the exact logic
"""

import json
import os
from datetime import datetime

def parse_time_label(time_label):
    """Simulate parseTimeLabel from utils.js"""
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

def test_crime_rate_parsing():
    """Test the exact crime rate parsing logic from charts.js"""
    print("🔍 Testing Crime Rate parsing (JavaScript logic):")
    
    try:
        with open('data/cached/ssb/crime-rate.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        dataset = data['dataset']
        dimension = dataset['dimension']
        value = dataset['value']
        
        if not dimension or not dimension.get('Tid') or not dimension.get('LovbruddKrim') or not dimension.get('Gjerningssted'):
            print("  ❌ Missing required dimensions")
            return []
        
        time_labels = dimension['Tid']['category']['label']
        time_index = dimension['Tid']['category']['index']
        crime_type_labels = dimension['LovbruddKrim']['category']['label']
        crime_type_index = dimension['LovbruddKrim']['category']['index']
        scene_labels = dimension['Gjerningssted']['category']['label']
        scene_index = dimension['Gjerningssted']['category']['index']
        
        # Find the index for "All groups of offences" and "Total" scene
        total_crime_index = None
        total_scene_index = None
        
        for key, label in crime_type_labels.items():
            if 'All groups of offences' in label:
                total_crime_index = crime_type_index[key]
                break
        
        for key, label in scene_labels.items():
            if 'Total' in label:
                total_scene_index = scene_index[key]
                break
        
        if total_crime_index is None or total_scene_index is None:
            print("  ❌ Could not find required categories")
            return []
        
        print(f"  📊 Total crime index: {total_crime_index}")
        print(f"  📊 Total scene index: {total_scene_index}")
        
        data_points = []
        for time_key, time_label in time_labels.items():
            time_index_value = time_index[time_key]
            date = parse_time_label(str(time_label))
            if not date:
                continue
            
            # Calculate value index: time * scenes * crimes + scene * crimes + crime
            num_scenes = len(scene_index)
            num_crimes = len(crime_type_index)
            value_index = time_index_value * num_scenes * num_crimes + total_scene_index * num_crimes + total_crime_index
            
            if value_index < len(value):
                v = value[value_index]
                if v is not None:
                    data_points.append({
                        'date': date.strftime('%Y-%m-%d'),
                        'value': float(v)
                    })
        
        data_points.sort(key=lambda x: x['date'])
        
        print(f"  ✅ Found {len(data_points)} data points")
        if data_points:
            print(f"  📈 Date range: {data_points[0]['date']} to {data_points[-1]['date']}")
            print(f"  📊 Sample values: {[d['value'] for d in data_points[:5]]}")
        
        return data_points
        
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return []

def test_living_arrangements_parsing():
    """Test the exact living arrangements parsing logic from charts.js"""
    print("🔍 Testing Living Arrangements parsing (JavaScript logic):")
    
    try:
        with open('data/cached/ssb/living-arrangements-national.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        dataset = data['dataset']
        dimension = dataset['dimension']
        value = dataset['value']
        
        if not dimension or not dimension.get('Tid') or not dimension.get('Samlivsform') or not dimension.get('Region'):
            print("  ❌ Missing required dimensions")
            return []
        
        time_labels = dimension['Tid']['category']['label']
        time_index = dimension['Tid']['category']['index']
        arrangement_labels = dimension['Samlivsform']['category']['label']
        arrangement_index = dimension['Samlivsform']['category']['index']
        region_labels = dimension['Region']['category']['label']
        region_index = dimension['Region']['category']['index']
        
        # Find the index for "In couples, married" and "The whole country"
        married_index = None
        country_index = None
        
        for key, label in arrangement_labels.items():
            if 'married' in label:
                married_index = arrangement_index[key]
                break
        
        for key, label in region_labels.items():
            if 'whole country' in label:
                country_index = region_index[key]
                break
        
        if married_index is None or country_index is None:
            print("  ❌ Could not find required categories")
            return []
        
        print(f"  📊 Married index: {married_index}")
        print(f"  📊 Country index: {country_index}")
        
        data_points = []
        for time_key, time_label in time_labels.items():
            time_index_value = time_index[time_key]
            date = parse_time_label(str(time_label))
            if not date:
                continue
            
            # Calculate value index: time * regions * arrangements + region * arrangements + arrangement
            num_regions = len(region_index)
            num_arrangements = len(arrangement_index)
            value_index = time_index_value * num_regions * num_arrangements + country_index * num_arrangements + married_index
            
            if value_index < len(value):
                v = value[value_index]
                if v is not None:
                    data_points.append({
                        'date': date.strftime('%Y-%m-%d'),
                        'value': float(v)
                    })
        
        data_points.sort(key=lambda x: x['date'])
        
        print(f"  ✅ Found {len(data_points)} data points")
        if data_points:
            print(f"  📈 Date range: {data_points[0]['date']} to {data_points[-1]['date']}")
            print(f"  📊 Sample values: {[d['value'] for d in data_points[:5]]}")
        
        return data_points
        
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return []

def main():
    """Test the specific parsing functions"""
    print("🔍 Testing JavaScript parsing functions...")
    print()
    
    crime_data = test_crime_rate_parsing()
    print()
    
    living_data = test_living_arrangements_parsing()
    print()
    
    print("📋 SUMMARY:")
    print(f"  Crime Rate: {len(crime_data)} data points")
    print(f"  Living Arrangements: {len(living_data)} data points")
    
    if len(crime_data) > 0 and len(living_data) > 0:
        print("✅ Both parsing functions are working correctly!")
    else:
        print("❌ One or both parsing functions are failing")

if __name__ == "__main__":
    main()
