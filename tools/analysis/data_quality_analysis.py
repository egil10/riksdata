#!/usr/bin/env python3
"""
Data Quality Analysis Script
Analyzes chart data for missing data, duplicates, nonsensical data, and political period coverage
"""

import json
from pathlib import Path
from collections import defaultdict
import re
from typing import Dict, List, Any, Set

def analyze_data_quality():
    """Comprehensive data quality analysis"""
    
    # Load analysis results
    results_file = Path("data/reports/chart_analysis_results.json")
    
    if not results_file.exists():
        print("❌ Analysis results not found. Run chart_analysis.py first.")
        return
    
    with open(results_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    charts = data['charts']
    
    print("🔍 DATA QUALITY ANALYSIS")
    print("=" * 60)
    
    # (1) Charts with missing or no data
    print("\n📊 (1) CHARTS WITH MISSING OR NO DATA")
    print("-" * 60)
    
    missing_data_charts = []
    zero_data_charts = []
    failed_charts = []
    
    for chart in charts:
        if chart['status'] != 'Success':
            failed_charts.append(chart)
        elif chart['data_points'] == 0:
            zero_data_charts.append(chart)
        elif chart['data_points'] < 10:  # Very limited data
            missing_data_charts.append(chart)
    
    print(f"❌ Failed Charts ({len(failed_charts)}):")
    for chart in failed_charts:
        print(f"  • {chart['title']} - {chart['status']}")
    
    print(f"\n⚠️  Zero Data Charts ({len(zero_data_charts)}):")
    for chart in zero_data_charts:
        print(f"  • {chart['title']} - {chart['data_points']} data points")
    
    print(f"\n⚠️  Limited Data Charts ({len(missing_data_charts)}):")
    for chart in missing_data_charts:
        print(f"  • {chart['title']} - {chart['data_points']} data points ({chart['period']})")
    
    # (2) Duplicate charts or data
    print("\n📊 (2) DUPLICATE ANALYSIS")
    print("-" * 60)
    
    # Check for duplicate dataset IDs
    dataset_ids = defaultdict(list)
    for chart in charts:
        if chart['dataset_id']:
            dataset_ids[chart['dataset_id']].append(chart)
    
    duplicates = {ds_id: charts for ds_id, charts in dataset_ids.items() if len(charts) > 1}
    
    if duplicates:
        print(f"🔄 Duplicate Dataset IDs ({len(duplicates)}):")
        for ds_id, charts_list in duplicates.items():
            print(f"  Dataset ID: {ds_id}")
            for chart in charts_list:
                print(f"    • {chart['title']} ({chart['chart_id']})")
            print()
    else:
        print("✅ No duplicate dataset IDs found")
    
    # Check for similar titles
    titles = defaultdict(list)
    for chart in charts:
        # Normalize title for comparison
        normalized_title = re.sub(r'[^a-zA-Z0-9\s]', '', chart['title'].lower())
        titles[normalized_title].append(chart)
    
    similar_titles = {title: charts for title, charts in titles.items() if len(charts) > 1}
    
    if similar_titles:
        print(f"🔄 Similar Chart Titles ({len(similar_titles)}):")
        for title, charts_list in similar_titles.items():
            print(f"  Similar to: '{title}'")
            for chart in charts_list:
                print(f"    • {chart['title']} ({chart['chart_id']})")
            print()
    else:
        print("✅ No similar chart titles found")
    
    # (3) Nonsensical data analysis
    print("\n📊 (3) NONSENSICAL DATA ANALYSIS")
    print("-" * 60)
    
    nonsensical_charts = []
    
    for chart in charts:
        if chart['status'] == 'Success' and chart['data_points'] > 0:
            # Check for all zero values
            if chart['min_value'] == 0 and chart['max_value'] == 0:
                nonsensical_charts.append((chart, "All values are zero"))
                continue
            
            # Check for very small ranges (might indicate no real variation)
            if chart['max_value'] - chart['min_value'] < 0.1:
                nonsensical_charts.append((chart, "Very small value range"))
                continue
            
            # Check for extreme values that might be errors
            if chart['max_value'] > 1000000:  # Very large numbers
                nonsensical_charts.append((chart, "Extremely large values"))
                continue
            
            # Check for negative values where they shouldn't exist
            if chart['min_value'] < 0 and any(keyword in chart['title'].lower() for keyword in ['price', 'index', 'rate', 'percentage']):
                nonsensical_charts.append((chart, "Negative values in price/index/rate data"))
                continue
    
    if nonsensical_charts:
        print(f"⚠️  Potentially Nonsensical Data ({len(nonsensical_charts)}):")
        for chart, reason in nonsensical_charts:
            print(f"  • {chart['title']}")
            print(f"    Reason: {reason}")
            print(f"    Range: {chart['min_value']:.2f} to {chart['max_value']:.2f}")
            print(f"    Period: {chart['period']}")
            print()
    else:
        print("✅ No obvious nonsensical data found")
    
    # (4) Data period analysis
    print("\n📊 (4) DATA PERIOD ANALYSIS")
    print("-" * 60)
    
    # Categorize by time span
    short_term = []  # < 1 year
    medium_term = []  # 1-5 years
    long_term = []  # 5-15 years
    very_long_term = []  # > 15 years
    
    for chart in charts:
        if chart['status'] == 'Success':
            months = chart['time_span_months']
            years = months / 12
            
            if years < 1:
                short_term.append(chart)
            elif years < 5:
                medium_term.append(chart)
            elif years < 15:
                long_term.append(chart)
            else:
                very_long_term.append(chart)
    
    print(f"📅 Time Span Distribution:")
    print(f"  • Very Short Term (< 1 year): {len(short_term)} charts")
    print(f"  • Short Term (1-5 years): {len(medium_term)} charts")
    print(f"  • Medium Term (5-15 years): {len(long_term)} charts")
    print(f"  • Long Term (> 15 years): {len(very_long_term)} charts")
    
    print(f"\n📅 Short Term Charts (< 1 year):")
    for chart in short_term[:10]:  # Show first 10
        print(f"  • {chart['title']} - {chart['time_span_months']} months ({chart['period']})")
    
    if len(short_term) > 10:
        print(f"  ... and {len(short_term) - 10} more")
    
    # (5) Political period analysis
    print("\n📊 (5) POLITICAL PERIOD ANALYSIS")
    print("-" * 60)
    
    # Norwegian political periods (approximate)
    political_periods = {
        "1970s": (1970, 1979),
        "1980s": (1980, 1989),
        "1990s": (1990, 1999),
        "2000s": (2000, 2009),
        "2010s": (2010, 2019),
        "2020s": (2020, 2029)
    }
    
    # Find charts that span multiple political periods
    multi_period_charts = []
    
    for chart in charts:
        if chart['status'] == 'Success' and chart['period'] != 'Unknown':
            # Extract start year from period
            period_start = chart['period'].split(' to ')[0]
            period_end = chart['period'].split(' to ')[1]
            
            # Extract year from various formats (1979M01, 2000K1, 2025, etc.)
            start_year = extract_year(period_start)
            end_year = extract_year(period_end)
            
            if start_year and end_year:
                # Count how many political periods this spans
                periods_spanned = set()
                for period_name, (start, end) in political_periods.items():
                    if (start_year <= end and end_year >= start):
                        periods_spanned.add(period_name)
                
                if len(periods_spanned) >= 2:
                    multi_period_charts.append((chart, periods_spanned, end_year - start_year))
    
    # Sort by number of years covered
    multi_period_charts.sort(key=lambda x: x[2], reverse=True)
    
    print(f"🏛️  Charts Spanning Multiple Political Periods ({len(multi_period_charts)}):")
    for chart, periods, years in multi_period_charts[:15]:  # Top 15
        print(f"  • {chart['title']}")
        print(f"    Years: {years} years")
        print(f"    Periods: {', '.join(sorted(periods))}")
        print(f"    Data Points: {chart['data_points']}")
        print()
    
    # Find charts with good political coverage (10+ years)
    good_coverage = [chart for chart in charts if chart['status'] == 'Success' and 
                    chart['time_span_months'] >= 120]  # 10+ years
    
    print(f"📈 Charts with Good Political Coverage (10+ years): {len(good_coverage)}")
    print("Top charts for political analysis:")
    for chart in sorted(good_coverage, key=lambda x: x['time_span_months'], reverse=True)[:10]:
        years = chart['time_span_months'] / 12
        print(f"  • {chart['title']} - {years:.1f} years ({chart['period']})")
    
    # Summary and recommendations
    print("\n📋 SUMMARY AND RECOMMENDATIONS")
    print("=" * 60)
    
    total_issues = len(failed_charts) + len(zero_data_charts) + len(missing_data_charts) + len(nonsensical_charts)
    
    print(f"🔍 Total Issues Found: {total_issues}")
    print(f"📊 Charts with Good Political Coverage: {len(good_coverage)}")
    print(f"📊 Charts Spanning Multiple Political Periods: {len(multi_period_charts)}")
    
    print(f"\n🚨 PRIORITY FIXES:")
    
    if failed_charts:
        print(f"  1. Fix {len(failed_charts)} failed charts (missing cache files)")
    
    if zero_data_charts:
        print(f"  2. Investigate {len(zero_data_charts)} charts with zero data")
    
    if short_term:
        print(f"  3. Consider removing {len(short_term)} very short-term charts (< 1 year)")
    
    if duplicates:
        print(f"  4. Resolve {len(duplicates)} duplicate dataset issues")
    
    print(f"\n✅ RECOMMENDED CHARTS FOR POLITICAL ANALYSIS:")
    for chart in sorted(good_coverage, key=lambda x: x['time_span_months'], reverse=True)[:5]:
        years = chart['time_span_months'] / 12
        print(f"  • {chart['title']} ({years:.1f} years)")

def extract_year(date_str: str) -> int:
    """Extract year from various date formats"""
    try:
        # Handle formats like: 1979M01, 2000K1, 2025, etc.
        if 'M' in date_str:
            return int(date_str.split('M')[0])
        elif 'K' in date_str:
            return int(date_str.split('K')[0])
        elif 'U' in date_str:
            return int(date_str.split('U')[0])
        else:
            return int(date_str)
    except:
        return None

if __name__ == "__main__":
    analyze_data_quality()
