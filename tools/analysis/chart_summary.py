#!/usr/bin/env python3
"""
Quick Summary of Chart Analysis Results
"""

import json
from pathlib import Path

def main():
    """Display summary of chart analysis"""
    
    # Load the analysis results
    results_file = Path("data/reports/chart_analysis_results.json")
    
    if not results_file.exists():
        print("❌ Analysis results not found. Run chart_analysis.py first.")
        return
    
    with open(results_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    summary = data['summary']
    charts = data['charts']
    
    print("📊 CHART ANALYSIS SUMMARY")
    print("=" * 60)
    print(f"📈 Total Charts Published: {summary['total_charts']}")
    print(f"✅ Successful Charts: {summary['successful_charts']}")
    print(f"❌ Failed Charts: {summary['failed_charts']}")
    print(f"📊 Success Rate: {summary['success_rate']:.1f}%")
    print(f"📊 Total Data Points: {summary['total_data_points']:,}")
    print(f"📊 Average Data Points per Chart: {summary['avg_data_points']:.1f}")
    
    print(f"\n📊 Data Sources:")
    for source, count in summary['sources'].items():
        print(f"  {source}: {count} charts")
    
    print(f"\n📊 Chart Types:")
    for chart_type, count in summary['chart_types'].items():
        print(f"  {chart_type}: {count} charts")
    
    # Show charts with most data points
    successful_charts = [c for c in charts if c['status'] == 'Success']
    successful_charts.sort(key=lambda x: x['data_points'], reverse=True)
    
    print(f"\n📊 TOP 10 CHARTS BY DATA POINTS:")
    print("-" * 60)
    for i, chart in enumerate(successful_charts[:10], 1):
        print(f"{i:2d}. {chart['title']}")
        print(f"     Data Points: {chart['data_points']:,}")
        print(f"     Period: {chart['period']}")
        print(f"     Source: {chart['source']}")
        print()
    
    # Show charts with issues
    failed_charts = [c for c in charts if c['status'] != 'Success']
    
    if failed_charts:
        print(f"\n❌ CHARTS WITH ISSUES ({len(failed_charts)}):")
        print("-" * 60)
        for chart in failed_charts:
            print(f"• {chart['title']}")
            print(f"  Issue: {chart['status']}")
            print(f"  Source: {chart['source']}")
            print()
    
    # Show data type distribution
    data_types = {}
    for chart in successful_charts:
        data_type = chart['data_type']
        data_types[data_type] = data_types.get(data_type, 0) + 1
    
    print(f"\n📊 DATA TYPES:")
    print("-" * 60)
    for data_type, count in data_types.items():
        print(f"  {data_type}: {count} charts")
    
    # Show time span distribution
    time_spans = {}
    for chart in successful_charts:
        span = chart['time_span_months']
        if span <= 12:
            category = "≤ 1 year"
        elif span <= 60:
            category = "1-5 years"
        elif span <= 120:
            category = "5-10 years"
        elif span <= 300:
            category = "10-25 years"
        else:
            category = "> 25 years"
        
        time_spans[category] = time_spans.get(category, 0) + 1
    
    print(f"\n📊 TIME SPAN DISTRIBUTION:")
    print("-" * 60)
    for category, count in time_spans.items():
        print(f"  {category}: {count} charts")
    
    # Show some interesting statistics
    print(f"\n🔍 INTERESTING STATISTICS:")
    print("-" * 60)
    
    # Longest time series
    longest_chart = max(successful_charts, key=lambda x: x['time_span_months'])
    print(f"📈 Longest Time Series: {longest_chart['title']}")
    print(f"    Time Span: {longest_chart['time_span_months']} months ({longest_chart['time_span_months']/12:.1f} years)")
    print(f"    Period: {longest_chart['period']}")
    
    # Most recent data
    recent_charts = [c for c in successful_charts if '2025' in c['period']]
    print(f"\n📅 Charts with 2025 Data: {len(recent_charts)}")
    
    # Charts with no data
    zero_data_charts = [c for c in successful_charts if c['data_points'] == 0]
    if zero_data_charts:
        print(f"\n⚠️  Charts with Zero Data Points: {len(zero_data_charts)}")
        for chart in zero_data_charts:
            print(f"    • {chart['title']}")

if __name__ == "__main__":
    main()
