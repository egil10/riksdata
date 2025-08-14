#!/usr/bin/env python3
"""
Chart Analysis Script
Analyzes all charts published on the website and their data characteristics
"""

import json
import re
from pathlib import Path
from datetime import datetime
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple

def extract_charts_from_main_js(main_js_path: str) -> List[Dict[str, Any]]:
    """Extract all chart information from main.js"""
    with open(main_js_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all loadChartData calls
    pattern = r"loadChartData\('([^']+)',\s*'([^']+)',\s*'([^']+)'(?:,\s*'([^']+)')?\)"
    matches = re.findall(pattern, content)
    
    charts = []
    for match in matches:
        chart_id, url, title, chart_type = match
        chart_type = chart_type if chart_type else 'line'
        
        # Extract dataset ID from URL
        dataset_id = None
        source = None
        if 'ssb.no/api/v0/dataset/' in url:
            dataset_id = url.split('/dataset/')[1].split('.')[0]
            source = 'SSB'
        elif 'norges-bank.no/api/data/' in url:
            dataset_id = url.split('/api/data/')[1].split('?')[0]
            source = 'Norges Bank'
        elif url.startswith('./data/cached/'):
            dataset_id = url.split('/')[-1].replace('.json', '')
            source = 'Cached'
        
        charts.append({
            'chart_id': chart_id,
            'url': url,
            'title': title,
            'chart_type': chart_type,
            'dataset_id': dataset_id,
            'source': source,
            'cache_name': chart_id.replace('-chart', '')
        })
    
    return charts

def parse_ssb_data(data: Dict) -> Tuple[List[Dict], Dict]:
    """Parse SSB data format and extract statistics"""
    try:
        dataset = data.get('dataset', {})
        if not dataset:
            return [], {}
        
        # Extract time dimension
        time_dim = dataset.get('dimension', {}).get('Tid', {})
        time_labels = time_dim.get('category', {}).get('label', {})
        
        # Extract values
        values = dataset.get('value', [])
        
        # Create data points
        data_points = []
        for i, (time_key, time_label) in enumerate(time_labels.items()):
            if i < len(values):
                try:
                    value = float(values[i])
                    data_points.append({
                        'date': time_label,
                        'value': value,
                        'time_key': time_key
                    })
                except (ValueError, TypeError):
                    continue
        
        # Calculate statistics
        if data_points:
            values_only = [p['value'] for p in data_points if p['value'] is not None]
            stats = {
                'data_points': len(data_points),
                'valid_values': len(values_only),
                'null_count': len(data_points) - len(values_only),
                'null_percentage': ((len(data_points) - len(values_only)) / len(data_points)) * 100 if data_points else 0,
                'min_value': min(values_only) if values_only else None,
                'max_value': max(values_only) if values_only else None,
                'mean_value': sum(values_only) / len(values_only) if values_only else None,
                'first_date': data_points[0]['date'] if data_points else None,
                'last_date': data_points[-1]['date'] if data_points else None,
                'time_span_months': len(data_points)
            }
        else:
            stats = {
                'data_points': 0,
                'valid_values': 0,
                'null_count': 0,
                'null_percentage': 0,
                'min_value': None,
                'max_value': None,
                'mean_value': None,
                'first_date': None,
                'last_date': None,
                'time_span_months': 0
            }
        
        return data_points, stats
        
    except Exception as e:
        print(f"Error parsing SSB data: {e}")
        return [], {}

def parse_norges_bank_data(data: Dict) -> Tuple[List[Dict], Dict]:
    """Parse Norges Bank data format and extract statistics"""
    try:
        datasets = data.get('data', {}).get('dataSets', [])
        if not datasets:
            return [], {}
        
        data_points = []
        for dataset in datasets:
            series = dataset.get('series', {})
            for series_key, series_data in series.items():
                observations = series_data.get('observations', {})
                for obs_key, obs_value in observations.items():
                    try:
                        value = float(obs_value[0])
                        # Extract date from observation key (simplified)
                        data_points.append({
                            'date': f"Observation {obs_key}",
                            'value': value,
                            'time_key': obs_key
                        })
                    except (ValueError, TypeError, IndexError):
                        continue
        
        # Calculate statistics
        if data_points:
            values_only = [p['value'] for p in data_points if p['value'] is not None]
            stats = {
                'data_points': len(data_points),
                'valid_values': len(values_only),
                'null_count': len(data_points) - len(values_only),
                'null_percentage': ((len(data_points) - len(values_only)) / len(data_points)) * 100 if data_points else 0,
                'min_value': min(values_only) if values_only else None,
                'max_value': max(values_only) if values_only else None,
                'mean_value': sum(values_only) / len(values_only) if values_only else None,
                'first_date': data_points[0]['date'] if data_points else None,
                'last_date': data_points[-1]['date'] if data_points else None,
                'time_span_months': len(data_points)
            }
        else:
            stats = {
                'data_points': 0,
                'valid_values': 0,
                'null_count': 0,
                'null_percentage': 0,
                'min_value': None,
                'max_value': None,
                'mean_value': None,
                'first_date': None,
                'last_date': None,
                'time_span_months': 0
            }
        
        return data_points, stats
        
    except Exception as e:
        print(f"Error parsing Norges Bank data: {e}")
        return [], {}

def analyze_chart_data(chart: Dict, cache_dir: Path) -> Dict[str, Any]:
    """Analyze data for a specific chart"""
    cache_name = chart['cache_name']
    source = chart['source']
    
    # Find cache file
    cache_file = None
    if source == 'SSB':
        cache_file = cache_dir / 'ssb' / f"{cache_name}.json"
    elif source == 'Norges Bank':
        cache_file = cache_dir / 'norges-bank' / f"{cache_name}.json"
    elif source == 'Cached':
        cache_file = cache_dir / f"{cache_name}.json"
    
    if not cache_file or not cache_file.exists():
        return {
            'chart_id': chart['chart_id'],
            'title': chart['title'],
            'source': source,
            'dataset_id': chart['dataset_id'],
            'chart_type': chart['chart_type'],
            'status': 'No cache file found',
            'data_points': 0,
            'head_5': [],
            'tail_5': [],
            'period': 'Unknown',
            'data_type': 'Unknown'
        }
    
    try:
        with open(cache_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Parse data based on source
        if source == 'SSB':
            data_points, stats = parse_ssb_data(data)
        elif source == 'Norges Bank':
            data_points, stats = parse_norges_bank_data(data)
        else:
            # For cached files, try to determine format
            if 'dataset' in data:
                data_points, stats = parse_ssb_data(data)
            else:
                data_points, stats = parse_norges_bank_data(data)
        
        # Get head and tail data
        head_5 = data_points[:5] if len(data_points) >= 5 else data_points
        tail_5 = data_points[-5:] if len(data_points) >= 5 else data_points
        
        # Determine data type
        data_type = 'Unknown'
        if data_points:
            sample_values = [p['value'] for p in data_points[:10] if p['value'] is not None]
            if sample_values:
                if all(isinstance(v, int) or v.is_integer() for v in sample_values):
                    data_type = 'Integer'
                elif all(isinstance(v, float) for v in sample_values):
                    data_type = 'Float'
                else:
                    data_type = 'Mixed'
        
        # Determine period
        period = 'Unknown'
        if data_points:
            first_date = data_points[0]['date']
            last_date = data_points[-1]['date']
            period = f"{first_date} to {last_date}"
        
        return {
            'chart_id': chart['chart_id'],
            'title': chart['title'],
            'source': source,
            'dataset_id': chart['dataset_id'],
            'chart_type': chart['chart_type'],
            'status': 'Success',
            'data_points': stats['data_points'],
            'valid_values': stats['valid_values'],
            'null_percentage': stats['null_percentage'],
            'min_value': stats['min_value'],
            'max_value': stats['max_value'],
            'mean_value': stats['mean_value'],
            'head_5': head_5,
            'tail_5': tail_5,
            'period': period,
            'data_type': data_type,
            'time_span_months': stats['time_span_months']
        }
        
    except Exception as e:
        return {
            'chart_id': chart['chart_id'],
            'title': chart['title'],
            'source': source,
            'dataset_id': chart['dataset_id'],
            'chart_type': chart['chart_type'],
            'status': f'Error: {str(e)}',
            'data_points': 0,
            'head_5': [],
            'tail_5': [],
            'period': 'Unknown',
            'data_type': 'Unknown'
        }

def main():
    """Main analysis function"""
    print("🔍 Chart Analysis Script")
    print("=" * 50)
    
    # Paths
    main_js_path = Path("src/js/main.js")
    cache_dir = Path("data/cached")
    
    if not main_js_path.exists():
        print(f"❌ Error: {main_js_path} not found")
        return
    
    if not cache_dir.exists():
        print(f"❌ Error: {cache_dir} not found")
        return
    
    # Extract charts from main.js
    print("📊 Extracting charts from main.js...")
    charts = extract_charts_from_main_js(str(main_js_path))
    print(f"✅ Found {len(charts)} charts")
    
    # Analyze each chart
    print("\n🔍 Analyzing chart data...")
    results = []
    
    for i, chart in enumerate(charts, 1):
        print(f"  [{i}/{len(charts)}] Analyzing {chart['chart_id']}...")
        result = analyze_chart_data(chart, cache_dir)
        results.append(result)
    
    # Generate summary statistics
    print("\n📈 Generating summary statistics...")
    
    total_charts = len(results)
    successful_charts = len([r for r in results if r['status'] == 'Success'])
    failed_charts = total_charts - successful_charts
    
    # Data source breakdown
    sources = {}
    for result in results:
        source = result['source']
        sources[source] = sources.get(source, 0) + 1
    
    # Chart type breakdown
    chart_types = {}
    for result in results:
        chart_type = result['chart_type']
        chart_types[chart_type] = chart_types.get(chart_type, 0) + 1
    
    # Data statistics
    successful_results = [r for r in results if r['status'] == 'Success']
    total_data_points = sum(r['data_points'] for r in successful_results)
    avg_data_points = total_data_points / len(successful_results) if successful_results else 0
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 SUMMARY STATISTICS")
    print("=" * 50)
    print(f"Total Charts Published: {total_charts}")
    print(f"Successful Charts: {successful_charts}")
    print(f"Failed Charts: {failed_charts}")
    print(f"Success Rate: {(successful_charts/total_charts)*100:.1f}%")
    print(f"Total Data Points: {total_data_points:,}")
    print(f"Average Data Points per Chart: {avg_data_points:.1f}")
    
    print(f"\n📊 Data Sources:")
    for source, count in sources.items():
        print(f"  {source}: {count} charts")
    
    print(f"\n📊 Chart Types:")
    for chart_type, count in chart_types.items():
        print(f"  {chart_type}: {count} charts")
    
    # Print detailed results
    print("\n" + "=" * 50)
    print("📋 DETAILED CHART ANALYSIS")
    print("=" * 50)
    
    for result in results:
        print(f"\n🎯 {result['title']}")
        print(f"   Chart ID: {result['chart_id']}")
        print(f"   Source: {result['source']}")
        print(f"   Dataset ID: {result['dataset_id']}")
        print(f"   Chart Type: {result['chart_type']}")
        print(f"   Status: {result['status']}")
        
        if result['status'] == 'Success':
            print(f"   Data Points: {result['data_points']:,}")
            print(f"   Valid Values: {result['valid_values']:,}")
            print(f"   Null Percentage: {result['null_percentage']:.1f}%")
            print(f"   Period: {result['period']}")
            print(f"   Data Type: {result['data_type']}")
            print(f"   Time Span: {result['time_span_months']} months")
            
            if result['min_value'] is not None:
                print(f"   Value Range: {result['min_value']:.2f} to {result['max_value']:.2f}")
                print(f"   Mean Value: {result['mean_value']:.2f}")
            
            # Show head and tail data
            if result['head_5']:
                print(f"   Head 5: {[(p['date'], p['value']) for p in result['head_5']]}")
            if result['tail_5']:
                print(f"   Tail 5: {[(p['date'], p['value']) for p in result['tail_5']]}")
        else:
            print(f"   Error: {result['status']}")
    
    # Save detailed results to JSON
    output_file = Path("data/reports/chart_analysis_results.json")
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'total_charts': total_charts,
                'successful_charts': successful_charts,
                'failed_charts': failed_charts,
                'success_rate': (successful_charts/total_charts)*100,
                'total_data_points': total_data_points,
                'avg_data_points': avg_data_points,
                'sources': sources,
                'chart_types': chart_types
            },
            'charts': results
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Detailed results saved to: {output_file}")
    
    # Create CSV summary
    csv_data = []
    for result in results:
        csv_data.append({
            'chart_id': result['chart_id'],
            'title': result['title'],
            'source': result['source'],
            'dataset_id': result['dataset_id'],
            'chart_type': result['chart_type'],
            'status': result['status'],
            'data_points': result['data_points'],
            'valid_values': result.get('valid_values', 0),
            'null_percentage': result.get('null_percentage', 0),
            'period': result['period'],
            'data_type': result['data_type'],
            'time_span_months': result.get('time_span_months', 0)
        })
    
    df = pd.DataFrame(csv_data)
    csv_file = Path("data/reports/chart_analysis_summary.csv")
    df.to_csv(csv_file, index=False)
    print(f"📊 CSV summary saved to: {csv_file}")

if __name__ == "__main__":
    main()
