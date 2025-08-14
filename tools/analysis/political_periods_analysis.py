#!/usr/bin/env python3
"""
Political Periods Analysis Script
Analyzes charts with data from 1945 onwards and maps them to Norwegian political periods
"""

import json
from pathlib import Path
from typing import Dict, List, Any, Tuple
from datetime import datetime

# Norwegian political periods from 1945 onwards
NORWEGIAN_GOVERNMENTS = [
    {
        "period": "1945-1951",
        "start_date": "1945-11-05",
        "end_date": "1951-11-19", 
        "prime_minister": "Einar Gerhardsen",
        "government": "Einar Gerhardsens andre regjering",
        "parties": ["Ap"],
        "years": 6.0
    },
    {
        "period": "1951-1955",
        "start_date": "1951-11-19",
        "end_date": "1955-01-22",
        "prime_minister": "Oscar Torp", 
        "government": "Oscar Torps regjering",
        "parties": ["Ap"],
        "years": 3.2
    },
    {
        "period": "1955-1963",
        "start_date": "1955-01-22",
        "end_date": "1963-08-28",
        "prime_minister": "Einar Gerhardsen",
        "government": "Einar Gerhardsens tredje regjering", 
        "parties": ["Ap"],
        "years": 8.6
    },
    {
        "period": "1963",
        "start_date": "1963-08-28",
        "end_date": "1963-09-25",
        "prime_minister": "John Lyng",
        "government": "John Lyngs regjering",
        "parties": ["H", "Sp", "V", "KrF"],
        "years": 0.1
    },
    {
        "period": "1963-1965",
        "start_date": "1963-09-25",
        "end_date": "1965-10-12",
        "prime_minister": "Einar Gerhardsen",
        "government": "Einar Gerhardsens fjerde regjering",
        "parties": ["Ap"],
        "years": 2.0
    },
    {
        "period": "1965-1971",
        "start_date": "1965-10-12",
        "end_date": "1971-03-17",
        "prime_minister": "Per Borten",
        "government": "Per Bortens regjering",
        "parties": ["Sp", "H", "V", "KrF"],
        "years": 5.4
    },
    {
        "period": "1971-1972",
        "start_date": "1971-03-17",
        "end_date": "1972-10-18",
        "prime_minister": "Trygve Bratteli",
        "government": "Trygve Brattelis første regjering",
        "parties": ["Ap"],
        "years": 1.6
    },
    {
        "period": "1972-1973",
        "start_date": "1972-10-18",
        "end_date": "1973-10-16",
        "prime_minister": "Lars Korvald",
        "government": "Lars Korvalds regjering",
        "parties": ["KrF", "Sp", "V"],
        "years": 1.0
    },
    {
        "period": "1973-1976",
        "start_date": "1973-10-16",
        "end_date": "1976-01-15",
        "prime_minister": "Trygve Bratteli",
        "government": "Trygve Brattelis andre regjering",
        "parties": ["Ap"],
        "years": 2.3
    },
    {
        "period": "1976-1981",
        "start_date": "1976-01-15",
        "end_date": "1981-02-04",
        "prime_minister": "Odvar Nordli",
        "government": "Odvar Nordlis regjering",
        "parties": ["Ap"],
        "years": 5.1
    },
    {
        "period": "1981",
        "start_date": "1981-02-04",
        "end_date": "1981-10-14",
        "prime_minister": "Gro Harlem Brundtland",
        "government": "Gro Harlem Brundtlands første regjering",
        "parties": ["Ap"],
        "years": 0.7
    },
    {
        "period": "1981-1986",
        "start_date": "1981-10-14",
        "end_date": "1986-05-09",
        "prime_minister": "Kåre Willoch",
        "government": "Kåre Willochs regjering",
        "parties": ["H", "KrF", "Sp"],
        "years": 4.6
    },
    {
        "period": "1986-1989",
        "start_date": "1986-05-09",
        "end_date": "1989-10-16",
        "prime_minister": "Gro Harlem Brundtland",
        "government": "Gro Harlem Brundtlands andre regjering",
        "parties": ["Ap"],
        "years": 3.4
    },
    {
        "period": "1989-1990",
        "start_date": "1989-10-16",
        "end_date": "1990-11-03",
        "prime_minister": "Jan P. Syse",
        "government": "Jan P. Syses regjering",
        "parties": ["H", "KrF", "Sp"],
        "years": 1.0
    },
    {
        "period": "1990-1996",
        "start_date": "1990-11-03",
        "end_date": "1996-10-25",
        "prime_minister": "Gro Harlem Brundtland",
        "government": "Gro Harlem Brundtlands tredje regjering",
        "parties": ["Ap"],
        "years": 6.0
    },
    {
        "period": "1996-1997",
        "start_date": "1996-10-25",
        "end_date": "1997-10-17",
        "prime_minister": "Thorbjørn Jagland",
        "government": "Thorbjørn Jaglands regjering",
        "parties": ["Ap"],
        "years": 1.0
    },
    {
        "period": "1997-2000",
        "start_date": "1997-10-17",
        "end_date": "2000-03-17",
        "prime_minister": "Kjell Magne Bondevik",
        "government": "Kjell Magne Bondeviks første regjering",
        "parties": ["KrF", "Sp", "V"],
        "years": 2.4
    },
    {
        "period": "2000-2001",
        "start_date": "2000-03-17",
        "end_date": "2001-10-19",
        "prime_minister": "Jens Stoltenberg",
        "government": "Jens Stoltenbergs første regjering",
        "parties": ["Ap"],
        "years": 1.6
    },
    {
        "period": "2001-2005",
        "start_date": "2001-10-19",
        "end_date": "2005-10-17",
        "prime_minister": "Kjell Magne Bondevik",
        "government": "Kjell Magne Bondeviks andre regjering",
        "parties": ["KrF", "H", "V"],
        "years": 4.0
    },
    {
        "period": "2005-2013",
        "start_date": "2005-10-17",
        "end_date": "2013-10-16",
        "prime_minister": "Jens Stoltenberg",
        "government": "Jens Stoltenbergs andre regjering",
        "parties": ["Ap", "SV", "Sp"],
        "years": 8.0
    },
    {
        "period": "2013-2021",
        "start_date": "2013-10-16",
        "end_date": "2021-10-14",
        "prime_minister": "Erna Solberg",
        "government": "Erna Solbergs regjering",
        "parties": ["H", "FrP", "V", "KrF"],
        "years": 8.0
    },
    {
        "period": "2021-2025",
        "start_date": "2021-10-14",
        "end_date": "2025-01-04",
        "prime_minister": "Jonas Gahr Støre",
        "government": "Jonas Gahr Støres regjering",
        "parties": ["Ap", "Sp"],
        "years": 3.2
    }
]

