#!/usr/bin/env python3
"""
Test script to verify oil fund data parsing
"""

import json
from pathlib import Path

def test_oil_fund_data():
    """Test the oil fund data file"""
    
    # Load the oil fund data
    oil_fund_path = Path(__file__).parent.parent / 'data' / 'static' / 'oil-fund.json'
    
    if not oil_fund_path.exists():
        print("❌ Oil fund data file not found!")
        return False
    
    try:
        with open(oil_fund_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ Error loading oil fund data: {e}")
        return False
    
    # Validate data structure
    if 'data' not in data:
        print("❌ No 'data' field in oil fund JSON")
        return False
    
    if not isinstance(data['data'], list):
        print("❌ 'data' field is not an array")
        return False
    
    if len(data['data']) == 0:
        print("❌ Oil fund data array is empty")
        return False
    
    # Check data points
    print(f"✅ Oil fund data loaded successfully")
    print(f"   - Title: {data.get('title', 'N/A')}")
    print(f"   - Description: {data.get('description', 'N/A')}")
    print(f"   - Source: {data.get('source', 'N/A')}")
    print(f"   - Unit: {data.get('unit', 'N/A')}")
    print(f"   - Data points: {len(data['data'])}")
    
    # Check first and last data points
    first_point = data['data'][0]
    last_point = data['data'][-1]
    
    print(f"   - First year: {first_point.get('year', 'N/A')} - Value: {first_point.get('total', 'N/A')} billion NOK")
    print(f"   - Last year: {last_point.get('year', 'N/A')} - Value: {last_point.get('total', 'N/A')} billion NOK")
    
    # Validate data structure for each point
    required_fields = ['year', 'total', 'equity', 'fixed_income', 'real_estate', 'renewable_energy']
    
    for i, point in enumerate(data['data']):
        missing_fields = [field for field in required_fields if field not in point]
        if missing_fields:
            print(f"❌ Data point {i} (year {point.get('year', 'N/A')}) missing fields: {missing_fields}")
            return False
    
    print("✅ All data points have required fields")
    
    # Check for data consistency
    years = [point['year'] for point in data['data']]
    if years != sorted(years):
        print("❌ Years are not in chronological order")
        return False
    
    print("✅ Years are in chronological order")
    
    # Check that total equals sum of components
    for i, point in enumerate(data['data']):
        calculated_total = (point['equity'] + point['fixed_income'] + 
                          point['real_estate'] + point['renewable_energy'])
        if abs(calculated_total - point['total']) > 0.1:  # Allow small rounding differences
            print(f"❌ Data point {i} (year {point['year']}): total ({point['total']}) != sum of components ({calculated_total})")
            return False
    
    print("✅ All totals match sum of components")
    
    print("\n🎉 Oil fund data validation completed successfully!")
    return True

if __name__ == "__main__":
    test_oil_fund_data()
