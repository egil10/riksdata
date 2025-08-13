#!/usr/bin/env python3
"""
Riksdata Chart Quality Analyzer
Analyzes all cached datasets to determine which charts should be displayed on the website
"""

import json
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional
import sys

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('chart_quality_analysis.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

class ChartQualityAnalyzer:
    def __init__(self, cache_dir: str = 'data/cached'):
        self.cache_dir = Path(cache_dir)
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'total_datasets': 0,
            'display_charts': [],
            'excluded_charts': [],
            'quality_summary': {},
            'recommendations': []
        }
        
        # Quality thresholds
        self.min_data_points = 10
        self.max_null_percentage = 20
        self.min_time_span = 12
        
        # Keywords for filtering
        self.national_keywords = [
            'hele landet', 'national', 'total', 'alt', 'i alt', 'samlet',
            'nasjonal', 'landsomfattende', 'landsdekkende'
        ]
        
        self.regional_keywords = [
            'kommuner', 'fylker', 'bydeler', 'regioner', 'landsdeler',
            'municipalities', 'counties', 'districts', 'regions'
        ]
        
        self.always_include = [
            'cpi', 'unemployment', 'house-prices', 'gdp-growth', 'trade-balance',
            'interest-rate', 'exchange', 'oil-fund', 'government-debt'
        ]
        
        self.exclude_list = [
            'test', 'lite_datasett', 'foreløpige', 'preliminary'
        ]

    def is_national_dataset(self, title: str, dataset_id: str) -> bool:
        """Check if dataset is national-level"""
        title_lower = title.lower()
        id_str = str(dataset_id)
        
        # Check always include list
        if any(keyword in title_lower or keyword in id_str for keyword in self.always_include):
            return True
        
        # Check exclude list
        if any(keyword in title_lower or keyword in id_str for keyword in self.exclude_list):
            return False
        
        # Check regional keywords (exclude)
        if any(keyword in title_lower for keyword in self.regional_keywords):
            return False
        
        # Check national keywords (include)
        if any(keyword in title_lower for keyword in self.national_keywords):
            return True
        
        # Default: include if no regional keywords found
        return not any(keyword in title_lower for keyword in self.regional_keywords)

    def analyze_data_quality(self, data: Dict, title: str, dataset_id: str) -> Dict:
        """Analyze the quality of a dataset"""
        if not data or 'dataset' not in data:
            return {
                'should_display': False,
                'reason': 'No data available',
                'quality_score': 0,
                'metrics': {}
            }
        
        dataset = data['dataset']
        
        # Handle different data structures
        if 'value' in dataset:
            values = dataset['value']
            if isinstance(values, dict):
                data_points = len(values)
                # Count null/undefined values
                null_count = sum(1 for v in values.values() if v is None or v == '' or (isinstance(v, (int, float)) and (v != v or v == 0)))
            else:
                data_points = len(values) if isinstance(values, list) else 0
                null_count = sum(1 for v in values if v is None or v == '' or (isinstance(v, (int, float)) and (v != v or v == 0))) if isinstance(values, list) else 0
        else:
            data_points = 0
            null_count = 0
        
        null_percentage = (null_count / data_points * 100) if data_points > 0 else 100
        
        # Get time data
        time_data = dataset.get('dimension', {}).get('Tid', {}).get('category', {}).get('index', {})
        time_span = len(time_data) if isinstance(time_data, dict) else 0
        
        # Calculate time span
        time_span = len(time_data)
        
        # Check if national data
        is_national = self.is_national_dataset(title, dataset_id)
        
        # Calculate quality score (0-100)
        quality_score = 100
        
        if data_points < self.min_data_points:
            quality_score -= 30
        
        if null_percentage > self.max_null_percentage:
            quality_score -= 25
        
        if time_span < self.min_time_span:
            quality_score -= 20
        
        if not is_national:
            quality_score -= 15
        
        quality_score = max(0, quality_score)
        
        # Determine if should display
        should_display = quality_score >= 70 and is_national
        
        return {
            'should_display': should_display,
            'reason': self.get_rejection_reason(data_points, null_percentage, time_span, is_national) if not should_display else 'High quality national data',
            'quality_score': quality_score,
            'metrics': {
                'data_points': data_points,
                'null_percentage': null_percentage,
                'time_span': time_span,
                'is_national': is_national
            }
        }

    def get_rejection_reason(self, data_points: int, null_percentage: float, time_span: int, is_national: bool) -> str:
        """Get rejection reason for low-quality charts"""
        reasons = []
        
        if data_points < self.min_data_points:
            reasons.append(f"Insufficient data points ({data_points}/{self.min_data_points})")
        
        if null_percentage > self.max_null_percentage:
            reasons.append(f"Too many null values ({null_percentage:.1f}% > {self.max_null_percentage}%)")
        
        if time_span < self.min_time_span:
            reasons.append(f"Insufficient time span ({time_span} months < {self.min_time_span} months)")
        
        if not is_national:
            reasons.append("Not national-level data")
        
        return ', '.join(reasons)

    def analyze_all_datasets(self):
        """Analyze all cached datasets"""
        logger.info("Starting chart quality analysis...")
        
        # Get all cached files
        ssb_cache_dir = self.cache_dir / 'ssb'
        nb_cache_dir = self.cache_dir / 'norges-bank'
        
        all_datasets = []
        
        # Analyze SSB datasets
        if ssb_cache_dir.exists():
            for file_path in ssb_cache_dir.glob('*.json'):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    # Extract dataset info
                    dataset_id = file_path.stem
                    title = self.extract_title_from_data(data, dataset_id)
                    
                    all_datasets.append({
                        'source': 'ssb',
                        'dataset_id': dataset_id,
                        'title': title,
                        'file_path': str(file_path),
                        'data': data
                    })
                    
                except Exception as e:
                    logger.error(f"Error reading {file_path}: {e}")
        
        # Analyze Norges Bank datasets
        if nb_cache_dir.exists():
            for file_path in nb_cache_dir.glob('*.json'):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    dataset_id = file_path.stem
                    title = self.extract_title_from_data(data, dataset_id)
                    
                    all_datasets.append({
                        'source': 'norges-bank',
                        'dataset_id': dataset_id,
                        'title': title,
                        'file_path': str(file_path),
                        'data': data
                    })
                    
                except Exception as e:
                    logger.error(f"Error reading {file_path}: {e}")
        
        # Analyze each dataset
        for dataset in all_datasets:
            quality = self.analyze_data_quality(dataset['data'], dataset['title'], dataset['dataset_id'])
            
            chart_info = {
                'source': dataset['source'],
                'dataset_id': dataset['dataset_id'],
                'title': dataset['title'],
                'quality_score': quality['quality_score'],
                'reason': quality['reason'],
                'metrics': quality['metrics']
            }
            
            if quality['should_display']:
                self.results['display_charts'].append(chart_info)
            else:
                self.results['excluded_charts'].append(chart_info)
        
        # Sort by quality score
        self.results['display_charts'].sort(key=lambda x: x['quality_score'], reverse=True)
        self.results['excluded_charts'].sort(key=lambda x: x['quality_score'], reverse=True)
        
        # Generate summary
        self.generate_summary()
        
        logger.info(f"Analysis complete. {len(self.results['display_charts'])} charts to display, {len(self.results['excluded_charts'])} excluded.")

    def extract_title_from_data(self, data: Dict, dataset_id: str) -> str:
        """Extract title from dataset"""
        if 'dataset' in data and 'label' in data['dataset']:
            return data['dataset']['label']
        elif 'title' in data:
            return data['title']
        else:
            return f"Dataset {dataset_id}"

    def generate_summary(self):
        """Generate quality summary"""
        total = len(self.results['display_charts']) + len(self.results['excluded_charts'])
        self.results['total_datasets'] = total
        
        # Quality distribution
        quality_dist = {'excellent': 0, 'good': 0, 'fair': 0, 'poor': 0}
        for chart in self.results['display_charts'] + self.results['excluded_charts']:
            score = chart['quality_score']
            if score >= 90:
                quality_dist['excellent'] += 1
            elif score >= 80:
                quality_dist['good'] += 1
            elif score >= 70:
                quality_dist['fair'] += 1
            else:
                quality_dist['poor'] += 1
        
        self.results['quality_summary'] = {
            'total': total,
            'display': len(self.results['display_charts']),
            'excluded': len(self.results['excluded_charts']),
            'quality_distribution': quality_dist
        }
        
        # Generate recommendations
        self.generate_recommendations()

    def generate_recommendations(self):
        """Generate recommendations based on analysis"""
        recommendations = []
        
        if len(self.results['excluded_charts']) > len(self.results['display_charts']):
            recommendations.append("Consider relaxing quality thresholds to include more charts")
        
        if len(self.results['display_charts']) < 50:
            recommendations.append("Website may have too few charts - consider adding more datasets")
        
        if len(self.results['display_charts']) > 150:
            recommendations.append("Website may have too many charts - consider increasing quality thresholds")
        
        # Check for common exclusion reasons
        exclusion_reasons = {}
        for chart in self.results['excluded_charts']:
            reason = chart['reason']
            exclusion_reasons[reason] = exclusion_reasons.get(reason, 0) + 1
        
        for reason, count in exclusion_reasons.items():
            if count > 10:
                recommendations.append(f"Many charts excluded due to: {reason}")
        
        self.results['recommendations'] = recommendations

    def save_results(self, output_file: str = 'chart_quality_report.json'):
        """Save analysis results"""
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Results saved to {output_file}")

    def print_summary(self):
        """Print analysis summary"""
        print("\n" + "="*60)
        print("CHART QUALITY ANALYSIS SUMMARY")
        print("="*60)
        
        summary = self.results['quality_summary']
        print(f"Total datasets analyzed: {summary['total']}")
        print(f"Charts to display: {summary['display']}")
        print(f"Charts excluded: {summary['excluded']}")
        print(f"Display rate: {(summary['display']/summary['total']*100):.1f}%")
        
        print("\nQuality Distribution:")
        for quality, count in summary['quality_distribution'].items():
            print(f"  {quality.capitalize()}: {count}")
        
        print("\nTop 10 Charts by Quality:")
        for i, chart in enumerate(self.results['display_charts'][:10], 1):
            print(f"  {i:2d}. {chart['title']} (Score: {chart['quality_score']:.1f})")
        
        print("\nRecommendations:")
        for rec in self.results['recommendations']:
            print(f"  • {rec}")
        
        print("="*60)

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Analyze chart quality for Riksdata')
    parser.add_argument('--cache-dir', default='data/cached', 
                       help='Cache directory (default: data/cached)')
    parser.add_argument('--output', default='chart_quality_report.json',
                       help='Output file for detailed results')
    
    args = parser.parse_args()
    
    analyzer = ChartQualityAnalyzer(args.cache_dir)
    analyzer.analyze_all_datasets()
    analyzer.save_results(args.output)
    analyzer.print_summary()

if __name__ == '__main__':
    main()
