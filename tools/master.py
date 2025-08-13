#!/usr/bin/env python3
"""
Riksdata Master Script
Orchestrates diagnostics, repair, and expansion operations
"""

import asyncio
import logging
import argparse
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict

# Add the scripts directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from diagnostics import RiksdataDiagnostics
from repair import RiksdataRepair
from expand import RiksdataExpander

class RiksdataMaster:
    def __init__(self, cache_dir: str = 'data/cached'):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler(sys.stdout),
                logging.FileHandler('master.log')
            ]
        )
        self.logger = logging.getLogger(__name__)
        
        # Initialize components
        self.diagnostics = RiksdataDiagnostics(cache_dir)
        self.repair = RiksdataRepair(cache_dir)
        self.expander = RiksdataExpander(cache_dir)
        
        # Master results
        self.master_results = {
            'timestamp': datetime.now().isoformat(),
            'diagnostics': {},
            'repair': {},
            'expansion': {},
            'summary': {
                'total_operations': 0,
                'successful': 0,
                'failed': 0,
                'warnings': 0
            }
        }

    async def run_full_workflow(self, expansion_file: str = None) -> Dict:
        """Run complete workflow: diagnostics -> repair -> expansion"""
        self.logger.info("🚀 Starting Riksdata Master Workflow")
        
        # Step 1: Run diagnostics
        self.logger.info("=" * 60)
        self.logger.info("STEP 1: DIAGNOSTICS")
        self.logger.info("=" * 60)
        
        diagnostic_results = await self.diagnostics.run_full_diagnostics()
        self.master_results['diagnostics'] = diagnostic_results
        
        # Check if we need to proceed with repair
        needs_repair = (
            diagnostic_results.get('missing_data') or 
            diagnostic_results.get('corrupted_data') or
            any(r.get('status') == 'error' for r in diagnostic_results.get('api_connectivity', {}).values())
        )
        
        if needs_repair:
            # Step 2: Run repair
            self.logger.info("=" * 60)
            self.logger.info("STEP 2: REPAIR")
            self.logger.info("=" * 60)
            
            repair_results = await self.repair.run_full_repair('diagnostics_results.json')
            self.master_results['repair'] = repair_results
            
            # Step 3: Re-run diagnostics to verify repair
            self.logger.info("=" * 60)
            self.logger.info("STEP 3: POST-REPAIR DIAGNOSTICS")
            self.logger.info("=" * 60)
            
            post_repair_diagnostics = await self.diagnostics.run_full_diagnostics()
            self.master_results['diagnostics']['post_repair'] = post_repair_diagnostics
        else:
            self.logger.info("✅ No repair needed - data is healthy!")
        
        # Step 4: Run expansion if requested
        if expansion_file:
            self.logger.info("=" * 60)
            self.logger.info("STEP 4: EXPANSION")
            self.logger.info("=" * 60)
            
            expansion_results = await self.expander.run_expansion_from_file(expansion_file)
            self.master_results['expansion'] = expansion_results
        
        # Generate master report
        self._generate_master_report()
        
        return self.master_results

    async def run_diagnostics_only(self) -> Dict:
        """Run only diagnostics"""
        self.logger.info("🔍 Running diagnostics only...")
        
        diagnostic_results = await self.diagnostics.run_full_diagnostics()
        self.master_results['diagnostics'] = diagnostic_results
        
        return self.master_results

    async def run_repair_only(self) -> Dict:
        """Run only repair"""
        self.logger.info("🔧 Running repair only...")
        
        repair_results = await self.repair.run_full_repair('diagnostics_results.json')
        self.master_results['repair'] = repair_results
        
        return self.master_results

    async def run_expansion_only(self, expansion_file: str) -> Dict:
        """Run only expansion"""
        self.logger.info("📈 Running expansion only...")
        
        expansion_results = await self.expander.run_expansion_from_file(expansion_file)
        self.master_results['expansion'] = expansion_results
        
        return self.master_results

    def _generate_master_report(self):
        """Generate comprehensive master report"""
        report = []
        report.append("=" * 80)
        report.append("RIKSDATA MASTER WORKFLOW REPORT")
        report.append("=" * 80)
        report.append(f"Generated: {self.master_results['timestamp']}")
        report.append("")
        
        # Overall summary
        report.append("📊 OVERALL SUMMARY")
        report.append("-" * 40)
        
        diagnostics = self.master_results.get('diagnostics', {})
        repair = self.master_results.get('repair', {})
        expansion = self.master_results.get('expansion', {})
        
        # API connectivity
        api_results = diagnostics.get('api_connectivity', {})
        api_success = sum(1 for r in api_results.values() if r.get('status') == 'success')
        api_total = len(api_results)
        report.append(f"API Connectivity: {api_success}/{api_total} successful")
        
        # Cache status
        cache_summary = diagnostics.get('cache_status', {}).get('summary', {})
        if cache_summary:
            report.append(f"Cache Files: {cache_summary.get('valid_files', 0)}/{cache_summary.get('total_files', 0)} valid")
            report.append(f"Cache Size: {cache_summary.get('total_size_mb', 0):.2f} MB")
        
        # Missing data
        missing_data = diagnostics.get('missing_data', [])
        report.append(f"Missing Data: {len(missing_data)} files")
        
        # Corrupted data
        corrupted_data = diagnostics.get('corrupted_data', [])
        report.append(f"Corrupted Data: {len(corrupted_data)} files")
        
        # Repair results
        if repair:
            repair_summary = repair.get('summary', {})
            report.append(f"Repair Attempted: {repair_summary.get('total_attempted', 0)}")
            report.append(f"Repair Successful: {repair_summary.get('successful', 0)}")
            report.append(f"Repair Failed: {repair_summary.get('failed', 0)}")
        
        # Expansion results
        if expansion:
            expansion_summary = expansion.get('summary', {})
            report.append(f"New Sources: {expansion_summary.get('sources_added', 0)}")
            report.append(f"New Datasets: {expansion_summary.get('datasets_added', 0)}")
            report.append(f"Expansion Failed: {expansion_summary.get('failed', 0)}")
        
        report.append("")
        
        # Recommendations
        report.append("💡 RECOMMENDATIONS")
        report.append("-" * 40)
        
        recommendations = []
        
        # Check API connectivity
        if api_total > 0 and api_success < api_total:
            recommendations.append(f"Fix {api_total - api_success} API connectivity issues")
        
        # Check missing data
        if missing_data:
            recommendations.append(f"Fetch {len(missing_data)} missing datasets")
        
        # Check corrupted data
        if corrupted_data:
            recommendations.append(f"Re-fetch {len(corrupted_data)} corrupted files")
        
        # Check data quality
        quality_score = diagnostics.get('data_quality', {}).get('overall_score', 0)
        if quality_score < 90:
            recommendations.append(f"Improve data quality (current score: {quality_score}%)")
        
        # Check repair success
        if repair and repair.get('summary', {}).get('failed', 0) > 0:
            recommendations.append("Investigate failed repairs")
        
        # Check expansion success
        if expansion and expansion.get('summary', {}).get('failed', 0) > 0:
            recommendations.append("Investigate failed expansions")
        
        if not recommendations:
            recommendations.append("All systems operational - data is healthy!")
        
        for rec in recommendations:
            report.append(f"• {rec}")
        
        report.append("")
        
        # Next steps
        report.append("🔄 NEXT STEPS")
        report.append("-" * 40)
        
        if missing_data or corrupted_data:
            report.append("• Run repair to fix data issues")
        
        if expansion:
            report.append("• Test new datasets in the web interface")
            report.append("• Update documentation with new data sources")
        
        report.append("• Run regular diagnostics to monitor data health")
        report.append("• Consider adding more data sources for comprehensive coverage")
        
        report.append("")
        report.append("=" * 80)
        
        # Print and save report
        master_report = "\n".join(report)
        print(master_report)
        
        # Save detailed results
        results_file = Path('master_results.json')
        with open(results_file, 'w', encoding='utf-8') as f:
            import json
            json.dump(self.master_results, f, indent=2, default=str)
        
        self.logger.info(f"📊 Detailed master results saved to: {results_file}")

    def create_sample_expansion_config(self) -> str:
        """Create a sample expansion configuration file"""
        sample_config = {
            "sources": [
                {
                    "name": "example-api",
                    "base_url": "https://api.example.com",
                    "description": "Example API for demonstration"
                }
            ],
            "datasets": [
                {
                    "type": "ssb",
                    "dataset_id": "12345",
                    "cache_name": "example-ssb",
                    "title": "Example SSB Dataset",
                    "description": "An example SSB dataset",
                    "chart_type": "line"
                },
                {
                    "type": "norges_bank",
                    "api_path": "EXAMPLE/M.DATA.SP?format=sdmx-json&startPeriod=2020-01-01&endPeriod=2024-12-31&locale=no",
                    "cache_name": "example-nb",
                    "title": "Example Norges Bank Dataset",
                    "description": "An example Norges Bank dataset",
                    "chart_type": "line"
                },
                {
                    "type": "static",
                    "cache_name": "example-static",
                    "title": "Example Static Dataset",
                    "description": "An example static dataset",
                    "chart_type": "bar",
                    "data": {
                        "name": "Example Data",
                        "data": [
                            {"date": "2020-01-01", "value": 100},
                            {"date": "2021-01-01", "value": 120},
                            {"date": "2022-01-01", "value": 110},
                            {"date": "2023-01-01", "value": 130},
                            {"date": "2024-01-01", "value": 140}
                        ],
                        "currency": "NOK",
                        "source": "Example Source",
                        "last_updated": "2024-01-01T00:00:00"
                    }
                }
            ]
        }
        
        config_file = Path('sample_expansion_config.json')
        with open(config_file, 'w', encoding='utf-8') as f:
            import json
            json.dump(sample_config, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"📝 Sample expansion config created: {config_file}")
        return str(config_file)

