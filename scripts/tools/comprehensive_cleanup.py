#!/usr/bin/env python3
"""
Comprehensive Chart Cleanup
Removes ALL remaining municipal/county level charts that were missed
"""

import json
import logging
import re
from pathlib import Path

class ComprehensiveCleanup:
    def __init__(self):
        self.removed_charts = []
        self.municipal_keywords = [
            'municipalities', 'municipality', 'counties', 'county', 
            'districts', 'district', 'cities', 'city', 'regions', 'region'
        ]
    
    def cleanup_html(self):
        """Remove ALL municipal/county chart cards from HTML"""
        html_path = Path("index.html")
        if not html_path.exists():
            return
        
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find all chart cards that contain municipal keywords
        chart_cards = []
        start_pattern = r'<div class="chart-card">'
        end_pattern = r'</div>\s*</div>\s*</div>'
        
        # Find all chart card sections
        matches = list(re.finditer(start_pattern, content))
        
        for match in matches:
            start_pos = match.start()
            # Find the end of this chart card
            remaining = content[start_pos:]
            end_match = re.search(end_pattern, remaining)
            if end_match:
                end_pos = start_pos + end_match.end()
                chart_section = content[start_pos:end_pos]
                
                # Check if this chart contains municipal keywords
                if any(keyword in chart_section.lower() for keyword in self.municipal_keywords):
                    chart_cards.append((start_pos, end_pos, chart_section))
        
        # Remove chart cards in reverse order to maintain positions
        chart_cards.reverse()
        for start_pos, end_pos, chart_section in chart_cards:
            # Extract chart name for logging
            name_match = re.search(r'<h3>(.*?)</h3>', chart_section)
            chart_name = name_match.group(1) if name_match else "Unknown"
            
            content = content[:start_pos] + content[end_pos:]
            self.removed_charts.append(f"HTML: {chart_name}")
            logging.info(f"Removed chart card: {chart_name}")
        
        # Write back the cleaned HTML
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(content)
    
    def cleanup_javascript(self):
        """Remove ALL municipal/county chart loading from JavaScript"""
        main_js_path = Path("src/js/main.js")
        if not main_js_path.exists():
            return
        
        with open(main_js_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find and remove all loadChartData calls for municipal charts
        lines = content.split('\n')
        new_lines = []
        
        for line in lines:
            # Check if line contains loadChartData and municipal keywords
            if 'loadChartData(' in line and any(keyword in line.lower() for keyword in self.municipal_keywords):
                # Extract chart name for logging
                name_match = re.search(r"'([^']*?)'", line)
                chart_name = name_match.group(1) if name_match else "Unknown"
                self.removed_charts.append(f"JS: {chart_name}")
                logging.info(f"Removed chart loading: {chart_name}")
            else:
                new_lines.append(line)
        
        content = '\n'.join(new_lines)
        
        # Write back the cleaned JavaScript
        with open(main_js_path, 'w', encoding='utf-8') as f:
            f.write(content)
    
    def cleanup_config(self):
        """Remove municipal chart mappings from config"""
        config_js_path = Path("src/js/config.js")
        if not config_js_path.exists():
            return
        
        with open(config_js_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find and remove municipal chart mappings
        lines = content.split('\n')
        new_lines = []
        
        for line in lines:
            # Check if line contains municipal keywords
            if any(keyword in line.lower() for keyword in self.municipal_keywords):
                # Extract chart name for logging
                name_match = re.search(r"'([^']*?)'", line)
                chart_name = name_match.group(1) if name_match else "Unknown"
                self.removed_charts.append(f"Config: {chart_name}")
                logging.info(f"Removed config mapping: {chart_name}")
            else:
                new_lines.append(line)
        
        content = '\n'.join(new_lines)
        
        # Write back the cleaned config
        with open(config_js_path, 'w', encoding='utf-8') as f:
            f.write(content)
    
    def cleanup_data_files(self):
        """Remove any remaining municipal data files"""
        cache_dir = Path("data/cached")
        if not cache_dir.exists():
            return
        
        # Remove SSB municipal files
        ssb_dir = cache_dir / "ssb"
        if ssb_dir.exists():
            for filepath in ssb_dir.glob("*.json"):
                filename = filepath.name.lower()
                if any(keyword in filename for keyword in self.municipal_keywords):
                    # Keep some exceptions that are actually national
                    exceptions = [
                        "household-income-national",
                        "living-arrangements-national", 
                        "population-basic-districts-national",
                        "new-detached-house-prices-national"
                    ]
                    
                    if not any(exception in filename for exception in exceptions):
                        filepath.unlink()
                        self.removed_charts.append(f"Data: {filepath.name}")
                        logging.info(f"Removed data file: {filepath.name}")
    
    def create_cleanup_report(self):
        """Create a report of all cleanup operations"""
        report = {
            "cleanup_timestamp": str(Path().cwd()),
            "removed_charts": self.removed_charts,
            "summary": {
                "total_removed": len(self.removed_charts)
            }
        }
        
        with open("comprehensive_cleanup_report.json", 'w') as f:
            json.dump(report, f, indent=2)
        
        logging.info(f"Cleanup report saved to comprehensive_cleanup_report.json")
        logging.info(f"Total items removed: {len(self.removed_charts)}")
    
    def run_comprehensive_cleanup(self):
        """Run all cleanup operations"""
        logging.info("Starting comprehensive cleanup...")
        
        # 1. Clean up HTML
        self.cleanup_html()
        
        # 2. Clean up JavaScript
        self.cleanup_javascript()
        
        # 3. Clean up config
        self.cleanup_config()
        
        # 4. Clean up data files
        self.cleanup_data_files()
        
        # 5. Create report
        self.create_cleanup_report()
        
        logging.info("Comprehensive cleanup completed!")

def main():
    """Main cleanup runner"""
    logging.basicConfig(level=logging.INFO)
    
    cleanup = ComprehensiveCleanup()
    cleanup.run_comprehensive_cleanup()

if __name__ == "__main__":
    main()
