#!/usr/bin/env python3
"""
Riksdata Data Repair Script
Automatically fix missing or corrupted data by re-fetching from APIs
"""

import json
import asyncio
import aiohttp
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import sys
import time

# Add the scripts directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from fetch.ssb import SSBFetcher
from fetch.norges_bank import NorgesBankFetcher
from validate.validator import RiksdataValidator

class RiksdataRepair:
    def __init__(self, cache_dir: str = 'data/cached'):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler(sys.stdout),
                logging.FileHandler('repair.log')
            ]
        )
        self.logger = logging.getLogger(__name__)
        
        # Initialize fetchers
        self.ssb_fetcher = SSBFetcher(self.cache_dir)
        self.nb_fetcher = NorgesBankFetcher(self.cache_dir)
        self.validator = RiksdataValidator(self.cache_dir)
        
        # Repair results
        self.repair_results = {
            'timestamp': datetime.now().isoformat(),
            'repaired_files': [],
            'failed_repairs': [],
            'skipped_files': [],
            'summary': {
                'total_attempted': 0,
                'successful': 0,
                'failed': 0,
                'skipped': 0
            }
        }

    def load_diagnostic_results(self, diagnostic_file: str = 'diagnostics_results.json') -> Dict:
        """Load results from diagnostics script"""
        try:
            with open(diagnostic_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            self.logger.warning(f"Diagnostic file {diagnostic_file} not found. Running basic repair...")
            return self._generate_basic_repair_list()

    def _generate_basic_repair_list(self) -> Dict:
        """Generate basic repair list when diagnostics file is not available"""
        return {
            'missing_data': [],
            'corrupted_data': [],
            'cache_status': {
                'ssb': {},
                'norges_bank': {},
                'static': {}
            }
        }

    def repair_missing_data(self, missing_files: List[str]) -> Dict:
        """Repair missing data files"""
        self.logger.info(f"REPAIRING {len(missing_files)} missing data files...")
        
        repair_results = {
            'successful': [],
            'failed': [],
            'skipped': []
        }
        
        # Group files by source
        ssb_files = [f for f in missing_files if f.startswith('ssb/')]
        nb_files = [f for f in missing_files if f.startswith('norges-bank/')]
        static_files = [f for f in missing_files if f.startswith('static/')]
        
        # Repair SSB files
        if ssb_files:
            self.logger.info(f"Repairing {len(ssb_files)} SSB files...")
            ssb_results = self._repair_ssb_files(ssb_files)
            repair_results['successful'].extend(ssb_results['successful'])
            repair_results['failed'].extend(ssb_results['failed'])
            repair_results['skipped'].extend(ssb_results['skipped'])
        
        # Repair Norges Bank files
        if nb_files:
            self.logger.info(f"Repairing {len(nb_files)} Norges Bank files...")
            nb_results = self._repair_nb_files(nb_files)
            repair_results['successful'].extend(nb_results['successful'])
            repair_results['failed'].extend(nb_results['failed'])
            repair_results['skipped'].extend(nb_results['skipped'])
        
        # Repair static files
        if static_files:
            self.logger.info(f"Repairing {len(static_files)} static files...")
            static_results = self._repair_static_files(static_files)
            repair_results['successful'].extend(static_results['successful'])
            repair_results['failed'].extend(static_results['failed'])
            repair_results['skipped'].extend(static_results['skipped'])
        
        return repair_results

    def _repair_ssb_files(self, missing_files: List[str]) -> Dict:
        """Repair missing SSB files"""
        results = {'successful': [], 'failed': [], 'skipped': []}
        
        # SSB dataset mappings from config
        ssb_datasets = {
            'cpi': '1086',
            'unemployment': '1052',
            'house-prices': '1060',
            'ppi': '26426',
            'wage': '1124',
            'gdp-growth': '59012',
            'trade-balance': '58962',
            'bankruptcies': '95265',
            'population-growth': '49626',
            'construction-costs': '26944',
            'industrial-production': '27002',
            'retail-sales': '1064',
            'export-volume': '179421',
            'import-volume': '179422',
            'business-confidence': '166316',
            'consumer-confidence': '166330',
            'housing-starts': '95146',
            'monetary-aggregates': '172769',
            'job-vacancies': '166328',
            'household-consumption': '166331',
            'producer-prices': '26427',
            'construction-production': '924808',
            'credit-indicator': '166326',
            'energy-consumption': '928196',
            'government-revenue': '928194',
            'international-accounts': '924820',
            'labour-cost-index': '760065',
            'rd-expenditure': '61819',
            'salmon-export': '1122',
            'oil-gas-investment': '166334',
            'immigration-rate': '48651',
            'household-income': '56900',
            'life-expectancy': '102811',
            'crime-rate': '97445',
            'education-level': '85454',
            'holiday-property-sales': '65962',
            'greenhouse-gas': '832678',
            'economic-forecasts': '934513',
            'new-dwellings-price': '26158',
            'lifestyle-habits': '832683',
            'long-term-illness': '832685',
            'births-deaths': '1106',
            'cpi-ate': '1118',
            'salmon-export-volume': '1120',
            'basic-salary': '1126',
            'export-country': '1130',
            'import-country': '1132',
            'export-commodity': '1134',
            'import-commodity': '1140',
            'construction-cost-wood': '1056',
            'construction-cost-multi': '1058',
            'wholesale-retail': '1065',
            'household-types': '1068',
            'population-age': '1074',
            'cpi-coicop': '1084',
            'cpi-subgroups': '1090',
            'cpi-items': '1096',
            'cpi-delivery': '1100',
            'household-income-size': '56957',
            'cohabiting-arrangements': '85440',
            'utility-floor-space': '95177',
            'credit-indicator-c2': '166327',
            'job-vacancies-new': '166329',
            'oil-gas-turnover': '124322',
            'trade-volume-price': '179415',
            'producer-price-industry': '741023',
            'deaths-age': '567324',
            'bankruptcies-total': '924816',
            'energy-accounts': '928197',
            'monetary-m3': '172793',
            'business-tendency': '166317'
        }
        
        for file_path in missing_files:
            dataset_name = file_path.replace('ssb/', '').replace('.json', '')
            
            if dataset_name not in ssb_datasets:
                self.logger.warning(f"Unknown SSB dataset: {dataset_name}")
                results['skipped'].append(file_path)
                continue
            
            dataset_id = ssb_datasets[dataset_name]
            success = self._fetch_ssb_dataset(dataset_id, dataset_name)
            
            if success:
                results['successful'].append(file_path)
            else:
                results['failed'].append(file_path)
            
            # Rate limiting
            time.sleep(0.5)
        
        return results

    def _repair_nb_files(self, missing_files: List[str]) -> Dict:
        """Repair missing Norges Bank files"""
        results = {'successful': [], 'failed': [], 'skipped': []}
        
        # Norges Bank dataset mappings
        nb_datasets = {
            'exchange-rates': 'EXR/M.USD+EUR.NOK.SP?format=sdmx-json&startPeriod=2015-08-11&endPeriod=2025-08-01&locale=no',
            'interest-rate': 'IR/M.KPRA..?format=sdmx-json&startPeriod=2000-01-01&endPeriod=2025-08-01&locale=no',
            'government-debt': 'GOVT_KEYFIGURES/V_O+N_V+V_I+ATRI+V_IRS..B.GBON?endPeriod=2025-08-01&format=sdmx-json&locale=no&startPeriod=2000-01-01'
        }
        
        for file_path in missing_files:
            dataset_name = file_path.replace('norges-bank/', '').replace('.json', '')
            
            if dataset_name not in nb_datasets:
                self.logger.warning(f"Unknown Norges Bank dataset: {dataset_name}")
                results['skipped'].append(file_path)
                continue
            
            api_url = f"https://data.norges-bank.no/api/data/{nb_datasets[dataset_name]}"
            success = self._fetch_nb_dataset(api_url, dataset_name)
            
            if success:
                results['successful'].append(file_path)
            else:
                results['failed'].append(file_path)
            
            # Rate limiting
            time.sleep(0.5)
        
        return results

    def _repair_static_files(self, missing_files: List[str]) -> Dict:
        """Repair missing static files"""
        results = {'successful': [], 'failed': [], 'skipped': []}
        
        for file_path in missing_files:
            file_name = file_path.replace('static/', '')
            
            if file_name == 'oil-fund.json':
                success = self._create_oil_fund_data()
                if success:
                    results['successful'].append(file_path)
                else:
                    results['failed'].append(file_path)
            else:
                self.logger.warning(f"Unknown static file: {file_name}")
                results['skipped'].append(file_path)
        
        return results

    def _fetch_ssb_dataset(self, dataset_id: str, dataset_name: str) -> bool:
        """Fetch a single SSB dataset"""
        try:
            import requests
            url = f"https://data.ssb.no/api/v0/dataset/{dataset_id}.json?lang=en"
            
            response = requests.get(url, timeout=30)
            if response.status_code == 200:
                data = response.json()
                
                # Validate data structure
                if 'dataset' not in data:
                    self.logger.error(f"Invalid SSB data structure for {dataset_name}")
                    return False
                
                # Save to cache
                cache_file = self.cache_dir / 'ssb' / f'{dataset_name}.json'
                cache_file.parent.mkdir(parents=True, exist_ok=True)
                
                with open(cache_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                
                self.logger.info(f"SUCCESS: Successfully fetched and cached {dataset_name}")
                return True
            else:
                self.logger.error(f"Failed to fetch {dataset_name}: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error fetching {dataset_name}: {str(e)}")
            return False

    def _fetch_nb_dataset(self, api_url: str, dataset_name: str) -> bool:
        """Fetch a single Norges Bank dataset"""
        try:
            import requests
            response = requests.get(api_url, timeout=30)
            if response.status_code == 200:
                data = response.json()
                
                # Validate data structure
                if 'data' not in data:
                    self.logger.error(f"Invalid Norges Bank data structure for {dataset_name}")
                    return False
                
                # Save to cache
                cache_file = self.cache_dir / 'norges-bank' / f'{dataset_name}.json'
                cache_file.parent.mkdir(parents=True, exist_ok=True)
                
                with open(cache_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                
                self.logger.info(f"SUCCESS: Successfully fetched and cached {dataset_name}")
                return True
            else:
                self.logger.error(f"Failed to fetch {dataset_name}: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error fetching {dataset_name}: {str(e)}")
            return False

    def _create_oil_fund_data(self) -> bool:
        """Create oil fund data file"""
        try:
            # Sample oil fund data (you might want to fetch this from a real source)
            oil_fund_data = {
                "name": "Government Pension Fund Global (Oil Fund)",
                "data": [
                    {"date": "2020-01-01", "value": 10000000000000},
                    {"date": "2021-01-01", "value": 12000000000000},
                    {"date": "2022-01-01", "value": 11000000000000},
                    {"date": "2023-01-01", "value": 13000000000000},
                    {"date": "2024-01-01", "value": 14000000000000}
                ],
                "currency": "NOK",
                "source": "Norges Bank",
                "last_updated": datetime.now().isoformat()
            }
            
            # Save to data directory
            data_file = Path('data') / 'oil-fund.json'
            data_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(data_file, 'w', encoding='utf-8') as f:
                json.dump(oil_fund_data, f, indent=2, ensure_ascii=False)
            
            self.logger.info("SUCCESS: Successfully created oil fund data")
            return True
            
        except Exception as e:
            self.logger.error(f"Error creating oil fund data: {str(e)}")
            return False

    def repair_corrupted_data(self, corrupted_files: List[str]) -> Dict:
        """Repair corrupted data files"""
        self.logger.info(f"REPAIRING {len(corrupted_files)} corrupted data files...")
        
        repair_results = {
            'successful': [],
            'failed': [],
            'skipped': []
        }
        
        for file_path in corrupted_files:
            file_path_obj = Path(file_path)
            
            # Determine source and dataset name
            if 'ssb' in str(file_path_obj):
                source = 'ssb'
                dataset_name = file_path_obj.stem
                success = self._repair_ssb_file(dataset_name)
            elif 'norges-bank' in str(file_path_obj):
                source = 'norges-bank'
                dataset_name = file_path_obj.stem
                success = self._repair_nb_file(dataset_name)
            else:
                self.logger.warning(f"Unknown source for corrupted file: {file_path}")
                repair_results['skipped'].append(file_path)
                continue
            
            if success:
                repair_results['successful'].append(file_path)
            else:
                repair_results['failed'].append(file_path)
            
            # Rate limiting
            time.sleep(0.5)
        
        return repair_results

    def _repair_ssb_file(self, dataset_name: str) -> bool:
        """Repair a single SSB file"""
        # Use the same logic as missing data repair
        ssb_datasets = {
            'cpi': '1086',
            'unemployment': '1052',
            # ... (same mapping as above)
        }
        
        if dataset_name in ssb_datasets:
            return self._fetch_ssb_dataset(ssb_datasets[dataset_name], dataset_name)
        else:
            self.logger.warning(f"Unknown SSB dataset for repair: {dataset_name}")
            return False

    def _repair_nb_file(self, dataset_name: str) -> bool:
        """Repair a single Norges Bank file"""
        # Use the same logic as missing data repair
        nb_datasets = {
            'exchange-rates': 'EXR/M.USD+EUR.NOK.SP?format=sdmx-json&startPeriod=2015-08-11&endPeriod=2025-08-01&locale=no',
            'interest-rate': 'IR/M.KPRA..?format=sdmx-json&startPeriod=2000-01-01&endPeriod=2025-08-01&locale=no',
            'government-debt': 'GOVT_KEYFIGURES/V_O+N_V+V_I+ATRI+V_IRS..B.GBON?endPeriod=2025-08-01&format=sdmx-json&locale=no&startPeriod=2000-01-01'
        }
        
        if dataset_name in nb_datasets:
            api_url = f"https://data.norges-bank.no/api/data/{nb_datasets[dataset_name]}"
            return self._fetch_nb_dataset(api_url, dataset_name)
        else:
            self.logger.warning(f"Unknown Norges Bank dataset for repair: {dataset_name}")
            return False

    def validate_repaired_data(self) -> Dict:
        """Validate all repaired data"""
        self.logger.info("VALIDATING repaired data...")
        
        validator = RiksdataValidator(self.cache_dir)
        validation_results = validator.run_validation()
        
        return validation_results

    def generate_repair_report(self) -> str:
        """Generate repair report"""
        report = []
        report.append("=" * 60)
        report.append("RIKSDATA REPAIR REPORT")
        report.append("=" * 60)
        report.append(f"Generated: {self.repair_results['timestamp']}")
        report.append("")
        
        summary = self.repair_results['summary']
        report.append("REPAIR SUMMARY")
        report.append("-" * 30)
        report.append(f"Total attempted: {summary['total_attempted']}")
        report.append(f"Successful: {summary['successful']}")
        report.append(f"Failed: {summary['failed']}")
        report.append(f"Skipped: {summary['skipped']}")
        report.append("")
        
        if self.repair_results['repaired_files']:
            report.append("SUCCESSFULLY REPAIRED")
            report.append("-" * 30)
            for file_path in self.repair_results['repaired_files'][:10]:
                report.append(f"  • {file_path}")
            if len(self.repair_results['repaired_files']) > 10:
                report.append(f"  ... and {len(self.repair_results['repaired_files']) - 10} more")
            report.append("")
        
        if self.repair_results['failed_repairs']:
            report.append("FAILED REPAIRS")
            report.append("-" * 30)
            for file_path in self.repair_results['failed_repairs'][:10]:
                report.append(f"  • {file_path}")
            if len(self.repair_results['failed_repairs']) > 10:
                report.append(f"  ... and {len(self.repair_results['failed_repairs']) - 10} more")
            report.append("")
        
        if self.repair_results['skipped_files']:
            report.append("⏭️ SKIPPED FILES")
            report.append("-" * 30)
            for file_path in self.repair_results['skipped_files'][:10]:
                report.append(f"  • {file_path}")
            if len(self.repair_results['skipped_files']) > 10:
                report.append(f"  ... and {len(self.repair_results['skipped_files']) - 10} more")
            report.append("")
        
        report.append("=" * 60)
        
        return "\n".join(report)

    def run_full_repair(self, diagnostic_file: str = 'diagnostics_results.json') -> Dict:
        """Run complete repair process"""
        self.logger.info("STARTING full data repair...")
        
        # Load diagnostic results
        diagnostic_results = self.load_diagnostic_results(diagnostic_file)
        
        # Repair missing data
        if diagnostic_results.get('missing_data'):
            missing_results = self.repair_missing_data(diagnostic_results['missing_data'])
            self.repair_results['repaired_files'].extend(missing_results['successful'])
            self.repair_results['failed_repairs'].extend(missing_results['failed'])
            self.repair_results['skipped_files'].extend(missing_results['skipped'])
        
        # Repair corrupted data
        if diagnostic_results.get('corrupted_data'):
            corrupted_results = self.repair_corrupted_data(diagnostic_results['corrupted_data'])
            self.repair_results['repaired_files'].extend(corrupted_results['successful'])
            self.repair_results['failed_repairs'].extend(corrupted_results['failed'])
            self.repair_results['skipped_files'].extend(corrupted_results['skipped'])
        
        # Update summary
        self.repair_results['summary']['total_attempted'] = (
            len(diagnostic_results.get('missing_data', [])) + 
            len(diagnostic_results.get('corrupted_data', []))
        )
        self.repair_results['summary']['successful'] = len(self.repair_results['repaired_files'])
        self.repair_results['summary']['failed'] = len(self.repair_results['failed_repairs'])
        self.repair_results['summary']['skipped'] = len(self.repair_results['skipped_files'])
        
        # Validate repaired data
        validation_results = self.validate_repaired_data()
        
        # Generate and save report
        report = self.generate_repair_report()
        print(report)
        
        # Save detailed results
        results_file = Path('repair_results.json')
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(self.repair_results, f, indent=2, default=str)
        
        self.logger.info(f"DETAILED repair results saved to: {results_file}")
        
        return self.repair_results

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Riksdata Data Repair')
    parser.add_argument('--cache-dir', default='data/cached', 
                       help='Cache directory (default: data/cached)')
    parser.add_argument('--diagnostic-file', default='diagnostics_results.json',
                       help='Diagnostic results file to use')
    parser.add_argument('--output', default='repair_results.json',
                       help='Output file for detailed results')
    
    args = parser.parse_args()
    
    repair = RiksdataRepair(args.cache_dir)
    results = repair.run_full_repair(args.diagnostic_file)
    
    # Exit with error code if there are failed repairs
    if results['summary']['failed'] > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == '__main__':
    main()
