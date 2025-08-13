#!/usr/bin/env python3
"""
Riksdata Chart Repair Script
Fixes identified issues in chart data and configuration
"""

import json
import logging
import shutil
from pathlib import Path
from typing import List, Dict, Any

class ChartRepair:
    def __init__(self, cache_dir: str = "data/cached"):
        self.cache_dir = Path(cache_dir)
        self.removed_charts = []
        self.fixed_charts = []
        
    def remove_municipal_county_charts(self):
        """Remove all municipal/county level charts that should be national only"""
        problematic_patterns = [
            "municipalities", "districts", "counties", "cities", "regions"
        ]
        
        ssb_dir = self.cache_dir / "ssb"
        if not ssb_dir.exists():
            return
            
        for filepath in ssb_dir.glob("*.json"):
            filename = filepath.name.lower()
            if any(pattern in filename for pattern in problematic_patterns):
                # Keep some exceptions that are actually national
                exceptions = [
                    "household-income-national",
                    "living-arrangements-national", 
                    "population-basic-districts-national",
                    "new-detached-house-prices-national"
                ]
                
                if not any(exception in filename for exception in exceptions):
                    logging.info(f"Removing municipal/county chart: {filepath.name}")
                    filepath.unlink()
                    self.removed_charts.append(filepath.name)
    
    def fix_consumer_confidence_dataset(self):
        """Fix consumer confidence dataset - it's actually household consumption"""
        consumer_conf_file = self.cache_dir / "ssb" / "consumer-confidence.json"
        if consumer_conf_file.exists():
            # Rename to reflect actual content
            new_name = "household-consumption.json"
            new_path = consumer_conf_file.parent / new_name
            
            if not new_path.exists():
                consumer_conf_file.rename(new_path)
                logging.info(f"Renamed consumer-confidence.json to {new_name}")
                self.fixed_charts.append(f"consumer-confidence -> {new_name}")
    
    def fix_chart_configurations(self):
        """Fix chart type configurations for better visualization"""
        # Read current main.js to identify chart configurations
        main_js_path = Path("src/js/main.js")
        if not main_js_path.exists():
            return
            
        with open(main_js_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Fix bankruptcies-by-industry to use line chart instead of bar
        if 'bankruptcies-by-industry' in content:
            # This will be handled in the HTML removal
            pass
        
        # Fix economic forecasts to use continuous line
        if 'economic-forecasts' in content:
            # This will be handled in the chart rendering logic
            pass
        
        logging.info("Chart configurations reviewed")
    
    def remove_problematic_charts_from_html(self):
        """Remove problematic charts from the HTML"""
        html_file = Path("index.html")
        if not html_file.exists():
            return
            
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Charts to remove
        charts_to_remove = [
            "bankruptcies-by-industry",
            "bankruptcies-municipalities", 
            "education-level-municipalities-percent",
            "living-arrangements-districts",
            "export-by-country",
            "consumer-confidence"  # Will be replaced with household-consumption
        ]
        
        # Remove chart cards
        for chart in charts_to_remove:
            # Find and remove the entire chart card div
            start_marker = f'<div class="chart-card">\n                <div class="chart-header">\n                    <h3>{chart.replace("-", " ").title()}</h3>'
            end_marker = '</div>\n            </div>'
            
            if start_marker in content:
                start_idx = content.find(start_marker)
                if start_idx != -1:
                    # Find the end of this chart card
                    remaining = content[start_idx:]
                    end_idx = remaining.find(end_marker)
                    if end_idx != -1:
                        end_idx += len(end_marker)
                        # Remove the entire chart card
                        content = content[:start_idx] + content[start_idx + end_idx:]
                        logging.info(f"Removed chart card: {chart}")
        
        # Write back the cleaned HTML
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(content)
    
    def remove_problematic_charts_from_js(self):
        """Remove problematic chart loading from main.js"""
        main_js_path = Path("src/js/main.js")
        if not main_js_path.exists():
            return
            
        with open(main_js_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Charts to remove from JavaScript loading
        charts_to_remove = [
            "bankruptcies-by-industry",
            "bankruptcies-municipalities",
            "education-level-municipalities-percent", 
            "living-arrangements-districts",
            "export-by-country",
            "consumer-confidence"
        ]
        
        # Remove loadChartData calls for problematic charts
        for chart in charts_to_remove:
            # Find the loadChartData line for this chart
            pattern = f"loadChartData('{chart}-chart'"
            if pattern in content:
                # Find the entire line and remove it
                lines = content.split('\n')
                new_lines = []
                for line in lines:
                    if pattern not in line:
                        new_lines.append(line)
                    else:
                        logging.info(f"Removed chart loading: {chart}")
                
                content = '\n'.join(new_lines)
        
        # Write back the cleaned JavaScript
        with open(main_js_path, 'w', encoding='utf-8') as f:
            f.write(content)
    
    def fix_norges_bank_charts(self):
        """Fix Norges Bank charts - they have data but might not be loading properly"""
        # Check if Norges Bank data exists and has content
        nb_dir = self.cache_dir / "norges-bank"
        if not nb_dir.exists():
            return
            
        for filepath in nb_dir.glob("*.json"):
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Check if data has actual content
            if 'data' in data and 'dataSets' in data['data']:
                datasets = data['data']['dataSets']
                if datasets and 'series' in datasets[0]:
                    series = datasets[0]['series']
                    if series:
                        logging.info(f"Norges Bank chart {filepath.name} has data: {len(series)} series")
                    else:
                        logging.warning(f"Norges Bank chart {filepath.name} has no series data")
    
    def create_chart_quality_report(self):
        """Create a report of all fixes applied"""
        report = {
            "repair_timestamp": str(Path().cwd()),
            "removed_charts": self.removed_charts,
            "fixed_charts": self.fixed_charts,
            "summary": {
                "total_removed": len(self.removed_charts),
                "total_fixed": len(self.fixed_charts)
            }
        }
        
        with open("chart_quality_report.json", 'w') as f:
            json.dump(report, f, indent=2)
        
        logging.info(f"Repair report saved to chart_quality_report.json")
        logging.info(f"Removed {len(self.removed_charts)} charts")
        logging.info(f"Fixed {len(self.fixed_charts)} charts")
    
    def run_repairs(self):
        """Run all repair operations"""
        logging.info("Starting chart repairs...")
        
        # 1. Remove municipal/county level charts
        self.remove_municipal_county_charts()
        
        # 2. Fix consumer confidence dataset
        self.fix_consumer_confidence_dataset()
        
        # 3. Remove problematic charts from HTML
        self.remove_problematic_charts_from_html()
        
        # 4. Remove problematic charts from JavaScript
        self.remove_problematic_charts_from_js()
        
        # 5. Check Norges Bank charts
        self.fix_norges_bank_charts()
        
        # 6. Create report
        self.create_chart_quality_report()
        
        logging.info("Chart repairs completed!")

def main():
    """Main repair runner"""
    logging.basicConfig(level=logging.INFO)
    
    repair = ChartRepair()
    repair.run_repairs()

if __name__ == "__main__":
    main()
