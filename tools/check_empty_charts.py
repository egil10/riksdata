#!/usr/bin/env python3
"""
Script to check for empty chart cards in the HTML file
"""

import re
from pathlib import Path

def check_empty_charts():
    """Check for empty chart cards in index.html"""
    
    html_file = Path("index.html")
    if not html_file.exists():
        print("❌ index.html not found")
        return
    
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all chart-card divs with a more robust pattern
    # Look for opening chart-card divs and their content
    chart_card_matches = list(re.finditer(r'<div class="chart-card">', content))
    
    print(f"📊 Found {len(chart_card_matches)} chart card openings")
    
    # Get all canvas elements
    canvas_matches = list(re.finditer(r'<canvas id="([^"]+)"', content))
    canvas_ids = [match.group(1) for match in canvas_matches]
    
    print(f"🎯 Found {len(canvas_ids)} canvas elements")
    
    # Check for missing canvas elements by analyzing the structure
    # Let's look at the content around each chart-card opening
    empty_cards = []
    
    for i, match in enumerate(chart_card_matches):
        start_pos = match.start()
        
        # Find the next closing div that matches this chart-card
        # Look for the next </div> that closes this chart-card
        remaining_content = content[start_pos:]
        
        # Find the chart title in this card
        title_match = re.search(r'<h3>([^<]+)</h3>', remaining_content)
        title = title_match.group(1) if title_match else f"Chart {i+1}"
        
        # Check if this card has a canvas element
        has_canvas = '<canvas id=' in remaining_content[:remaining_content.find('</div>')]
        
        if not has_canvas:
            empty_cards.append((i+1, title))
    
    if empty_cards:
        print(f"\n❌ Found {len(empty_cards)} chart cards without canvas elements:")
        for card_num, title in empty_cards:
            print(f"  - Card {card_num}: {title}")
    else:
        print("\n✅ All chart cards have canvas elements")
    
    # Check for specific removed charts
    removed_charts = [
        'bankruptcies-chart',
        'oil-price-chart', 
        'production-index-industry-recent-chart',
        'government-debt-gbon-atre-chart',
        'government-debt-gbon-atri-chart',
        'government-debt-gbon-nominal-chart',
        'government-debt-gbon-holdings-chart',
        'government-debt-gbon-issued-chart',
        'government-debt-irs-atri-chart',
        'government-debt-irs-volume-chart',
        'government-debt-tbil-nominal-chart',
        'government-debt-tbil-holdings-chart',
        'government-debt-tbil-issued-chart'
    ]
    
    print(f"\n🔍 Checking for removed charts:")
    found_removed = []
    for chart_id in removed_charts:
        if chart_id in content:
            found_removed.append(chart_id)
    
    if found_removed:
        print("❌ Found removed charts still in HTML:")
        for chart in found_removed:
            print(f"  - {chart}")
    else:
        print("✅ No removed charts found in HTML")
    
    # Check if all canvas IDs are unique
    if len(canvas_ids) != len(set(canvas_ids)):
        print("⚠️  Duplicate canvas IDs found!")
        from collections import Counter
        duplicates = [k for k, v in Counter(canvas_ids).items() if v > 1]
        for dup in duplicates:
            print(f"  - {dup}")
    
    # List all canvas IDs for reference
    print(f"\n📋 All canvas IDs:")
    for canvas_id in canvas_ids:
        print(f"  - {canvas_id}")

if __name__ == "__main__":
    check_empty_charts()
