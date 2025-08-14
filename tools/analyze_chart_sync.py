#!/usr/bin/env python3
"""
Analyze chart synchronization between JavaScript and HTML
"""

import re
import os

def extract_chart_ids_from_js():
    """Extract chart IDs from loadChartData calls in main.js"""
    js_path = 'src/js/main.js'
    chart_ids = []
    
    with open(js_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all loadChartData calls
    pattern = r"loadChartData\('([^']+)'"
    matches = re.findall(pattern, content)
    
    for match in matches:
        chart_ids.append(match)
    
    return sorted(chart_ids)

def extract_canvas_ids_from_html():
    """Extract canvas IDs from index.html"""
    html_path = 'index.html'
    canvas_ids = []
    
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all canvas elements with id attributes
    pattern = r'<canvas id="([^"]+)"'
    matches = re.findall(pattern, content)
    
    for match in matches:
        canvas_ids.append(match)
    
    return sorted(canvas_ids)

def analyze_synchronization():
    """Analyze the synchronization between JS and HTML"""
    print("🔍 Analyzing chart synchronization between JavaScript and HTML...")
    print()
    
    # Extract chart IDs from both sources
    js_chart_ids = extract_chart_ids_from_js()
    html_canvas_ids = extract_canvas_ids_from_html()
    
    print(f"📊 JavaScript loadChartData calls: {len(js_chart_ids)}")
    print(f"🎯 HTML canvas elements: {len(html_canvas_ids)}")
    print()
    
    # Find discrepancies
    js_only = set(js_chart_ids) - set(html_canvas_ids)
    html_only = set(html_canvas_ids) - set(js_chart_ids)
    common = set(js_chart_ids) & set(html_canvas_ids)
    
    print(f"✅ Charts in both JS and HTML: {len(common)}")
    print(f"❌ Charts only in JavaScript: {len(js_only)}")
    print(f"❌ Canvas elements only in HTML: {len(html_only)}")
    print()
    
    if js_only:
        print("📝 Charts loaded in JavaScript but missing canvas in HTML:")
        for chart_id in sorted(js_only):
            print(f"  - {chart_id}")
        print()
    
    if html_only:
        print("📝 Canvas elements in HTML but not loaded in JavaScript:")
        for canvas_id in sorted(html_only):
            print(f"  - {canvas_id}")
        print()
    
    # Check for the specific charts mentioned by the user
    user_mentioned_charts = [
        'crime-rate-chart',
        'gdp-growth-chart', 
        'housing-starts-chart',
        'job-vacancies-chart',
        'living-arrangements-national-chart',
        'oil-fund-chart',
        'trade-balance-chart'
    ]
    
    print("🎯 Checking user-mentioned 'empty' charts:")
    for chart_id in user_mentioned_charts:
        in_js = chart_id in js_chart_ids
        in_html = chart_id in html_canvas_ids
        status = "✅" if in_js and in_html else "❌"
        print(f"  {status} {chart_id}: JS={in_js}, HTML={in_html}")
    
    print()
    
    # Check if all charts are properly synchronized
    if len(js_only) == 0 and len(html_only) == 0:
        print("🎉 PERFECT SYNCHRONIZATION: All charts are properly synchronized!")
    else:
        print("⚠️  SYNCHRONIZATION ISSUES DETECTED")
        print("   The JavaScript and HTML are not fully synchronized.")
    
    return js_chart_ids, html_canvas_ids, js_only, html_only

if __name__ == "__main__":
    analyze_synchronization()
