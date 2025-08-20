#!/usr/bin/env python3
"""
Dataset Integration Script for Riksdata

This script helps you quickly add new JSON datasets to the Riksdata website.
It automates the process of adding chart configurations to main.js and HTML elements to index.html.

Usage:
    python add-dataset.py --json-file data/static/your-dataset.json --chart-id your-chart-id
"""

import json
import argparse
import os
import re
from pathlib import Path

def load_json_data(json_file_path):
    """Load and validate JSON data file."""
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Validate required fields
        required_fields = ['title', 'description', 'source', 'source_url', 'unit', 'data']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            raise ValueError(f"Missing required fields: {missing_fields}")
        
        if not data['data'] or len(data['data']) < 2:
            raise ValueError("Data array must contain at least 2 data points")
        
        return data
    except FileNotFoundError:
        raise FileNotFoundError(f"JSON file not found: {json_file_path}")
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON format: {e}")

def add_to_main_js(chart_id, json_path, title):
    """Add chart configuration to main.js."""
    main_js_path = Path("src/js/main.js")
    
    if not main_js_path.exists():
        raise FileNotFoundError("main.js not found at src/js/main.js")
    
    # Read current main.js content
    with open(main_js_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the chartConfigs array
    chart_configs_pattern = r'const chartConfigs = \[(.*?)\];'
    match = re.search(chart_configs_pattern, content, re.DOTALL)
    
    if not match:
        raise ValueError("Could not find chartConfigs array in main.js")
    
    # Create new chart configuration
    new_config = f'    {{ id: \'{chart_id}\', url: \'{json_path}\', title: \'{title}\' }}'
    
    # Add to the array (before the closing bracket)
    chart_configs_content = match.group(1)
    
    # Check if chart already exists
    if f"id: '{chart_id}'" in chart_configs_content:
        print(f"Warning: Chart with ID '{chart_id}' already exists in main.js")
        return False
    
    # Add new config to the array
    lines = chart_configs_content.split('\n')
    # Find the last entry and add comma
    for i in range(len(lines) - 1, -1, -1):
        line = lines[i].strip()
        if line and not line.startswith('//'):
            if not line.endswith(','):
                lines[i] = line + ','
            break
    
    # Insert new config
    lines.append(new_config)
    
    # Reconstruct the array
    new_chart_configs = '\n'.join(lines)
    new_content = content.replace(match.group(0), f'const chartConfigs = [{new_chart_configs}];')
    
    # Write back to file
    with open(main_js_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✓ Added chart configuration to main.js")
    return True

def add_to_index_html(chart_id, title, source, unit):
    """Add HTML chart container to index.html."""
    index_html_path = Path("index.html")
    
    if not index_html_path.exists():
        raise FileNotFoundError("index.html not found in root directory")
    
    # Read current index.html content
    with open(index_html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if chart already exists
    if f'id="{chart_id}"' in content:
        print(f"Warning: Chart with ID '{chart_id}' already exists in index.html")
        return False
    
    # Create HTML template
    html_template = f'''
        <div class="chart-card">
            <div class="chart-header">
                <h3>{title}</h3>
                <a href="{source}" target="_blank" class="source-link">Source</a>
                <div class="chart-subtitle">{unit}</div>
            </div>
            <div class="skeleton-chart" id="{chart_id}-skeleton"></div>
            <div class="chart-container">
                <canvas id="{chart_id}"></canvas>
                <div class="static-tooltip" id="{chart_id}-tooltip"></div>
            </div>
        </div>'''
    
    # Find a good place to insert (after existing chart cards)
    # Look for the last chart-card div
    chart_card_pattern = r'(<div class="chart-card">.*?</div>\s*</div>\s*</div>)'
    matches = list(re.finditer(chart_card_pattern, content, re.DOTALL))
    
    if matches:
        # Insert after the last chart card
        last_match = matches[-1]
        insert_pos = last_match.end()
        new_content = content[:insert_pos] + html_template + content[insert_pos:]
    else:
        # Fallback: insert before closing body tag
        body_end = content.find('</body>')
        if body_end == -1:
            raise ValueError("Could not find </body> tag in index.html")
        new_content = content[:body_end] + html_template + content[body_end:]
    
    # Write back to file
    with open(index_html_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✓ Added HTML chart container to index.html")
    return True

def main():
    parser = argparse.ArgumentParser(description='Add a new dataset to Riksdata website')
    parser.add_argument('--json-file', required=True, help='Path to JSON data file')
    parser.add_argument('--chart-id', required=True, help='Unique chart ID (e.g., gdp-growth-chart)')
    parser.add_argument('--source-url', help='Override source URL from JSON file')
    
    args = parser.parse_args()
    
    try:
        # Load and validate JSON data
        print(f"Loading JSON file: {args.json_file}")
        data = load_json_data(args.json_file)
        print(f"✓ JSON file validated successfully")
        
        # Determine JSON path for main.js
        json_path = f'./{args.json_file}'
        
        # Add to main.js
        main_js_updated = add_to_main_js(args.chart_id, json_path, data['title'])
        
        # Add to index.html
        source_url = args.source_url or data['source_url']
        index_html_updated = add_to_index_html(args.chart_id, data['title'], source_url, data['unit'])
        
        if main_js_updated and index_html_updated:
            print(f"\n🎉 Successfully integrated dataset!")
            print(f"Chart ID: {args.chart_id}")
            print(f"Title: {data['title']}")
            print(f"Data points: {len(data['data'])}")
            print(f"\nNext steps:")
            print(f"1. Test locally: python -m http.server 8000")
            print(f"2. Open http://localhost:8000")
            print(f"3. Verify chart loads correctly")
            print(f"4. Commit changes: git add . && git commit -m 'Add {args.chart_id}'")
        else:
            print(f"\n⚠️  Dataset partially integrated. Check warnings above.")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