def extract_year_from_period(period_str: str) -> int:
    """Extract year from various period formats"""
    try:
        # Handle formats like: 1979M01, 2000K1, 2025, etc.
        if 'M' in period_str:
            return int(period_str.split('M')[0])
        elif 'K' in period_str:
            return int(period_str.split('K')[0])
        elif 'U' in period_str:
            return int(period_str.split('U')[0])
        else:
            return int(period_str)
    except:
        return None

def analyze_political_coverage():
    """Analyze charts for political period coverage from 1945 onwards"""
    
    # Load chart analysis results
    results_file = Path("docs/reports/chart_analysis_results.json")
    
    if not results_file.exists():
        print("❌ Chart analysis results not found. Run chart_analysis.py first.")
        return
    
    with open(results_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    charts = data['charts']
    
    print("🏛️  POLITICAL PERIODS ANALYSIS (1945-2025)")
    print("=" * 80)
    
    # Debug: Show all periods
    print("🔍 DEBUG: All chart periods:")
    all_periods = []
    for chart in charts:
        if chart['status'] == 'Success' and chart['period'] != 'Unknown':
            all_periods.append(chart['period'])
            print(f"  • {chart['title']}: {chart['period']}")
    
    print(f"\n📊 Total charts with valid periods: {len(all_periods)}")
    
    # Find charts with data from 1945 onwards
    charts_1945_onwards = []
    
    for chart in charts:
        if chart['status'] == 'Success' and chart['period'] != 'Unknown':
            # Extract start year from period
            period_parts = chart['period'].split(' to ')
            if len(period_parts) == 2:
                start_year = extract_year_from_period(period_parts[0])
                end_year = extract_year_from_period(period_parts[1])
                
                if start_year and end_year and start_year <= 1980:  # Include charts starting before 1980
                    charts_1945_onwards.append({
                        'chart': chart,
                        'start_year': start_year,
                        'end_year': end_year,
                        'years_covered': end_year - start_year
                    })
    
    # Sort by years covered
    charts_1945_onwards.sort(key=lambda x: x['years_covered'], reverse=True)
    
    print(f"📊 Charts with data from 1945 onwards: {len(charts_1945_onwards)}")
    
    # Show top charts
    print(f"\n🏆 TOP CHARTS WITH LONGEST HISTORICAL DATA:")
    for i, item in enumerate(charts_1945_onwards[:15], 1):
        chart = item['chart']
        years = item['years_covered']
        print(f"{i:2d}. {chart['title']}")
        print(f"    Period: {chart['period']} ({years} years)")
        print(f"    Data points: {chart['data_points']}")
        print()
    
    # Analyze political period coverage
    print("📈 POLITICAL PERIOD COVERAGE ANALYSIS:")
    print("-" * 80)
    
    # Count how many governments each chart covers
    government_coverage = []
    
    for item in charts_1945_onwards:
        chart = item['chart']
        start_year = item['start_year']
        end_year = item['end_year']
        
        covered_governments = []
        for gov in NORWEGIAN_GOVERNMENTS:
            gov_start = int(gov['start_date'].split('-')[0])
            gov_end = int(gov['end_date'].split('-')[0])
            
            # Check if chart data overlaps with government period
            if (start_year <= gov_end and end_year >= gov_start):
                covered_governments.append(gov)
        
        government_coverage.append({
            'chart': chart,
            'start_year': start_year,
            'end_year': end_year,
            'years_covered': end_year - start_year,
            'governments_covered': len(covered_governments),
            'governments': covered_governments
        })
    
    # Sort by number of governments covered
    government_coverage.sort(key=lambda x: x['governments_covered'], reverse=True)
    
    print(f"\n🏛️  CHARTS COVERING MOST POLITICAL PERIODS:")
    for i, item in enumerate(government_coverage[:10], 1):
        chart = item['chart']
        gov_count = item['governments_covered']
        years = item['years_covered']
        print(f"{i:2d}. {chart['title']}")
        print(f"    Covers {gov_count} governments ({years} years)")
        print(f"    Period: {chart['period']}")
        print(f"    Data points: {chart['data_points']}")
        print()
    
    # Create summary for political analysis
    political_summary = {
        'total_charts_1945_onwards': len(charts_1945_onwards),
        'top_historical_charts': [
            {
                'title': item['chart']['title'],
                'period': item['chart']['period'],
                'years_covered': item['years_covered'],
                'data_points': item['chart']['data_points']
            }
            for item in charts_1945_onwards[:20]
        ],
        'top_political_coverage': [
            {
                'title': item['chart']['title'],
                'governments_covered': item['governments_covered'],
                'years_covered': item['years_covered'],
                'period': item['chart']['period'],
                'data_points': item['chart']['data_points']
            }
            for item in government_coverage[:20]
        ],
        'norwegian_governments': NORWEGIAN_GOVERNMENTS
    }
    
    # Save political analysis
    output_file = Path("docs/reports/political_periods_analysis.json")
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(political_summary, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Political periods analysis saved to: {output_file}")
    
    return political_summary

def create_political_periods_html():
    """Create HTML for political periods display in footer"""
    
    print("\n🌐 CREATING POLITICAL PERIODS HTML")
    print("=" * 80)
    
    # Create compact HTML for footer
    html_content = """<!-- Norwegian Political Periods (1945-2025) -->
<div class="political-periods">
    <h4>Norwegian Governments (1945-2025)</h4>
    <div class="periods-grid">
"""
    
    # Group governments by decade for better organization
    decades = {
        "1940s-1950s": [],
        "1960s": [],
        "1970s": [],
        "1980s": [],
        "1990s": [],
        "2000s": [],
        "2010s-2020s": []
    }
    
    for gov in NORWEGIAN_GOVERNMENTS:
        start_year = int(gov['start_date'].split('-')[0])
        if start_year < 1960:
            decades["1940s-1950s"].append(gov)
        elif start_year < 1970:
            decades["1960s"].append(gov)
        elif start_year < 1980:
            decades["1970s"].append(gov)
        elif start_year < 1990:
            decades["1980s"].append(gov)
        elif start_year < 2000:
            decades["1990s"].append(gov)
        elif start_year < 2010:
            decades["2000s"].append(gov)
        else:
            decades["2010s-2020s"].append(gov)
    
    # Create HTML for each decade
    for decade, governments in decades.items():
        if governments:
            html_content += f'        <div class="decade-section">\n'
            html_content += f'            <h5>{decade}</h5>\n'
            html_content += f'            <div class="governments">\n'
            
            for gov in governments:
                parties_str = ", ".join(gov['parties'])
                html_content += f'                <div class="government">\n'
                html_content += f'                    <span class="period">{gov["period"]}</span>\n'
                html_content += f'                    <span class="pm">{gov["prime_minister"]}</span>\n'
                html_content += f'                    <span class="parties">({parties_str})</span>\n'
                html_content += f'                </div>\n'
            
            html_content += f'            </div>\n'
            html_content += f'        </div>\n'
    
    html_content += """    </div>
</div>"""
    
    # Save HTML file
    html_file = Path("docs/reports/political_periods.html")
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✅ Political periods HTML saved to: {html_file}")
    
    # Create CSS for styling
    css_content = """
/* Political Periods Styling */
.political-periods {
    font-size: 0.85em;
    line-height: 1.4;
    margin: 20px 0;
}

.political-periods h4 {
    margin: 0 0 15px 0;
    color: #333;
    font-size: 1.1em;
}

.periods-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

.decade-section h5 {
    margin: 0 0 10px 0;
    color: #666;
    font-size: 0.9em;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.governments {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.government {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 4px 0;
    border-bottom: 1px solid #eee;
}

.government:last-child {
    border-bottom: none;
}

.period {
    font-weight: 600;
    color: #333;
    min-width: 80px;
}

.pm {
    color: #555;
    font-style: italic;
}

.parties {
    color: #777;
    font-size: 0.9em;
}

/* Responsive design */
@media (max-width: 768px) {
    .periods-grid {
        grid-template-columns: 1fr;
    }
    
    .government {
        flex-direction: column;
        gap: 2px;
    }
    
    .period {
        min-width: auto;
    }
}
"""
    
    css_file = Path("docs/reports/political_periods.css")
    with open(css_file, 'w', encoding='utf-8') as f:
        f.write(css_content)
    
    print(f"✅ Political periods CSS saved to: {css_file}")
    
    return html_content, css_content

def main():
    """Main function"""
    
    print("🏛️  POLITICAL PERIODS ANALYSIS")
    print("=" * 80)
    
    # Analyze political coverage
    political_summary = analyze_political_coverage()
    
    # Create HTML and CSS for footer
    html_content, css_content = create_political_periods_html()
    
    print("\n🎉 POLITICAL PERIODS ANALYSIS COMPLETE!")
    print("=" * 80)
    print(f"✅ Analyzed {political_summary['total_charts_1945_onwards']} charts with data from 1945 onwards")
    print(f"✅ Created political periods HTML and CSS for footer")
    print(f"✅ All files saved to docs/reports/")

if __name__ == "__main__":
    main()
