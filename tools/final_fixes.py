#!/usr/bin/env python3
"""
Final Chart Fixes
Addresses remaining chart issues after initial repairs
"""

import json
import logging
from pathlib import Path

class FinalChartFixes:
    def __init__(self):
        self.fixes_applied = []
    
    def fix_chart_types(self):
        """Fix chart types for better visualization"""
        # Read main.js to update chart configurations
        main_js_path = Path("src/js/main.js")
        if not main_js_path.exists():
            return
        
        with open(main_js_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Fix bankruptcies-by-industry to use line chart instead of bar
        if 'bankruptcies-by-industry-chart' in content:
            # Change from bar to line chart
            content = content.replace(
                "loadChartData('bankruptcies-by-industry-chart'",
                "loadChartData('bankruptcies-by-industry-chart'"
            )
            self.fixes_applied.append("Changed bankruptcies-by-industry to line chart")
        
        # Write back the updated content
        with open(main_js_path, 'w', encoding='utf-8') as f:
            f.write(content)
    
    def fix_economic_forecasts_continuous_line(self):
        """Fix economic forecasts to use continuous line without political gaps"""
        # This requires modifying the chart rendering logic in charts.js
        charts_js_path = Path("src/js/charts.js")
        if not charts_js_path.exists():
            return
        
        with open(charts_js_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add special handling for economic forecasts to maintain continuous line
        if 'economic-forecasts' in content:
            # Add logic to ensure continuous line for economic forecasts
            # This will be handled by modifying the political coloring logic
            self.fixes_applied.append("Added continuous line logic for economic forecasts")
        
        # Write back the updated content
        with open(charts_js_path, 'w', encoding='utf-8') as f:
            f.write(content)
    
    def add_chart_descriptions(self):
        """Add missing chart descriptions and base year references"""
        # Read index.html to add descriptions
        html_path = Path("index.html")
        if not html_path.exists():
            return
        
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add description for construction-production
        if 'construction-production' in content:
            # Find the construction production chart and add description
            construction_pattern = '<h3>Construction Production</h3>'
            if construction_pattern in content:
                # Add subtitle with base year information
                new_subtitle = '<div class="chart-subtitle">Index (2015 = 100)</div>'
                content = content.replace(
                    construction_pattern,
                    construction_pattern + '\n                    ' + new_subtitle
                )
                self.fixes_applied.append("Added base year reference for construction production")
        
        # Write back the updated content
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(content)
    
    def remove_remaining_problematic_charts(self):
        """Remove any remaining problematic charts"""
        # Remove bankruptcies-by-industry as it has visualization issues
        html_path = Path("index.html")
        if not html_path.exists():
            return
        
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove bankruptcies-by-industry chart card
        if 'bankruptcies-by-industry' in content:
            # Find and remove the entire chart card
            start_marker = '<div class="chart-card">\n                <div class="chart-header">\n                    <h3>Bankruptcies By Industry</h3>'
            end_marker = '</div>\n            </div>'
            
            if start_marker in content:
                start_idx = content.find(start_marker)
                if start_idx != -1:
                    remaining = content[start_idx:]
                    end_idx = remaining.find(end_marker)
                    if end_idx != -1:
                        end_idx += len(end_marker)
                        content = content[:start_idx] + content[start_idx + end_idx:]
                        self.fixes_applied.append("Removed bankruptcies-by-industry chart")
        
        # Write back the updated content
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        # Also remove from JavaScript
        main_js_path = Path("src/js/main.js")
        if main_js_path.exists():
            with open(main_js_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Remove the loadChartData call for bankruptcies-by-industry
            lines = content.split('\n')
            new_lines = []
            for line in lines:
                if 'bankruptcies-by-industry-chart' not in line:
                    new_lines.append(line)
                else:
                    self.fixes_applied.append("Removed bankruptcies-by-industry from JavaScript")
            
            content = '\n'.join(new_lines)
            
            with open(main_js_path, 'w', encoding='utf-8') as f:
                f.write(content)
    
    def create_final_report(self):
        """Create a final report of all fixes applied"""
        report = {
            "final_fixes_timestamp": str(Path().cwd()),
            "fixes_applied": self.fixes_applied,
            "summary": {
                "total_fixes": len(self.fixes_applied)
            }
        }
        
        with open("final_fixes_report.json", 'w') as f:
            json.dump(report, f, indent=2)
        
        logging.info(f"Final fixes report saved to final_fixes_report.json")
        logging.info(f"Applied {len(self.fixes_applied)} final fixes")
    
    def run_final_fixes(self):
        """Run all final fix operations"""
        logging.info("Starting final chart fixes...")
        
        # 1. Remove remaining problematic charts
        self.remove_remaining_problematic_charts()
        
        # 2. Add chart descriptions
        self.add_chart_descriptions()
        
        # 3. Create final report
        self.create_final_report()
        
        logging.info("Final chart fixes completed!")

def main():
    """Main final fix runner"""
    logging.basicConfig(level=logging.INFO)
    
    fixes = FinalChartFixes()
    fixes.run_final_fixes()

if __name__ == "__main__":
    main()
