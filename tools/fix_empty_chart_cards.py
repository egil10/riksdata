#!/usr/bin/env python3
"""
Script to remove empty chart cards from index.html
"""

import re
from pathlib import Path

def fix_empty_chart_cards():
    """Remove chart cards for charts that were supposed to be removed"""
    
    html_file = Path("index.html")
    if not html_file.exists():
        print("❌ index.html not found")
        return
    
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Charts that should be removed (based on the user's request)
    charts_to_remove = [
        # Duplicate chart
        'bankruptcies-chart',
        
        # Empty government debt charts
        'government-debt-gbon-atre-chart',
        'government-debt-gbon-atri-chart', 
        'government-debt-gbon-nominal-chart',
        'government-debt-gbon-holdings-chart',
        'government-debt-gbon-issued-chart',
        'government-debt-irs-atri-chart',
        'government-debt-irs-volume-chart',
        'government-debt-tbil-nominal-chart',
        'government-debt-tbil-holdings-chart',
        'government-debt-tbil-issued-chart',
        
        # Problematic charts
        'oil-price-chart',
        'production-index-industry-recent-chart'
    ]
    
    print(f"🔍 Looking for {len(charts_to_remove)} charts to remove...")
    
    removed_count = 0
    
    for chart_id in charts_to_remove:
        # Find the chart card that contains this canvas ID
        # Look for the pattern: <div class="chart-card">...<canvas id="chart_id">...</canvas>...</div>
        
        # Create a pattern that matches the entire chart card containing this canvas
        pattern = rf'<div class="chart-card">.*?<canvas id="{re.escape(chart_id)}".*?</div>'
        
        matches = re.findall(pattern, content, re.DOTALL)
        
        if matches:
            print(f"✅ Found and removing chart card for: {chart_id}")
            # Remove the entire chart card
            content = re.sub(pattern, '', content, flags=re.DOTALL)
            removed_count += 1
        else:
            # Try a broader search - maybe the canvas is not directly in the chart card
            # Look for any chart card that contains this chart ID in its title or content
            broader_pattern = rf'<div class="chart-card">.*?{re.escape(chart_id)}.*?</div>'
            matches = re.findall(broader_pattern, content, re.DOTALL)
            
            if matches:
                print(f"✅ Found and removing chart card containing: {chart_id}")
                content = re.sub(broader_pattern, '', content, flags=re.DOTALL)
                removed_count += 1
            else:
                print(f"⚠️  Chart card for {chart_id} not found")
    
    # Also remove any chart cards that have titles matching the removed charts
    titles_to_remove = [
        'Bankruptcies',  # The duplicate one, not "Bankruptcies Total"
        'Oil Price \\(Brent\\)',
        'Production Index Industry Recent',
        'Government Debt - GBON Avg Time to Re-fixing \\(excl\\. IRS\\)',
        'Government Debt - GBON Avg Time to Re-fixing \\(incl\\. IRS\\)',
        'Government Debt - GBON Nominal Value',
        'Government Debt - GBON Own Holdings', 
        'Government Debt - GBON Volume Issued',
        'Government Debt - IRS Avg Time to Re-fixing \\(incl\\. IRS\\)',
        'Government Debt - IRS Volume',
        'Government Debt - TBIL Nominal Value',
        'Government Debt - TBIL Own Holdings',
        'Government Debt - TBIL Volume Issued'
    ]
    
    print(f"\n🔍 Looking for chart cards with specific titles...")
    
    for title_pattern in titles_to_remove:
        # Find chart cards with these titles (but not the ones we want to keep)
        pattern = rf'<div class="chart-card">.*?<h3>{title_pattern}</h3>.*?</div>'
        matches = re.findall(pattern, content, re.DOTALL)
        
        if matches:
            print(f"✅ Found and removing chart card with title: {title_pattern}")
            content = re.sub(pattern, '', content, flags=re.DOTALL)
            removed_count += 1
        else:
            print(f"⚠️  Chart card with title '{title_pattern}' not found")
    
    # Clean up any extra whitespace or empty lines that might be left
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    
    # Save the updated content
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n✅ Removed {removed_count} chart cards from index.html")
    
    # Verify the changes
    print(f"\n🔍 Verifying changes...")
    
    # Check if any of the removed charts are still present
    still_present = []
    for chart_id in charts_to_remove:
        if chart_id in content:
            still_present.append(chart_id)
    
    if still_present:
        print(f"⚠️  Some charts are still present: {still_present}")
    else:
        print("✅ All specified charts have been removed")
    
    # Count remaining chart cards
    chart_card_count = len(re.findall(r'<div class="chart-card">', content))
    canvas_count = len(re.findall(r'<canvas id=', content))
    
    print(f"📊 Remaining: {chart_card_count} chart cards, {canvas_count} canvas elements")
    
    if chart_card_count == canvas_count:
        print("✅ Chart cards and canvas elements are now balanced!")
    else:
        print(f"⚠️  Mismatch: {chart_card_count} chart cards vs {canvas_count} canvas elements")

if __name__ == "__main__":
    fix_empty_chart_cards()
