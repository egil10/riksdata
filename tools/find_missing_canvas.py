#!/usr/bin/env python3
"""
Find which chart is missing its canvas element
"""

import re

def find_missing_canvas():
    """Find which chart ID is missing its canvas element"""
    
    # Extract chart IDs from JavaScript
    with open('src/js/main.js', 'r', encoding='utf-8') as f:
        js_content = f.read()
    
    js_pattern = r"loadChartData\('([^']+)'"
    js_chart_ids = set(re.findall(js_pattern, js_content))
    
    # Extract canvas IDs from HTML
    with open('index.html', 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    html_pattern = r'<canvas id="([^"]+)"'
    html_canvas_ids = set(re.findall(html_pattern, html_content))
    
    # Find the missing canvas
    missing_canvas = js_chart_ids - html_canvas_ids
    
    print("🔍 Finding missing canvas element...")
    print()
    print(f"📊 JavaScript chart IDs: {len(js_chart_ids)}")
    print(f"🎯 HTML canvas IDs: {len(html_canvas_ids)}")
    print()
    
    if missing_canvas:
        print("❌ Missing canvas element(s):")
        for chart_id in missing_canvas:
            print(f"  - {chart_id}")
            
        # Find the context of this chart in main.js
        print("\n📝 Context in main.js:")
        lines = js_content.split('\n')
        for i, line in enumerate(lines):
            for chart_id in missing_canvas:
                if f"loadChartData('{chart_id}'" in line:
                    print(f"  Line {i+1}: {line.strip()}")
    else:
        print("✅ No missing canvas elements found")
    
    # Also check for extra canvas elements
    extra_canvas = html_canvas_ids - js_chart_ids
    if extra_canvas:
        print("\n❌ Extra canvas element(s) in HTML:")
        for canvas_id in extra_canvas:
            print(f"  - {canvas_id}")

if __name__ == "__main__":
    find_missing_canvas()