async def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='Riksdata Master Workflow')
    parser.add_argument('--cache-dir', default='data/cached', 
                       help='Cache directory (default: data/cached)')
    parser.add_argument('--mode', choices=['full', 'diagnostics', 'repair', 'expansion'],
                       default='full', help='Workflow mode (default: full)')
    parser.add_argument('--expansion-file', help='Expansion configuration file (JSON)')
    parser.add_argument('--create-sample-config', action='store_true',
                       help='Create a sample expansion configuration file')
    
    args = parser.parse_args()
    
    master = RiksdataMaster(args.cache_dir)
    
    if args.create_sample_config:
        master.create_sample_expansion_config()
        return
    
    try:
        if args.mode == 'full':
            results = await master.run_full_workflow(args.expansion_file)
        elif args.mode == 'diagnostics':
            results = await master.run_diagnostics_only()
        elif args.mode == 'repair':
            results = await master.run_repair_only()
        elif args.mode == 'expansion':
            if not args.expansion_file:
                print("Error: --expansion-file is required for expansion mode")
                sys.exit(1)
            results = await master.run_expansion_only(args.expansion_file)
        
        # Exit with error code if there are issues
        diagnostics = results.get('diagnostics', {})
        repair = results.get('repair', {})
        expansion = results.get('expansion', {})
        
        has_issues = (
            diagnostics.get('missing_data') or
            diagnostics.get('corrupted_data') or
            any(r.get('status') == 'error' for r in diagnostics.get('api_connectivity', {}).values()) or
            repair.get('summary', {}).get('failed', 0) > 0 or
            expansion.get('summary', {}).get('failed', 0) > 0
        )
        
        if has_issues:
            sys.exit(1)
        else:
            sys.exit(0)
            
    except Exception as e:
        logging.error(f"Master workflow failed: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    asyncio.run(main())
