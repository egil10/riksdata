#!/usr/bin/env python3
"""
Test script to verify chart fixes for problematic charts
"""

import json
import os
import sys

def test_crime_rate_data():
    """Test crime rate data parsing"""
    print("Testing Crime Rate data...")
    
    try:
        with open('data/cached/ssb/crime-rate.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Check if data has the expected structure
        if 'dataset' in data and 'dimension' in data['dataset']:
            dimensions = data['dataset']['dimension']
            
            # Check for required dimensions
            if 'Tid' in dimensions and 'LovbruddKrim' in dimensions:
                time_labels = dimensions['Tid']['category']['label']
                crime_labels = dimensions['LovbruddKrim']['category']['label']
                
                print(f"  ✓ Time periods: {len(time_labels)}")
                print(f"  ✓ Crime types: {len(crime_labels)}")
                
                # Check for "All groups of offences"
                has_total = any('All groups of offences' in label for label in crime_labels.values())
                if has_total:
                    print("  ✓ Found 'All groups of offences' category")
                else:
                    print("  ✗ Missing 'All groups of offences' category")
                
                # Check time format
                sample_time = list(time_labels.values())[0]
                if '-' in sample_time:
                    print(f"  ✓ Time format: {sample_time} (year interval)")
                else:
                    print(f"  ✓ Time format: {sample_time}")
                
                return True
            else:
                print("  ✗ Missing required dimensions")
                return False
        else:
            print("  ✗ Invalid data structure")
            return False
            
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def test_life_expectancy_data():
    """Test life expectancy data parsing"""
    print("Testing Life Expectancy data...")
    
    try:
        with open('data/cached/ssb/life-expectancy.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Check if data has the expected structure
        if 'dataset' in data and 'dimension' in data['dataset']:
            dimensions = data['dataset']['dimension']
            
            # Check for required dimensions
            if 'Tid' in dimensions and 'Kjonn' in dimensions and 'AlderX' in dimensions:
                time_labels = dimensions['Tid']['category']['label']
                sex_labels = dimensions['Kjonn']['category']['label']
                age_labels = dimensions['AlderX']['category']['label']
                
                print(f"  ✓ Time periods: {len(time_labels)}")
                print(f"  ✓ Sex categories: {len(sex_labels)}")
                print(f"  ✓ Age categories: {len(age_labels)}")
                
                # Check for "Both sexes"
                has_both_sexes = any('Both sexes' in label for label in sex_labels.values())
                if has_both_sexes:
                    print("  ✓ Found 'Both sexes' category")
                else:
                    print("  ✗ Missing 'Both sexes' category")
                
                # Check for age "000"
                has_age_zero = '000' in age_labels.keys()
                if has_age_zero:
                    print("  ✓ Found age '000' category")
                else:
                    print("  ✗ Missing age '000' category")
                
                return True
            else:
                print("  ✗ Missing required dimensions")
                return False
        else:
            print("  ✗ Invalid data structure")
            return False
            
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def test_living_arrangements_data():
    """Test living arrangements data parsing"""
    print("Testing Living Arrangements National data...")
    
    try:
        with open('data/cached/ssb/living-arrangements-national.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Check if data has the expected structure
        if 'dataset' in data and 'dimension' in data['dataset']:
            dimensions = data['dataset']['dimension']
            
            # Check for required dimensions
            if 'Tid' in dimensions and 'Samlivsform' in dimensions:
                time_labels = dimensions['Tid']['category']['label']
                arrangement_labels = dimensions['Samlivsform']['category']['label']
                
                print(f"  ✓ Time periods: {len(time_labels)}")
                print(f"  ✓ Arrangement types: {len(arrangement_labels)}")
                
                # Check for "married" arrangement
                has_married = any('married' in label.lower() for label in arrangement_labels.values())
                if has_married:
                    print("  ✓ Found 'married' arrangement category")
                else:
                    print("  ✗ Missing 'married' arrangement category")
                
                return True
            else:
                print("  ✗ Missing required dimensions")
                return False
        else:
            print("  ✗ Invalid data structure")
            return False
            
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def test_oil_fund_data():
    """Test oil fund data parsing"""
    print("Testing Oil Fund data...")
    
    try:
        with open('data/static/oil-fund.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Check if data has the expected structure
        if 'data' in data and isinstance(data['data'], list):
            data_points = data['data']
            print(f"  ✓ Data points: {len(data_points)}")
            
            if data_points:
                sample = data_points[0]
                if 'year' in sample and 'total' in sample:
                    print("  ✓ Data structure: year and total fields present")
                    print(f"  ✓ Sample data: {sample['year']} = {sample['total']} billion NOK")
                    return True
                else:
                    print("  ✗ Missing required fields (year, total)")
                    return False
            else:
                print("  ✗ No data points")
                return False
        else:
            print("  ✗ Invalid data structure")
            return False
            
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def main():
    """Run all tests"""
    print("Testing Chart Fixes")
    print("=" * 50)
    
    tests = [
        test_crime_rate_data,
        test_life_expectancy_data,
        test_living_arrangements_data,
        test_oil_fund_data
    ]
    
    results = []
    for test in tests:
        result = test()
        results.append(result)
        print()
    
    print("=" * 50)
    print(f"Results: {sum(results)}/{len(results)} tests passed")
    
    if all(results):
        print("✓ All tests passed! Chart fixes should work correctly.")
    else:
        print("✗ Some tests failed. Check the data structures.")
    
    return 0 if all(results) else 1

if __name__ == "__main__":
    sys.exit(main())
