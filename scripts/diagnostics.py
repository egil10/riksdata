#!/usr/bin/env python3
"""
Riksdata Diagnostics Script
Comprehensive data health check and API connectivity testing
"""

import json
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import sys

# Add the scripts directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from fetch.ssb import SSBFetcher
from fetch.norges_bank import NorgesBankFetcher
from validate.validator import RiksdataValidator

class RiksdataDiagnostics:
    def __init__(self, cache_dir: str = 'data/cached'):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler(sys.stdout),
                logging.FileHandler('diagnostics.log', encoding='utf-8')
            ]
        )
        self.logger = logging.getLogger(__name__)
        
        # Initialize fetchers
        self.ssb_fetcher = SSBFetcher(self.cache_dir)
        self.nb_fetcher = NorgesBankFetcher(self.cache_dir)
        self.validator = RiksdataValidator(self.cache_dir)
        
        # Results storage
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'api_connectivity': {},
            'cache_status': {},
            'data_quality': {},
            'missing_data': [],
            'corrupted_data': [],
            'recommendations': []
        }

    def test_api_connectivity(self) -> Dict:
        """Test connectivity to all APIs"""
        self.logger.info("Testing API connectivity...")
        
        connectivity_results = {}
        
        # Test SSB API
        ssb_test_urls = [
            'https://data.ssb.no/api/v0/dataset/1086.json?lang=en',  # CPI
            'https://data.ssb.no/api/v0/dataset/1052.json?lang=en',  # Unemployment
            'https://data.ssb.no/api/v0/dataset/1060.json?lang=en',  # House Prices
        ]
        
        import requests
        
        for url in ssb_test_urls:
            try:
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    connectivity_results[url] = {
                        'status': 'success',
                        'response_time': response.headers.get('X-Response-Time', 'N/A'),
                        'data_size': len(str(data)),
                        'has_dataset': 'dataset' in data
                    }
                else:
                    connectivity_results[url] = {
                        'status': 'error',
                        'status_code': response.status_code,
                        'error': f'HTTP {response.status_code}'
                    }
            except Exception as e:
                connectivity_results[url] = {
                    'status': 'error',
                    'error': str(e)
                }
        
        # Test Norges Bank API
        nb_test_urls = [
            'https://data.norges-bank.no/api/data/EXR/M.USD+EUR.NOK.SP?format=sdmx-json&startPeriod=2024-01-01&endPeriod=2024-12-31&locale=no',
            'https://data.norges-bank.no/api/data/IR/M.KPRA..?format=sdmx-json&startPeriod=2024-01-01&endPeriod=2024-12-31&locale=no'
        ]
        
        for url in nb_test_urls:
            try:
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    connectivity_results[url] = {
                        'status': 'success',
                        'response_time': response.headers.get('X-Response-Time', 'N/A'),
                        'data_size': len(str(data)),
                        'has_data': 'data' in data
                    }
                else:
                    connectivity_results[url] = {
                        'status': 'error',
                        'status_code': response.status_code,
                        'error': f'HTTP {response.status_code}'
                    }
            except Exception as e:
                connectivity_results[url] = {
                    'status': 'error',
                    'error': str(e)
                }
        
        self.results['api_connectivity'] = connectivity_results
        return connectivity_results

    def analyze_cache_status(self) -> Dict:
        """Analyze the current cache status"""
        self.logger.info("📁 Analyzing cache status...")
        
        cache_status = {
            'ssb': {},
            'norges_bank': {},
            'static': {},
            'summary': {
                'total_files': 0,
                'valid_files': 0,
                'corrupted_files': 0,
                'missing_files': 0,
                'total_size_mb': 0
            }
        }
        
        # Check SSB cache
        ssb_cache_dir = self.cache_dir / 'ssb'
        if ssb_cache_dir.exists():
            for file_path in ssb_cache_dir.glob('*.json'):
                file_info = self._analyze_cache_file(file_path)
                cache_status['ssb'][file_path.name] = file_info
                cache_status['summary']['total_files'] += 1
                cache_status['summary']['total_size_mb'] += file_info['size_mb']
                
                if file_info['status'] == 'valid':
                    cache_status['summary']['valid_files'] += 1
                elif file_info['status'] == 'corrupted':
                    cache_status['summary']['corrupted_files'] += 1
                    self.results['corrupted_data'].append(str(file_path))
        
        # Check Norges Bank cache
        nb_cache_dir = self.cache_dir / 'norges-bank'
        if nb_cache_dir.exists():
            for file_path in nb_cache_dir.glob('*.json'):
                file_info = self._analyze_cache_file(file_path)
                cache_status['norges_bank'][file_path.name] = file_info
                cache_status['summary']['total_files'] += 1
                cache_status['summary']['total_size_mb'] += file_info['size_mb']
                
                if file_info['status'] == 'valid':
                    cache_status['summary']['valid_files'] += 1
                elif file_info['status'] == 'corrupted':
                    cache_status['summary']['corrupted_files'] += 1
                    self.results['corrupted_data'].append(str(file_path))
        
        # Check static data
        static_data_dir = Path('data')
        if static_data_dir.exists():
            for file_path in static_data_dir.glob('*.json'):
                if file_path.name != 'metadata.json':
                    file_info = self._analyze_cache_file(file_path)
                    cache_status['static'][file_path.name] = file_info
                    cache_status['summary']['total_files'] += 1
                    cache_status['summary']['total_size_mb'] += file_info['size_mb']
                    
                    if file_info['status'] == 'valid':
                        cache_status['summary']['valid_files'] += 1
                    elif file_info['status'] == 'corrupted':
                        cache_status['summary']['corrupted_files'] += 1
                        self.results['corrupted_data'].append(str(file_path))
        
        self.results['cache_status'] = cache_status
        return cache_status

    def _analyze_cache_file(self, file_path: Path) -> Dict:
        """Analyze a single cache file"""
        try:
            stat = file_path.stat()
            file_info = {
                'size_mb': round(stat.st_size / (1024 * 1024), 2),
                'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                'age_days': (datetime.now() - datetime.fromtimestamp(stat.st_mtime)).days
            }
            
            # Try to parse JSON
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            # Basic validation
            if isinstance(data, dict):
                if 'dataset' in data:  # SSB format
                    file_info['status'] = 'valid'
                    file_info['data_type'] = 'ssb'
                    file_info['has_data'] = len(data.get('dataset', {}).get('value', [])) > 0
                elif 'data' in data:  # Norges Bank format
                    file_info['status'] = 'valid'
                    file_info['data_type'] = 'norges_bank'
                    file_info['has_data'] = len(data.get('data', {}).get('dataSets', [])) > 0
                else:  # Static data format
                    file_info['status'] = 'valid'
                    file_info['data_type'] = 'static'
                    file_info['has_data'] = len(data) > 0
            else:
                file_info['status'] = 'corrupted'
                file_info['error'] = 'Not a valid JSON object'
                
        except json.JSONDecodeError as e:
            file_info['status'] = 'corrupted'
            file_info['error'] = f'JSON decode error: {str(e)}'
        except Exception as e:
            file_info['status'] = 'corrupted'
            file_info['error'] = f'File error: {str(e)}'
        
        return file_info

    def identify_missing_data(self) -> List[str]:
        """Identify missing data files based on expected datasets"""
        self.logger.info("🔍 Identifying missing data...")
        
        missing_files = []
        
        # Expected SSB datasets from main.js
        expected_ssb_datasets = [
            'cpi', 'unemployment', 'house-prices', 'ppi', 'wage', 'gdp-growth',
            'trade-balance', 'bankruptcies', 'population-growth', 'construction-costs',
            'industrial-production', 'retail-sales', 'export-volume', 'import-volume',
            'business-confidence', 'consumer-confidence', 'housing-starts',
            'monetary-aggregates', 'job-vacancies', 'household-consumption',
            'producer-prices', 'construction-production', 'credit-indicator',
            'energy-consumption', 'government-revenue', 'international-accounts',
            'labour-cost-index', 'rd-expenditure', 'salmon-export',
            'oil-gas-investment', 'immigration-rate', 'household-income',
            'life-expectancy', 'crime-rate', 'education-level',
            'holiday-property-sales', 'greenhouse-gas', 'economic-forecasts',
            'new-dwellings-price', 'lifestyle-habits', 'long-term-illness',
            'births-deaths', 'cpi-ate', 'salmon-export-volume', 'basic-salary',
            'export-country', 'import-country', 'export-commodity', 'import-commodity',
            'construction-cost-wood', 'construction-cost-multi', 'wholesale-retail',
            'household-types', 'population-age', 'cpi-coicop', 'cpi-subgroups',
            'cpi-items', 'cpi-delivery', 'household-income-size',
            'cohabiting-arrangements', 'utility-floor-space', 'credit-indicator-c2',
            'job-vacancies-new', 'oil-gas-turnover', 'trade-volume-price',
            'producer-price-industry', 'deaths-age', 'bankruptcies-total',
            'energy-accounts', 'monetary-m3', 'business-tendency'
        ]
        
        ssb_cache_dir = self.cache_dir / 'ssb'
        for dataset in expected_ssb_datasets:
            file_path = ssb_cache_dir / f'{dataset}.json'
            if not file_path.exists():
                missing_files.append(f'ssb/{dataset}.json')
        
        # Expected Norges Bank datasets
        expected_nb_datasets = ['exchange-rates', 'interest-rate', 'government-debt']
        nb_cache_dir = self.cache_dir / 'norges-bank'
        for dataset in expected_nb_datasets:
            file_path = nb_cache_dir / f'{dataset}.json'
            if not file_path.exists():
                missing_files.append(f'norges-bank/{dataset}.json')
        
        # Expected static data
        expected_static_files = ['oil-fund.json']
        static_data_dir = Path('data')
        for file_name in expected_static_files:
            file_path = static_data_dir / file_name
            if not file_path.exists():
                missing_files.append(f'static/{file_name}')
        
        self.results['missing_data'] = missing_files
        return missing_files

    def validate_data_quality(self) -> Dict:
        """Validate data quality and structure"""
        self.logger.info("✅ Validating data quality...")
        
        quality_results = {
            'ssb': {},
            'norges_bank': {},
            'static': {},
            'overall_score': 0
        }
        
        total_datasets = 0
        valid_datasets = 0
        
        # Validate SSB data
        ssb_cache_dir = self.cache_dir / 'ssb'
        if ssb_cache_dir.exists():
            for file_path in ssb_cache_dir.glob('*.json'):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    quality_score = self._validate_ssb_data(data)
                    quality_results['ssb'][file_path.stem] = quality_score
                    total_datasets += 1
                    if quality_score['is_valid']:
                        valid_datasets += 1
                        
                except Exception as e:
                    quality_results['ssb'][file_path.stem] = {
                        'is_valid': False,
                        'error': str(e),
                        'score': 0
                    }
                    total_datasets += 1
        
        # Validate Norges Bank data
        nb_cache_dir = self.cache_dir / 'norges-bank'
        if nb_cache_dir.exists():
            for file_path in nb_cache_dir.glob('*.json'):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    quality_score = self._validate_nb_data(data)
                    quality_results['norges_bank'][file_path.stem] = quality_score
                    total_datasets += 1
                    if quality_score['is_valid']:
                        valid_datasets += 1
                        
                except Exception as e:
                    quality_results['norges_bank'][file_path.stem] = {
                        'is_valid': False,
                        'error': str(e),
                        'score': 0
                    }
                    total_datasets += 1
        
        # Calculate overall score
        if total_datasets > 0:
            quality_results['overall_score'] = round((valid_datasets / total_datasets) * 100, 2)
        
        self.results['data_quality'] = quality_results
        return quality_results

    def _validate_ssb_data(self, data: Dict) -> Dict:
        """Validate SSB data structure"""
        score = 0
        issues = []
        
        # Check basic structure
        if 'dataset' not in data:
            issues.append('Missing dataset key')
            return {'is_valid': False, 'score': 0, 'issues': issues}
        
        dataset = data['dataset']
        
        # Check required keys
        required_keys = ['dimension', 'value']
        for key in required_keys:
            if key in dataset:
                score += 20
            else:
                issues.append(f'Missing {key} key')
        
        # Check time dimension
        if 'dimension' in dataset and 'Tid' in dataset['dimension']:
            score += 30
            time_dim = dataset['dimension']['Tid']
            if 'category' in time_dim and 'label' in time_dim['category']:
                score += 20
                time_labels = time_dim['category']['label']
                if len(time_labels) > 0:
                    score += 10
                else:
                    issues.append('No time labels found')
            else:
                issues.append('Invalid time dimension structure')
        else:
            issues.append('Missing time dimension')
        
        # Check data values
        if 'value' in dataset and len(dataset['value']) > 0:
            score += 20
        else:
            issues.append('No data values found')
        
        return {
            'is_valid': score >= 80,
            'score': score,
            'issues': issues,
            'data_points': len(dataset.get('value', []))
        }

    def _validate_nb_data(self, data: Dict) -> Dict:
        """Validate Norges Bank data structure"""
        score = 0
        issues = []
        
        # Check basic structure
        if 'data' not in data:
            issues.append('Missing data key')
            return {'is_valid': False, 'score': 0, 'issues': issues}
        
        nb_data = data['data']
        
        # Check required keys
        required_keys = ['dataSets', 'structure']
        for key in required_keys:
            if key in nb_data:
                score += 30
            else:
                issues.append(f'Missing {key} key')
        
        # Check dataSets
        if 'dataSets' in nb_data and len(nb_data['dataSets']) > 0:
            score += 40
            dataset = nb_data['dataSets'][0]
            if 'series' in dataset and len(dataset['series']) > 0:
                score += 30
            else:
                issues.append('No series data found')
        else:
            issues.append('No datasets found')
        
        return {
            'is_valid': score >= 80,
            'score': score,
            'issues': issues,
            'datasets_count': len(nb_data.get('dataSets', []))
        }

    def generate_recommendations(self) -> List[str]:
        """Generate recommendations based on analysis"""
        recommendations = []
        
        # Check API connectivity
        api_errors = sum(1 for result in self.results['api_connectivity'].values() 
                        if result.get('status') == 'error')
        if api_errors > 0:
            recommendations.append(f"Fix {api_errors} API connectivity issues")
        
        # Check missing data
        if self.results['missing_data']:
            recommendations.append(f"Fetch {len(self.results['missing_data'])} missing datasets")
        
        # Check corrupted data
        if self.results['corrupted_data']:
            recommendations.append(f"Re-fetch {len(self.results['corrupted_data'])} corrupted files")
        
        # Check data freshness
        cache_status = self.results['cache_status']
        old_files = []
        for source in ['ssb', 'norges_bank', 'static']:
            for file_info in cache_status.get(source, {}).values():
                if file_info.get('age_days', 0) > 7:
                    old_files.append(file_info.get('age_days', 0))
        
        if old_files:
            max_age = max(old_files)
            recommendations.append(f"Refresh data older than {max_age} days")
        
        # Check data quality
        quality_score = self.results['data_quality'].get('overall_score', 0)
        if quality_score < 90:
            recommendations.append(f"Improve data quality (current score: {quality_score}%)")
        
        if not recommendations:
            recommendations.append("All systems operational - data is healthy!")
        
        self.results['recommendations'] = recommendations
        return recommendations

    def generate_report(self) -> str:
        """Generate a comprehensive diagnostic report"""
        report = []
        report.append("=" * 60)
        report.append("RIKSDATA DIAGNOSTIC REPORT")
        report.append("=" * 60)
        report.append(f"Generated: {self.results['timestamp']}")
        report.append("")
        
        # API Connectivity Summary
        report.append("🔌 API CONNECTIVITY")
        report.append("-" * 30)
        api_results = self.results['api_connectivity']
        success_count = sum(1 for result in api_results.values() if result.get('status') == 'success')
        total_apis = len(api_results)
        report.append(f"APIs tested: {total_apis}")
        report.append(f"Successful: {success_count}")
        report.append(f"Failed: {total_apis - success_count}")
        report.append("")
        
        # Cache Status Summary
        report.append("📁 CACHE STATUS")
        report.append("-" * 30)
        cache_summary = self.results['cache_status']['summary']
        report.append(f"Total files: {cache_summary['total_files']}")
        report.append(f"Valid files: {cache_summary['valid_files']}")
        report.append(f"Corrupted files: {cache_summary['corrupted_files']}")
        report.append(f"Total size: {cache_summary['total_size_mb']:.2f} MB")
        report.append("")
        
        # Missing Data
        report.append("🔍 MISSING DATA")
        report.append("-" * 30)
        missing_data = self.results['missing_data']
        if missing_data:
            report.append(f"Missing files: {len(missing_data)}")
            for file_path in missing_data[:10]:  # Show first 10
                report.append(f"  - {file_path}")
            if len(missing_data) > 10:
                report.append(f"  ... and {len(missing_data) - 10} more")
        else:
            report.append("No missing data files")
        report.append("")
        
        # Data Quality
        report.append("✅ DATA QUALITY")
        report.append("-" * 30)
        quality_score = self.results['data_quality']['overall_score']
        report.append(f"Overall quality score: {quality_score}%")
        report.append("")
        
        # Recommendations
        report.append("💡 RECOMMENDATIONS")
        report.append("-" * 30)
        for recommendation in self.results['recommendations']:
            report.append(f"• {recommendation}")
        report.append("")
        
        report.append("=" * 60)
        
        return "\n".join(report)

    def run_full_diagnostics(self) -> Dict:
        """Run complete diagnostic suite"""
        self.logger.info("Starting full diagnostics...")
        
        # Run all diagnostic tests
        self.test_api_connectivity()
        self.analyze_cache_status()
        self.identify_missing_data()
        self.validate_data_quality()
        self.generate_recommendations()
        
        # Generate and save report
        report = self.generate_report()
        print(report)
        
        # Save detailed results
        results_file = Path('diagnostics_results.json')
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, default=str)
        
        self.logger.info(f"Detailed results saved to: {results_file}")
        
        return self.results

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Riksdata Diagnostics')
    parser.add_argument('--cache-dir', default='data/cached', 
                       help='Cache directory (default: data/cached)')
    parser.add_argument('--output', default='diagnostics_results.json',
                       help='Output file for detailed results')
    
    args = parser.parse_args()
    
    diagnostics = RiksdataDiagnostics(args.cache_dir)
    results = diagnostics.run_full_diagnostics()
    
    # Exit with error code if there are issues
    if (results['missing_data'] or 
        results['corrupted_data'] or 
        any(r.get('status') == 'error' for r in results['api_connectivity'].values())):
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == '__main__':
    main()
