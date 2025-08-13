#!/usr/bin/env python3
"""
Generate filtered chart configuration based on quality analysis
"""

import json
import re
from pathlib import Path

def extract_chart_info_from_main_js(main_js_path):
    """Extract chart information from main.js"""
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
        if 'ssb.no/api/v0/dataset/' in url:
            dataset_id = url.split('/dataset/')[1].split('.')[0]
        elif 'norges-bank.no/api/data/' in url:
            dataset_id = url.split('/api/data/')[1].split('?')[0]
        
        charts.append({
            'chart_id': chart_id,
            'url': url,
            'title': title,
            'chart_type': chart_type,
            'dataset_id': dataset_id,
            'cache_name': chart_id.replace('-chart', '')
        })
    
    return charts

def create_filtered_main_js(quality_report_path, main_js_path, output_path):
    """Create filtered main.js with only high-quality charts"""
    
    # Load quality report
    with open(quality_report_path, 'r', encoding='utf-8') as f:
        quality_data = json.load(f)
    
    # Create set of approved dataset IDs
    approved_datasets = set()
    for chart in quality_data['display_charts']:
        approved_datasets.add(chart['dataset_id'])
    
    print(f"Approved datasets: {len(approved_datasets)}")
    
    # Extract all charts from main.js
    all_charts = extract_chart_info_from_main_js(main_js_path)
    print(f"Total charts in main.js: {len(all_charts)}")
    
    # Filter charts
    filtered_charts = []
    excluded_charts = []
    
    for chart in all_charts:
        # Check if this chart should be included
        should_include = False
        
        # Check by dataset ID
        if chart['dataset_id'] and chart['dataset_id'] in approved_datasets:
            should_include = True
        # Check by cache name
        elif chart['cache_name'] in approved_datasets:
            should_include = True
        # Check if it's a static file (oil-fund, etc.)
        elif 'data/' in chart['url'] and not chart['url'].startswith('http'):
            should_include = True
        # Check if it's Norges Bank data (usually high quality)
        elif 'norges-bank.no' in chart['url']:
            should_include = True
        
        if should_include:
            filtered_charts.append(chart)
        else:
            excluded_charts.append(chart)
    
    print(f"Charts to include: {len(filtered_charts)}")
    print(f"Charts to exclude: {len(excluded_charts)}")
    
    # Generate new main.js content
    new_content = generate_main_js_content(filtered_charts, main_js_path)
    
    # Write filtered main.js
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Filtered main.js written to: {output_path}")
    
    # Save excluded charts info
    excluded_info = {
        'excluded_charts': excluded_charts,
        'included_charts': filtered_charts,
        'total_original': len(all_charts),
        'total_filtered': len(filtered_charts),
        'total_excluded': len(excluded_charts)
    }
    
    with open('excluded_charts_report.json', 'w', encoding='utf-8') as f:
        json.dump(excluded_info, f, indent=2, ensure_ascii=False)
    
    print("Excluded charts report saved to: excluded_charts_report.json")

def generate_main_js_content(filtered_charts, original_main_js_path):
    """Generate new main.js content with filtered charts"""
    
    # Read original main.js
    with open(original_main_js_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the chart promises section
    start_marker = "const chartPromises = ["
    end_marker = "];"
    
    start_idx = content.find(start_marker)
    if start_idx == -1:
        raise ValueError("Could not find chartPromises section")
    
    # Find the end of the array
    end_idx = content.find(end_marker, start_idx)
    if end_idx == -1:
        raise ValueError("Could not find end of chartPromises array")
    
    # Generate new chart promises content
    new_chart_promises = []
    for chart in filtered_charts:
        if chart['chart_type'] == 'line':
            line = f"            loadChartData('{chart['chart_id']}', '{chart['url']}', '{chart['title']}')"
        else:
            line = f"            loadChartData('{chart['chart_id']}', '{chart['url']}', '{chart['title']}', '{chart['chart_type']}')"
        new_chart_promises.append(line)
    
    # Replace the chart promises section
    new_chart_section = start_marker + "\n" + ",\n".join(new_chart_promises) + "\n        " + end_marker
    
    new_content = content[:start_idx] + new_chart_section + content[end_idx + len(end_marker):]
    
    return new_content

def main():
    """Main entry point"""
    quality_report_path = 'chart_quality_report.json'
    main_js_path = 'src/js/main.js'
    output_path = 'src/js/main_filtered.js'
    
    if not Path(quality_report_path).exists():
        print(f"Error: {quality_report_path} not found. Run analyze_chart_quality.py first.")
        return
    
    if not Path(main_js_path).exists():
        print(f"Error: {main_js_path} not found.")
        return
    
    create_filtered_main_js(quality_report_path, main_js_path, output_path)

if __name__ == '__main__':
    main()
