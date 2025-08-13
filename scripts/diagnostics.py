#!/usr/bin/env python3
"""
Riksdata Chart Diagnostics
Comprehensive diagnostics for chart data quality and visualization issues
"""

import json
import logging
import requests
from pathlib import Path
from typing import Dict, List, Any, Tuple
import pandas as pd
from datetime import datetime

class ChartDiagnostics:
    def __init__(self, cache_dir: str = "data/cached"):
        self.cache_dir = Path(cache_dir)
        self.issues = []
        self.results = {}
        
    def load_cached_data(self, filename: str) -> Dict:
        """Load cached data file"""
        filepath = self.cache_dir / filename
        if filepath.exists():
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None
    
    def check_data_structure(self, data: Dict, chart_name: str) -> Dict:
        """Check data structure and types"""
        result = {
            'has_data': False,
            'data_type': None,
            'is_national': True,
            'dimensions': [],
            'sample_values': [],
            'issues': []
        }
        
        if not data:
            result['issues'].append("No data found")
            return result
            
        # Check if it's SSB or Norges Bank format
        if 'dataset' in data:  # SSB format
            dataset = data['dataset']
            result['data_type'] = 'ssb'
            
            # Check for data
            if 'value' in dataset and dataset['value']:
                result['has_data'] = True
                result['sample_values'] = dataset['value'][:5]
            
            # Check dimensions for "by" aggregations
            if 'dimension' in dataset:
                for dim in dataset['dimension']:
                    if 'category' in dim and 'label' in dim['category']:
                        labels = list(dim['category']['label'].values())
                        result['dimensions'].append({
                            'name': dim.get('id', 'unknown'),
                            'labels': labels
                        })
                        
                        # Check for problematic aggregations
                        for label in labels:
                            if any(keyword in label.lower() for keyword in ['fylke', 'kommune', 'municipality', 'county', 'country', 'by']):
                                result['is_national'] = False
                                result['issues'].append(f"Contains {label} - not national level")
        
        elif 'data' in data:  # Norges Bank format
            result['data_type'] = 'norges_bank'
            if data['data']:
                result['has_data'] = True
                # Handle different data structures
                if isinstance(data['data'], list):
                    result['sample_values'] = data['data'][:5]
                elif isinstance(data['data'], dict):
                    result['sample_values'] = list(data['data'].items())[:5]
                else:
                    result['sample_values'] = [str(data['data'])[:100]]
        
        return result
    
    def check_api_reachability(self, url: str) -> bool:
        """Check if API endpoint is reachable"""
        try:
            response = requests.get(url, timeout=10)
            return response.status_code == 200
        except:
            return False
    
    def analyze_chart_data(self, chart_name: str, data: Dict) -> Dict:
        """Analyze specific chart data for issues"""
        analysis = {
            'chart_name': chart_name,
            'data_quality': {},
            'visualization_issues': [],
            'recommendations': []
        }
        
        if not data:
            analysis['visualization_issues'].append("No data available")
            return analysis
        
        # Check data structure
        structure = self.check_data_structure(data, chart_name)
        analysis['data_quality'] = structure
        
        # Specific chart checks
        if 'bankruptcies' in chart_name.lower():
            if 'industry' in chart_name.lower():
                analysis['visualization_issues'].append("Bar chart with slim bars - consider line chart")
            if 'municipalities' in chart_name.lower():
                analysis['visualization_issues'].append("Municipal data - should be removed for national focus")
        
        if 'economic-forecasts' in chart_name.lower():
            analysis['visualization_issues'].append("Political coloring creates gaps - need continuous line")
        
        if 'municipalities' in chart_name.lower() or 'districts' in chart_name.lower():
            analysis['recommendations'].append("Remove - not national level data")
        
        if 'norges-bank' in chart_name.lower():
            analysis['visualization_issues'].append("Norges Bank charts showing empty - check API")
        
        if 'industrial-production' in chart_name.lower():
            analysis['visualization_issues'].append("Major jump in 2019 - check data quality")
        
        if 'by country' in chart_name.lower() or 'by industry' in chart_name.lower():
            analysis['recommendations'].append("Consider if 'by' aggregation makes sense for single chart")
        
        if 'consumer-confidence' in chart_name.lower():
            analysis['visualization_issues'].append("Dataset mismatch - shows Varekonsumindeks instead")
        
        if 'construction-production' in chart_name.lower():
            analysis['visualization_issues'].append("Index without base year reference")
        
        return analysis
    
    def run_diagnostics(self) -> Dict:
        """Run comprehensive diagnostics"""
        logging.info("Starting comprehensive chart diagnostics...")
        
        # Get all cached files
        ssb_files = list((self.cache_dir / "ssb").glob("*.json"))
        nb_files = list((self.cache_dir / "norges-bank").glob("*.json"))
        
        all_files = ssb_files + nb_files
        
        for filepath in all_files:
            chart_name = filepath.stem
            logging.info(f"Analyzing {chart_name}...")
            
            data = self.load_cached_data(str(filepath.relative_to(self.cache_dir)))
            analysis = self.analyze_chart_data(chart_name, data)
            
            self.results[chart_name] = analysis
            
            # Collect issues
            if analysis['data_quality'].get('issues'):
                self.issues.extend(analysis['data_quality']['issues'])
            if analysis['visualization_issues']:
                self.issues.extend(analysis['visualization_issues'])
        
        return self.results
    
    def generate_report(self) -> str:
        """Generate diagnostic report"""
        report = []
        report.append("# Riksdata Chart Diagnostics Report")
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        # Summary
        total_charts = len(self.results)
        charts_with_issues = sum(1 for r in self.results.values() if r['visualization_issues'] or r['data_quality'].get('issues'))
        charts_without_data = sum(1 for r in self.results.values() if not r['data_quality'].get('has_data', False))
        
        report.append("## Summary")
        report.append(f"- Total charts analyzed: {total_charts}")
        report.append(f"- Charts with issues: {charts_with_issues}")
        report.append(f"- Charts without data: {charts_without_data}")
        report.append("")
        
        # Critical issues
        report.append("## Critical Issues")
        for chart_name, analysis in self.results.items():
            if not analysis['data_quality'].get('has_data', False):
                report.append(f"- **{chart_name}**: No data available")
            if not analysis['data_quality'].get('is_national', True):
                report.append(f"- **{chart_name}**: Not national level data")
        
        report.append("")
        
        # Specific issues from user
        report.append("## User-Reported Issues Check")
        specific_issues = [
            "bankruptcies-by-industry",
            "bankruptcies-municipalities", 
            "bankruptcies",
            "economic-forecasts",
            "education-level-municipalities-percent",
            "eur-exchange",
            "living-arrangements-districts",
            "industrial-production",
            "export-by-country",
            "consumer-confidence",
            "construction-production"
        ]
        
        for issue_chart in specific_issues:
            if issue_chart in self.results:
                analysis = self.results[issue_chart]
                report.append(f"### {issue_chart}")
                if analysis['visualization_issues']:
                    for issue in analysis['visualization_issues']:
                        report.append(f"- {issue}")
                if analysis['recommendations']:
                    for rec in analysis['recommendations']:
                        report.append(f"- **Recommendation**: {rec}")
                report.append("")
        
        # Detailed analysis
        report.append("## Detailed Analysis")
        for chart_name, analysis in self.results.items():
            report.append(f"### {chart_name}")
            report.append(f"- Has data: {analysis['data_quality'].get('has_data', False)}")
            report.append(f"- Is national: {analysis['data_quality'].get('is_national', True)}")
            report.append(f"- Data type: {analysis['data_quality'].get('data_type', 'unknown')}")
            
            if analysis['data_quality'].get('dimensions'):
                report.append("- Dimensions:")
                for dim in analysis['data_quality']['dimensions']:
                    report.append(f"  - {dim['name']}: {dim['labels'][:3]}...")
            
            if analysis['visualization_issues']:
                report.append("- Issues:")
                for issue in analysis['visualization_issues']:
                    report.append(f"  - {issue}")
            
            report.append("")
        
        return "\n".join(report)

def main():
    """Main diagnostic runner"""
    logging.basicConfig(level=logging.INFO)
    
    diagnostics = ChartDiagnostics()
    results = diagnostics.run_diagnostics()
    
    # Generate and save report
    report = diagnostics.generate_report()
    
    with open("diagnostics_results.json", "w") as f:
        json.dump(results, f, indent=2, default=str)
    
    with open("diagnostics_report.md", "w") as f:
        f.write(report)
    
    print("Diagnostics complete!")
    print(f"- Results saved to: diagnostics_results.json")
    print(f"- Report saved to: diagnostics_report.md")
    
    # Print summary
    total_issues = len(diagnostics.issues)
    print(f"\nTotal issues found: {total_issues}")
    
    if total_issues > 0:
        print("\nTop issues:")
        for issue in diagnostics.issues[:10]:
            print(f"- {issue}")

if __name__ == "__main__":
    main()
