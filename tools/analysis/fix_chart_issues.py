#!/usr/bin/env python3
"""
Chart Issues Fix Script
Fixes identified issues with charts including duplicates, failed charts, and data quality
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any, Set

def load_chart_analysis():
    """Load the chart analysis results"""
    results_file = Path("data/reports/chart_analysis_results.json")
    
    if not results_file.exists():
        print("❌ Analysis results not found. Run chart_analysis.py first.")
        return None
    
    with open(results_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def identify_duplicates(charts: List[Dict]) -> Dict[str, List[Dict]]:
    """Identify duplicate dataset IDs"""
    dataset_ids = {}
    for chart in charts:
        if chart['dataset_id']:
            if chart['dataset_id'] not in dataset_ids:
                dataset_ids[chart['dataset_id']] = []
            dataset_ids[chart['dataset_id']].append(chart)
    
    return {ds_id: charts for ds_id, charts in dataset_ids.items() if len(charts) > 1}

def create_fix_recommendations():
    """Create recommendations for fixing chart issues"""
    
    data = load_chart_analysis()
    if not data:
        return
    
    charts = data['charts']
    
    print("🔧 CHART ISSUES FIX RECOMMENDATIONS")
    print("=" * 60)
    
    # 1. Fix duplicate dataset IDs
    print("\n📊 (1) DUPLICATE DATASET FIXES")
    print("-" * 60)
    
    duplicates = identify_duplicates(charts)
    
    if duplicates:
        print(f"Found {len(duplicates)} duplicate dataset IDs:")
        
        for ds_id, charts_list in duplicates.items():
            print(f"\nDataset ID: {ds_id}")
            
            # Analyze which chart to keep
            best_chart = None
            best_score = 0
            
            for chart in charts_list:
                score = 0
                if chart['status'] == 'Success':
                    score += 1000
                score += chart.get('data_points', 0)
                score += chart.get('time_span_months', 0)
                
                if score > best_score:
                    best_score = score
                    best_chart = chart
            
            print(f"  Recommended to keep: {best_chart['title']} ({best_chart['chart_id']})")
            print(f"    Data points: {best_chart['data_points']}")
            print(f"    Time span: {best_chart['time_span_months']} months")
            print(f"    Status: {best_chart['status']}")
            
            print("  Charts to remove:")
            for chart in charts_list:
                if chart != best_chart:
                    print(f"    • {chart['title']} ({chart['chart_id']})")
    else:
        print("✅ No duplicate dataset IDs found")
    
    # 2. Fix failed charts
    print("\n📊 (2) FAILED CHARTS FIXES")
    print("-" * 60)
    
    failed_charts = [c for c in charts if c['status'] != 'Success']
    
    if failed_charts:
        print(f"Found {len(failed_charts)} failed charts:")
        
        for chart in failed_charts:
            print(f"\n• {chart['title']} ({chart['chart_id']})")
            print(f"  Issue: {chart['status']}")
            print(f"  Source: {chart['source']}")
            print(f"  Dataset ID: {chart['dataset_id']}")
            
            if "No cache file found" in chart['status']:
                print(f"  Action: Need to fetch data for dataset {chart['dataset_id']}")
            elif "Error parsing" in chart['status']:
                print(f"  Action: Check data format for {chart['source']} data")
    else:
        print("✅ No failed charts found")
    
    # 3. Fix zero data charts
    print("\n📊 (3) ZERO DATA CHARTS FIXES")
    print("-" * 60)
    
    zero_data_charts = [c for c in charts if c['status'] == 'Success' and c['data_points'] == 0]
    
    if zero_data_charts:
        print(f"Found {len(zero_data_charts)} charts with zero data:")
        
        for chart in zero_data_charts:
            print(f"\n• {chart['title']} ({chart['chart_id']})")
            print(f"  Dataset ID: {chart['dataset_id']}")
            print(f"  Period: {chart['period']}")
            print(f"  Action: Investigate why no data was parsed")
    else:
        print("✅ No zero data charts found")
    
    # 4. Remove very short-term charts
    print("\n📊 (4) SHORT-TERM CHARTS REMOVAL")
    print("-" * 60)
    
    short_term_charts = [c for c in charts if c['status'] == 'Success' and c.get('time_span_months', 0) < 12]
    
    if short_term_charts:
        print(f"Found {len(short_term_charts)} charts with less than 1 year of data:")
        
        for chart in short_term_charts:
            years = chart.get('time_span_months', 0) / 12
            print(f"• {chart['title']} ({chart['chart_id']}) - {years:.1f} years")
            print(f"  Period: {chart['period']}")
            print(f"  Action: Consider removing - insufficient for political analysis")
    else:
        print("✅ No short-term charts found")
    
    # 5. Data quality fixes
    print("\n📊 (5) DATA QUALITY FIXES")
    print("-" * 60)
    
    # Find charts with all zero values
    zero_value_charts = [c for c in charts if c['status'] == 'Success' and 
                        c['data_points'] > 0 and c['min_value'] == 0 and c['max_value'] == 0]
    
    if zero_value_charts:
        print(f"Found {len(zero_value_charts)} charts with all zero values:")
        for chart in zero_value_charts:
            print(f"• {chart['title']} ({chart['chart_id']})")
            print(f"  Action: Investigate data source - all values are zero")
    
    # Find charts with negative values in price/index data
    negative_price_charts = [c for c in charts if c['status'] == 'Success' and 
                           c['data_points'] > 0 and c['min_value'] < 0 and 
                           any(keyword in c['title'].lower() for keyword in ['price', 'index', 'rate'])]
    
    if negative_price_charts:
        print(f"\nFound {len(negative_price_charts)} charts with negative values in price/index data:")
        for chart in negative_price_charts:
            print(f"• {chart['title']} ({chart['chart_id']})")
            print(f"  Range: {chart['min_value']:.2f} to {chart['max_value']:.2f}")
            print(f"  Action: Verify if negative values are correct for this metric")
    
    # 6. Create action plan
    print("\n📋 ACTION PLAN")
    print("=" * 60)
    
    total_issues = len(duplicates) + len(failed_charts) + len(zero_data_charts) + len(short_term_charts)
    
    print(f"Total issues to address: {total_issues}")
    
    print(f"\n🚨 IMMEDIATE ACTIONS:")
    print(f"1. Fix {len(failed_charts)} failed charts (missing cache files)")
    print(f"2. Resolve {len(duplicates)} duplicate dataset issues")
    print(f"3. Investigate {len(zero_data_charts)} zero data charts")
    
    print(f"\n📊 OPTIMIZATION ACTIONS:")
    print(f"1. Remove {len(short_term_charts)} short-term charts")
    print(f"2. Review data quality for {len(negative_price_charts)} charts with negative values")
    
    print(f"\n✅ CHARTS READY FOR POLITICAL ANALYSIS:")
    good_charts = [c for c in charts if c['status'] == 'Success' and c.get('time_span_months', 0) >= 120]
    print(f"• {len(good_charts)} charts with 10+ years of data")
    
    # Show top 5 charts for political analysis
    top_charts = sorted(good_charts, key=lambda x: x['time_span_months'], reverse=True)[:5]
    for chart in top_charts:
        years = chart.get('time_span_months', 0) / 12
        print(f"  • {chart['title']} ({years:.1f} years)")

def create_cleaned_chart_list():
    """Create a cleaned list of charts by removing duplicates and problematic charts"""
    
    data = load_chart_analysis()
    if not data:
        return
    
    charts = data['charts']
    
    print("\n🧹 CREATING CLEANED CHART LIST")
    print("=" * 60)
    
    # Identify charts to keep
    charts_to_keep = []
    charts_to_remove = []
    
    # Handle duplicates
    duplicates = identify_duplicates(charts)
    duplicate_chart_ids = set()
    
    for ds_id, charts_list in duplicates.items():
        # Keep the best chart from each duplicate group
        best_chart = max(charts_list, key=lambda c: (
            c['status'] == 'Success',
            c.get('data_points', 0),
            c.get('time_span_months', 0)
        ))
        
        charts_to_keep.append(best_chart)
        
        # Mark others for removal
        for chart in charts_list:
            if chart != best_chart:
                charts_to_remove.append(chart)
                duplicate_chart_ids.add(chart['chart_id'])
    
    # Add non-duplicate charts
    for chart in charts:
        if chart['chart_id'] not in duplicate_chart_ids:
            # Remove failed charts
            if chart['status'] != 'Success':
                charts_to_remove.append(chart)
                continue
            
            # Remove zero data charts
            if chart['data_points'] == 0:
                charts_to_remove.append(chart)
                continue
            
            # Remove very short-term charts (< 1 year)
            if chart.get('time_span_months', 0) < 12:
                charts_to_remove.append(chart)
                continue
            
            charts_to_keep.append(chart)
    
    print(f"Original charts: {len(charts)}")
    print(f"Charts to keep: {len(charts_to_keep)}")
    print(f"Charts to remove: {len(charts_to_remove)}")
    
    # Save cleaned list
    cleaned_data = {
        'timestamp': data['timestamp'],
        'summary': {
            'original_charts': len(charts),
            'cleaned_charts': len(charts_to_keep),
            'removed_charts': len(charts_to_remove),
            'removal_reasons': {
                'duplicates': len([c for c in charts_to_remove if c['chart_id'] in duplicate_chart_ids]),
                'failed': len([c for c in charts_to_remove if c['status'] != 'Success']),
                'zero_data': len([c for c in charts_to_remove if c['data_points'] == 0]),
                'short_term': len([c for c in charts_to_remove if c.get('time_span_months', 0) < 12])
            }
        },
        'charts': charts_to_keep,
        'removed_charts': charts_to_remove
    }
    
    output_file = Path("data/reports/cleaned_chart_list.json")
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Cleaned chart list saved to: {output_file}")
    
    # Show top charts for political analysis
    political_charts = [c for c in charts_to_keep if c.get('time_span_months', 0) >= 120]
    
    print(f"\n📈 TOP CHARTS FOR POLITICAL ANALYSIS ({len(political_charts)}):")
    for chart in sorted(political_charts, key=lambda x: x.get('time_span_months', 0), reverse=True)[:10]:
        years = chart.get('time_span_months', 0) / 12
        print(f"• {chart['title']} ({years:.1f} years) - {chart['data_points']} data points")

if __name__ == "__main__":
    create_fix_recommendations()
    create_cleaned_chart_list()
