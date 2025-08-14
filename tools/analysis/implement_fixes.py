#!/usr/bin/env python3
"""
Implement Chart Fixes Script
Actually implements the fixes by updating main.js and cleaning up files
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any, Set

def load_cleaned_chart_list():
    """Load the cleaned chart list"""
    results_file = Path("data/reports/cleaned_chart_list.json")
    
    if not results_file.exists():
        print("❌ Cleaned chart list not found. Run fix_chart_issues.py first.")
        return None
    
    with open(results_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def update_main_js():
    """Update main.js to remove duplicate and failed charts"""
    
    data = load_cleaned_chart_list()
    if not data:
        return
    
    charts_to_keep = data['charts']
    charts_to_remove = data['removed_charts']
    
    # Create set of chart IDs to keep
    keep_chart_ids = {chart['chart_id'] for chart in charts_to_keep}
    
    print("🔧 UPDATING MAIN.JS")
    print("=" * 60)
    
    # Read main.js
    main_js_path = Path("src/js/main.js")
    
    if not main_js_path.exists():
        print("❌ main.js not found")
        return
    
    with open(main_js_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all loadChartData calls
    pattern = r"loadChartData\('([^']+)',\s*'([^']+)',\s*'([^']+)'(?:,\s*'([^']+)')?\)"
    matches = re.findall(pattern, content)
    
    print(f"Found {len(matches)} chart calls in main.js")
    
    # Filter out charts to remove
    kept_calls = []
    removed_calls = []
    
    for match in matches:
        chart_id = match[0]
        url = match[1]
        title = match[2]
        chart_type = match[3] if match[3] else 'line'
        
        if chart_id in keep_chart_ids:
            kept_calls.append(match)
        else:
            removed_calls.append(match)
    
    print(f"Keeping {len(kept_calls)} charts")
    print(f"Removing {len(removed_calls)} charts")
    
    # Show what's being removed
    print("\n📋 CHARTS BEING REMOVED:")
    for match in removed_calls:
        chart_id = match[0]
        title = match[2]
        print(f"  • {title} ({chart_id})")
    
    # Create new content with only kept charts
    new_content = content
    
    # Remove the loadChartData calls for charts we don't want
    for match in removed_calls:
        chart_id = match[0]
        url = match[1]
        title = match[2]
        chart_type = match[3] if match[3] else 'line'
        
        # Create the exact string to remove
        if chart_type == 'line':
            call_string = f"loadChartData('{chart_id}', '{url}', '{title}')"
        else:
            call_string = f"loadChartData('{chart_id}', '{url}', '{title}', '{chart_type}')"
        
        # Remove the line
        new_content = new_content.replace(call_string + '\n', '')
        new_content = new_content.replace(call_string, '')
    
    # Write updated main.js
    backup_path = main_js_path.with_suffix('.js.backup')
    if backup_path.exists():
        backup_path.unlink()
    main_js_path.rename(backup_path)
    
    with open(main_js_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"\n✅ Updated main.js")
    print(f"📁 Backup saved to: {backup_path}")
    
    return kept_calls, removed_calls

def clean_cache_files():
    """Remove cache files for charts that are being removed"""
    
    data = load_cleaned_chart_list()
    if not data:
        return
    
    charts_to_remove = data['removed_charts']
    
    print("\n🧹 CLEANING CACHE FILES")
    print("=" * 60)
    
    cache_dir = Path("data/cached")
    removed_files = []
    
    for chart in charts_to_remove:
        if chart['status'] == 'Success':
            # Find the cache file
            dataset_id = chart['dataset_id']
            source = chart['source']
            
            if source == 'SSB':
                cache_file = cache_dir / 'ssb' / f"{dataset_id}.json"
            elif source == 'Norges Bank':
                # Norges Bank files have different naming
                if 'exchange' in chart['chart_id']:
                    cache_file = cache_dir / 'norges-bank' / 'exchange-rates.json'
                elif 'debt' in chart['chart_id']:
                    cache_file = cache_dir / 'norges-bank' / 'government-debt.json'
                elif 'interest' in chart['chart_id']:
                    cache_file = cache_dir / 'norges-bank' / 'interest-rate.json'
                else:
                    continue
            elif source == 'Cached':
                cache_file = cache_dir / 'oil-fund.json'
            else:
                continue
            
            if cache_file.exists():
                # Only remove if no other charts use this file
                other_charts_using_file = [c for c in data['charts'] 
                                         if c['dataset_id'] == dataset_id and c['source'] == source]
                
                if not other_charts_using_file:
                    cache_file.unlink()
                    removed_files.append(cache_file)
                    print(f"  Removed: {cache_file}")
    
    print(f"\n✅ Removed {len(removed_files)} cache files")

def create_optimized_website():
    """Create an optimized version of the website with only high-quality charts"""
    
    data = load_cleaned_chart_list()
    if not data:
        return
    
    charts_to_keep = data['charts']
    
    print("\n🚀 CREATING OPTIMIZED WEBSITE")
    print("=" * 60)
    
    # Create optimized main.js with only political analysis charts (10+ years)
    political_charts = [c for c in charts_to_keep if c.get('time_span_months', 0) >= 120]
    
    print(f"Creating optimized version with {len(political_charts)} political analysis charts")
    
    # Read original main.js
    main_js_path = Path("src/js/main.js")
    backup_path = main_js_path.with_suffix('.js.backup')
    
    if backup_path.exists():
        with open(backup_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
    else:
        with open(main_js_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
    
    # Create optimized content with only political charts
    political_chart_ids = {chart['chart_id'] for chart in political_charts}
    
    # Find all loadChartData calls
    pattern = r"loadChartData\('([^']+)',\s*'([^']+)',\s*'([^']+)'(?:,\s*'([^']+)')?\);?\s*//\s*([^\n]*)"
    matches = re.findall(pattern, original_content)
    
    optimized_content = original_content
    
    # Remove charts that aren't political analysis charts
    for match in matches:
        chart_id = match[0]
        url = match[1]
        title = match[2]
        chart_type = match[3] if match[3] else 'line'
        
        if chart_id not in political_chart_ids:
            # Create the exact string to remove
            if chart_type == 'line':
                call_string = f"loadChartData('{chart_id}', '{url}', '{title}')"
            else:
                call_string = f"loadChartData('{chart_id}', '{url}', '{title}', '{chart_type}')"
            
            # Remove the line
            optimized_content = optimized_content.replace(call_string + '\n', '')
            optimized_content = optimized_content.replace(call_string, '')
    
    # Save optimized version
    optimized_path = Path("src/js/main_optimized.js")
    with open(optimized_path, 'w', encoding='utf-8') as f:
        f.write(optimized_content)
    
    print(f"✅ Optimized main.js saved to: {optimized_path}")
    
    # Create summary
    summary = {
        'total_charts': len(charts_to_keep),
        'political_charts': len(political_charts),
        'removed_charts': len(data['removed_charts']),
        'top_political_charts': [
            {
                'title': chart['title'],
                'years': round(chart.get('time_span_months', 0) / 12, 1),
                'data_points': chart['data_points']
            }
            for chart in sorted(political_charts, key=lambda x: x.get('time_span_months', 0), reverse=True)[:10]
        ]
    }
    
    summary_path = Path("data/reports/optimization_summary.json")
    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Optimization summary saved to: {summary_path}")
    
    return summary

def cleanup_temp_files():
    """Clean up temporary files created during analysis"""
    
    print("\n🧹 CLEANING UP TEMPORARY FILES")
    print("=" * 60)
    
    # List of temporary files to remove
    temp_files = [
        "chart_quality_report.json",
        "diagnostics_report.md", 
        "diagnostics_results.json",
        "test-*.html"
    ]
    
    removed_files = []
    
    for pattern in temp_files:
        for file_path in Path(".").glob(pattern):
            if file_path.is_file():
                file_path.unlink()
                removed_files.append(file_path)
                print(f"  Removed: {file_path}")
    
    print(f"\n✅ Removed {len(removed_files)} temporary files")

def main():
    """Main function to implement all fixes"""
    
    print("🔧 IMPLEMENTING CHART FIXES")
    print("=" * 60)
    
    # 1. Update main.js to remove duplicates and failed charts
    kept_calls, removed_calls = update_main_js()
    
    # 2. Clean cache files
    clean_cache_files()
    
    # 3. Create optimized website
    summary = create_optimized_website()
    
    # 4. Clean up temporary files
    cleanup_temp_files()
    
    print("\n🎉 ALL FIXES IMPLEMENTED!")
    print("=" * 60)
    print(f"✅ Updated main.js with {len(kept_calls)} charts")
    print(f"✅ Removed {len(removed_calls)} problematic charts")
    print(f"✅ Created optimized version with {summary['political_charts']} political analysis charts")
    print(f"✅ Cleaned up temporary files")
    
    print(f"\n📊 FINAL RESULTS:")
    print(f"  • Total charts: {summary['total_charts']}")
    print(f"  • Political analysis charts: {summary['political_charts']}")
    print(f"  • Charts removed: {summary['removed_charts']}")
    
    print(f"\n🏆 TOP POLITICAL ANALYSIS CHARTS:")
    for i, chart in enumerate(summary['top_political_charts'][:5], 1):
        print(f"  {i}. {chart['title']} ({chart['years']} years, {chart['data_points']} data points)")

if __name__ == "__main__":
    main()
