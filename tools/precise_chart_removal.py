#!/usr/bin/env python3
"""
Precise script to remove specific problematic chart cards
"""

import re
from pathlib import Path

def precise_chart_removal():
    """Remove specific chart cards that should not be present"""
    
    html_file = Path("index.html")
    if not html_file.exists():
        print("❌ index.html not found")
        return
    
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # First, let's identify which chart cards actually have canvas elements
    # and which don't by doing a proper analysis
    
    # Find all chart card divs
    chart_card_matches = list(re.finditer(r'<div class="chart-card">', content))
    
    print(f"📊 Found {len(chart_card_matches)} chart card openings")
    
    # Analyze each chart card to see if it has a canvas
    chart_cards_with_canvas = []
    chart_cards_without_canvas = []
    
    for i, match in enumerate(chart_card_matches):
        start_pos = match.start()
        
        # Find the end of this chart card by looking for the closing div
        # We need to be more careful about finding the right closing div
        remaining_content = content[start_pos:]
        
        # Find the chart title
        title_match = re.search(r'<h3>([^<]+)</h3>', remaining_content)
        title = title_match.group(1) if title_match else f"Chart {i+1}"
        
        # Check if this card has a canvas element
        # Look for canvas in the content before the next chart-card or end of content
        next_chart_card = re.search(r'<div class="chart-card">', remaining_content[1:])
        if next_chart_card:
            card_content = remaining_content[:next_chart_card.start()+1]
        else:
            card_content = remaining_content
        
        has_canvas = '<canvas id=' in card_content
        
        if has_canvas:
            chart_cards_with_canvas.append((i+1, title))
        else:
            chart_cards_without_canvas.append((i+1, title))
    
    print(f"✅ Chart cards with canvas: {len(chart_cards_with_canvas)}")
    print(f"❌ Chart cards without canvas: {len(chart_cards_without_canvas)}")
    
    if chart_cards_without_canvas:
        print("\n📋 Chart cards without canvas elements:")
        for card_num, title in chart_cards_without_canvas:
            print(f"  - Card {card_num}: {title}")
    
    # Now let's identify which of these should be removed based on the user's request
    charts_to_remove = [
        'Bankruptcies',  # The duplicate one, not "Bankruptcies Total"
        'Oil Price (Brent)',
        'Production Index Industry Recent',
        'Government Debt - GBON Avg Time to Re-fixing (excl. IRS)',
        'Government Debt - GBON Avg Time to Re-fixing (incl. IRS)',
        'Government Debt - GBON Nominal Value',
        'Government Debt - GBON Own Holdings',
        'Government Debt - GBON Volume Issued',
        'Government Debt - IRS Avg Time to Re-fixing (incl. IRS)',
        'Government Debt - IRS Volume',
        'Government Debt - TBIL Nominal Value',
        'Government Debt - TBIL Own Holdings',
        'Government Debt - TBIL Volume Issued'
    ]
    
    # Find which chart cards without canvas match our removal list
    cards_to_remove = []
    for card_num, title in chart_cards_without_canvas:
        for remove_title in charts_to_remove:
            if title == remove_title:
                cards_to_remove.append((card_num, title))
                break
    
    print(f"\n🎯 Identified {len(cards_to_remove)} chart cards to remove:")
    for card_num, title in cards_to_remove:
        print(f"  - Card {card_num}: {title}")
    
    if not cards_to_remove:
        print("✅ No chart cards need to be removed!")
        return
    
    # Now remove these specific chart cards
    # We'll do this by finding the exact positions and removing them carefully
    
    # Sort by card number in descending order to avoid position shifts
    cards_to_remove.sort(key=lambda x: x[0], reverse=True)
    
    removed_count = 0
    
    for card_num, title in cards_to_remove:
        # Find the chart card by its position
        chart_card_matches = list(re.finditer(r'<div class="chart-card">', content))
        
        if card_num <= len(chart_card_matches):
            match = chart_card_matches[card_num - 1]  # Convert to 0-based index
            start_pos = match.start()
            
            # Find the end of this chart card
            remaining_content = content[start_pos:]
            
            # Find the next chart card or end of content
            next_chart_card = re.search(r'<div class="chart-card">', remaining_content[1:])
            if next_chart_card:
                end_pos = start_pos + next_chart_card.start() + 1
            else:
                # This is the last chart card, find the end of the chart-grid
                chart_grid_end = remaining_content.find('</div>', remaining_content.find('</div>') + 1)
                if chart_grid_end != -1:
                    end_pos = start_pos + chart_grid_end + 6
                else:
                    end_pos = len(content)
            
            # Remove the chart card
            content = content[:start_pos] + content[end_pos:]
            removed_count += 1
            print(f"✅ Removed chart card {card_num}: {title}")
    
    # Clean up any extra whitespace
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    
    # Save the updated content
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n✅ Successfully removed {removed_count} chart cards")
    
    # Verify the changes
    print(f"\n🔍 Verifying changes...")
    
    # Count remaining chart cards and canvas elements
    chart_card_count = len(re.findall(r'<div class="chart-card">', content))
    canvas_count = len(re.findall(r'<canvas id=', content))
    
    print(f"📊 Remaining: {chart_card_count} chart cards, {canvas_count} canvas elements")
    
    if chart_card_count == canvas_count:
        print("✅ Chart cards and canvas elements are now balanced!")
    else:
        print(f"⚠️  Mismatch: {chart_card_count} chart cards vs {canvas_count} canvas elements")

if __name__ == "__main__":
    precise_chart_removal()
