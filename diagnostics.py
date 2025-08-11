#!/usr/bin/env python3
"""
Norway Macro Dashboard - API Diagnostics Script
Checks all APIs and validates data quality
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, List, Any

# API endpoints
APIS = {
    "CPI": "https://data.ssb.no/api/v0/dataset/1086.json?lang=en",
    "Unemployment": "https://data.ssb.no/api/v0/dataset/1054.json?lang=en", 
    "House Prices": "https://data.ssb.no/api/v0/dataset/1060.json?lang=en",
    "Producer Prices": "https://data.ssb.no/api/v0/dataset/26426.json?lang=en",
    "Wages": "https://data.ssb.no/api/v0/dataset/1124.json?lang=en",
    "Exchange Rates": "https://data.norges-bank.no/api/data/EXR/M.USD+EUR.NOK.SP?format=sdmx-json&startPeriod=2015-08-11&endPeriod=2025-08-01&locale=no",
    "Interest Rate": "https://data.norges-bank.no/api/data/IR/M.KPRA..?format=sdmx-json&startPeriod=2000-01-01&endPeriod=2025-08-01&locale=no",
    "Government Debt": "https://data.norges-bank.no/api/data/GOVT_KEYFIGURES/V_O+N_V+V_I+ATRI+V_IRS..B.GBON?endPeriod=2025-08-01&format=sdmx-json&locale=no&startPeriod=2000-01-01"
}

def print_header(title: str):
    """Print a formatted header"""
    print(f"\n{'='*60}")
    print(f" {title}")
    print(f"{'='*60}")

def print_section(title: str):
    """Print a formatted section"""
    print(f"\n{'-'*40}")
    print(f" {title}")
    print(f"{'-'*40}")

def test_api_connection(name: str, url: str) -> Dict[str, Any]:
    """Test API connection and return results"""
    print(f"Testing {name}...")
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        return {
            "success": True,
            "status_code": response.status_code,
            "data_size": len(json.dumps(data)),
            "data": data,
            "error": None
        }
        
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "status_code": getattr(e.response, 'status_code', None),
            "data_size": 0,
            "data": None,
            "error": str(e)
        }

def parse_ssb_data(data: Dict) -> List[Dict]:
    """Parse SSB PXWeb JSON format"""
    try:
        dataset = data['dataset']
        dimension = dataset['dimension']
        value = dataset['value']  # This is a list, not a dict
        
        # Get time dimension
        time_dimension = dimension.get('Tid')
        if not time_dimension:
            raise ValueError("Time dimension 'Tid' not found")
        
        time_labels = time_dimension['category']['label']
        time_index = time_dimension['category']['index']
        
        # Find the main data series
        target_series_index = 0
        num_series = 1
        
        if 'ContentsCode' in dimension:
            content_labels = dimension['ContentsCode']['category']['label']
            content_indices = dimension['ContentsCode']['category']['index']
            
            # Find the right content code
            for key, label in content_labels.items():
                if any(keyword in label for keyword in [
                    'Consumer Price Index (2015=100)',
                    'Unemployment rate (LFS)',
                    'Producer Price Index',
                    'House Price Index',
                    'Wage Index'
                ]):
                    target_series_index = content_indices[key]
                    break
            
            num_series = len(content_indices)
        
        data_points = []
        
        for time_key, time_label in time_labels.items():
            time_index_value = time_index[time_key]
            
            # Parse date
            date = parse_time_label(time_label)
            if not date:
                continue
                
            # Calculate correct index: [series1_time1, series2_time1, ..., series1_time2, ...]
            value_index = time_index_value * num_series + target_series_index
            
            if value_index < len(value):
                data_value = value[value_index]
                if data_value is not None and data_value != 0:  # Skip null/zero values
                    data_points.append({
                        'date': date,
                        'value': float(data_value),
                        'time_label': time_label
                    })
        
        # Sort by date
        data_points.sort(key=lambda x: x['date'])
        return data_points
        
    except Exception as e:
        raise ValueError(f"SSB parsing error: {str(e)}")

def parse_time_label(time_label: str) -> datetime:
    """Parse SSB time labels"""
    try:
        # Handle monthly format: "2023M01"
        if 'M' in time_label:
            year, month = time_label.split('M')
            return datetime(int(year), int(month), 1)
        
        # Handle quarterly format: "2023K1", "2023K2", etc.
        if 'K' in time_label:
            year, quarter = time_label.split('K')
            quarter_num = int(quarter)
            month = (quarter_num - 1) * 3 + 1  # K1=Jan, K2=Apr, K3=Jul, K4=Oct
            return datetime(int(year), month, 1)
        
        # Handle yearly format: "2023"
        if len(time_label) == 4 and time_label.isdigit():
            return datetime(int(time_label), 1, 1)
        
        # Try direct date parsing
        return datetime.fromisoformat(time_label.replace('Z', '+00:00'))
        
    except Exception:
        return None

def parse_exchange_rate_data(data: Dict) -> List[Dict]:
    """Parse Norges Bank exchange rate data"""
    try:
        series = data['data']['dataSets'][0]['series']
        data_points = []
        
        # Parse USD/NOK (series 0:0:0:0)
        usd_series = series.get('0:0:0:0')
        if usd_series and 'observations' in usd_series:
            for key, observation in usd_series['observations'].items():
                value = observation[0]
                # Approximate date from index (starting from 2015-09)
                month = 9 + int(key)
                year = 2015 + (month - 1) // 12
                month = ((month - 1) % 12) + 1
                date = datetime(year, month, 1)
                data_points.append({
                    'date': date,
                    'value': float(value),
                    'currency': 'USD/NOK'
                })
        
        data_points.sort(key=lambda x: x['date'])
        return data_points
        
    except Exception as e:
        raise ValueError(f"Exchange rate parsing error: {str(e)}")

def parse_interest_rate_data(data: Dict) -> List[Dict]:
    """Parse Norges Bank interest rate data"""
    try:
        series = data['data']['dataSets'][0]['series']
        data_points = []
        
        # Parse Key Policy Rate (series 0:0:0:0)
        interest_series = series.get('0:0:0:0')
        if interest_series and 'observations' in interest_series:
            for key, observation in interest_series['observations'].items():
                value = observation[0]
                # Approximate date from index (starting from 2000-01)
                month = 1 + int(key)
                year = 2000 + (month - 1) // 12
                month = ((month - 1) % 12) + 1
                date = datetime(year, month, 1)
                data_points.append({
                    'date': date,
                    'value': float(value),
                    'type': 'Key Policy Rate'
                })
        
        data_points.sort(key=lambda x: x['date'])
        return data_points
        
    except Exception as e:
        raise ValueError(f"Interest rate parsing error: {str(e)}")

def parse_government_debt_data(data: Dict) -> List[Dict]:
    """Parse Norges Bank government debt data"""
    try:
        series = data['data']['dataSets'][0]['series']
        data_points = []
        
        # Find the series with the most observations (likely the main government debt series)
        best_series = None
        max_observations = 0
        
        for series_key, series_data in series.items():
            if 'observations' in series_data:
                observation_count = len(series_data['observations'])
                if observation_count > max_observations:
                    max_observations = observation_count
                    best_series = series_key
        
        if best_series and 'observations' in series[best_series]:
            for key, observation in series[best_series]['observations'].items():
                value = observation[0]
                # Approximate date from index (starting from 2000-01)
                month = 1 + int(key)
                year = 2000 + (month - 1) // 12
                month = ((month - 1) % 12) + 1
                date = datetime(year, month, 1)
                data_points.append({
                    'date': date,
                    'value': float(value),
                    'type': 'Government Debt % GDP'
                })
        
        data_points.sort(key=lambda x: x['date'])
        return data_points
        
    except Exception as e:
        raise ValueError(f"Government debt parsing error: {str(e)}")

def analyze_data_quality(data_points: List[Dict], name: str) -> Dict[str, Any]:
    """Analyze data quality and detect issues"""
    if not data_points:
        return {"error": "No data points found"}
    
    values = [point['value'] for point in data_points]
    dates = [point['date'] for point in data_points]
    
    # Basic statistics
    min_val = min(values)
    max_val = max(values)
    avg_val = sum(values) / len(values)
    
    # Check for cycling patterns (repeating values)
    unique_values = len(set(values))
    cycling_ratio = unique_values / len(values)
    
    # Check date range
    date_range = (min(dates), max(dates))
    
    # Check for missing data
    expected_months = (max(dates).year - min(dates).year) * 12 + max(dates).month - min(dates).month + 1
    missing_ratio = 1 - (len(data_points) / expected_months) if expected_months > 0 else 0
    
    # Sample data points
    sample_points = data_points[:5] + data_points[-5:] if len(data_points) > 10 else data_points
    
    return {
        "data_points": len(data_points),
        "date_range": (date_range[0].strftime('%Y-%m'), date_range[1].strftime('%Y-%m')),
        "value_range": (min_val, max_val),
        "average": round(avg_val, 2),
        "cycling_ratio": round(cycling_ratio, 3),
        "missing_ratio": round(missing_ratio, 3),
        "sample_points": [
            {
                "date": point['date'].strftime('%Y-%m'),
                "value": point['value'],
                "time_label": point.get('time_label', '')
            }
            for point in sample_points
        ],
        "warnings": []
    }

def check_oil_fund_data():
    """Check local oil fund data"""
    print_section("Oil Fund Data (Local)")
    
    try:
        with open('data/oil-fund.json', 'r') as f:
            data = json.load(f)
        
        data_points = []
        for item in data['data']:
            date = datetime(item['year'], 1, 1)
            data_points.append({
                'date': date,
                'value': item['total']
            })
        
        analysis = analyze_data_quality(data_points, "Oil Fund")
        print(f"✅ Oil Fund data loaded successfully")
        print(f"   Data points: {analysis['data_points']}")
        print(f"   Date range: {analysis['date_range'][0]} to {analysis['date_range'][1]}")
        print(f"   Value range: {analysis['value_range'][0]:.0f} to {analysis['value_range'][1]:.0f} billion NOK")
        
        return True
        
    except FileNotFoundError:
        print("❌ Oil fund data file not found: data/oil-fund.json")
        return False
    except Exception as e:
        print(f"❌ Error loading oil fund data: {str(e)}")
        return False

def main():
    """Main diagnostic function"""
    print_header("Norway Macro Dashboard - API Diagnostics")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = {}
    
    # Test all APIs
    print_section("API Connection Tests")
    
    for name, url in APIS.items():
        result = test_api_connection(name, url)
        results[name] = result
        
        if result['success']:
            print(f"✅ {name}: HTTP {result['status_code']} ({result['data_size']} bytes)")
        else:
            print(f"❌ {name}: {result['error']}")
    
    # Parse and analyze data
    print_section("Data Quality Analysis")
    
    for name, result in results.items():
        if not result['success']:
            continue
            
        print(f"\n{name}:")
        
        try:
            if name == "Exchange Rates":
                data_points = parse_exchange_rate_data(result['data'])
            elif name == "Interest Rate":
                data_points = parse_interest_rate_data(result['data'])
            elif name == "Government Debt":
                data_points = parse_government_debt_data(result['data'])
            else:
                data_points = parse_ssb_data(result['data'])
            
            analysis = analyze_data_quality(data_points, name)
            
            print(f"  📊 Data points: {analysis['data_points']}")
            print(f"  📅 Date range: {analysis['date_range'][0]} to {analysis['date_range'][1]}")
            print(f"  📈 Value range: {analysis['value_range'][0]:.2f} to {analysis['value_range'][1]:.2f}")
            print(f"  📊 Average: {analysis['average']}")
            
            # Check for issues
            warnings = []
            if analysis['cycling_ratio'] < 0.5:
                warnings.append(f"⚠️  High cycling detected (ratio: {analysis['cycling_ratio']})")
            if analysis['missing_ratio'] > 0.2:
                warnings.append(f"⚠️  High missing data (ratio: {analysis['missing_ratio']})")
            
            if warnings:
                for warning in warnings:
                    print(f"  {warning}")
            
            # Show sample data
            print(f"  📋 Sample data:")
            for point in analysis['sample_points'][:3]:
                print(f"    {point['date']}: {point['value']} {point.get('time_label', '')}")
            
        except Exception as e:
            print(f"  ❌ Parsing error: {str(e)}")
    
    # Check oil fund data
    check_oil_fund_data()
    
    # Summary
    print_section("Summary")
    
    successful_apis = sum(1 for r in results.values() if r['success'])
    total_apis = len(results)
    
    print(f"✅ Successful APIs: {successful_apis}/{total_apis}")
    print(f"❌ Failed APIs: {total_apis - successful_apis}/{total_apis}")
    
    if successful_apis < total_apis:
        print("\nFailed APIs:")
        for name, result in results.items():
            if not result['success']:
                print(f"  - {name}: {result['error']}")
    
    print(f"\nDiagnostic completed at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
