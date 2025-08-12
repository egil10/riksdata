#!/usr/bin/env python3
"""
Riksdata Data Expansion Script
Easy addition of new APIs, data sources, and datasets
"""

import json
import asyncio
import aiohttp
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional, Any
import sys
import re

# Add the scripts directory to the path
sys.path.insert(0, str(Path(__file__).parent))

class RiksdataExpander:
    def __init__(self, cache_dir: str = 'data/cached'):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler(sys.stdout),
                logging.FileHandler('expand.log')
            ]
        )
        self.logger = logging.getLogger(__name__)
        
        # Load existing configuration
        self.config_file = Path('src/js/config.js')
        self.load_existing_config()
        
        # Expansion results
        self.expansion_results = {
            'timestamp': datetime.now().isoformat(),
            'new_sources': [],
            'new_datasets': [],
            'failed_expansions': [],
            'summary': {
                'sources_added': 0,
                'datasets_added': 0,
                'failed': 0
            }
        }

    def load_existing_config(self):
        """Load existing configuration from config.js"""
        try:
            with open(self.config_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Extract existing dataset mappings
            self.existing_mappings = self._extract_dataset_mappings(content)
            self.existing_sources = self._extract_data_sources(content)
            
        except FileNotFoundError:
            self.logger.warning("Config file not found, starting fresh")
            self.existing_mappings = {'ssb': {}, 'norges_bank': {}}
            self.existing_sources = {'SSB': 'ssb', 'NORGES_BANK': 'norges-bank', 'STATIC': 'static'}

    def _extract_dataset_mappings(self, content: str) -> Dict:
        """Extract dataset mappings from config.js content"""
        mappings = {'ssb': {}, 'norges_bank': {}}
        
        # Extract SSB mappings
        ssb_match = re.search(r'ssb:\s*{([^}]+)}', content, re.DOTALL)
        if ssb_match:
            ssb_content = ssb_match.group(1)
            for line in ssb_content.split('\n'):
                match = re.search(r"'(\d+)':\s*'([^']+)'", line)
                if match:
                    dataset_id, cache_name = match.groups()
                    mappings['ssb'][cache_name] = dataset_id
        
        # Extract Norges Bank mappings
        nb_match = re.search(r'norges_bank:\s*{([^}]+)}', content, re.DOTALL)
        if nb_match:
            nb_content = nb_match.group(1)
            for line in nb_content.split('\n'):
                match = re.search(r"'([^']+)':\s*'([^']+)'", line)
                if match:
                    api_path, cache_name = match.groups()
                    mappings['norges_bank'][cache_name] = api_path
        
        return mappings

    def _extract_data_sources(self, content: str) -> Dict:
        """Extract data sources from config.js content"""
        sources = {}
        source_match = re.search(r'DATA_SOURCES\s*=\s*{([^}]+)}', content, re.DOTALL)
        if source_match:
            source_content = source_match.group(1)
            for line in source_content.split('\n'):
                match = re.search(r'(\w+):\s*\'([^\']+)\'', line)
                if match:
                    key, value = match.groups()
                    sources[key] = value
        
        return sources

    async def add_ssb_dataset(self, dataset_id: str, cache_name: str, title: str, 
                            description: str = "", chart_type: str = "line") -> bool:
        """Add a new SSB dataset"""
        try:
            self.logger.info(f"Adding SSB dataset: {dataset_id} -> {cache_name}")
            
            # Test the API endpoint
            url = f"https://data.ssb.no/api/v0/dataset/{dataset_id}.json?lang=en"
            success = await self._test_ssb_endpoint(url, dataset_id)
            
            if not success:
                return False
            
            # Add to mappings
            self.existing_mappings['ssb'][cache_name] = dataset_id
            
            # Update config.js
            self._update_config_js()
            
            # Add to main.js
            self._add_to_main_js(cache_name, url, title, chart_type)
            
            # Add to HTML
            self._add_to_html(cache_name, title, description)
            
            # Fetch and cache the data
            await self._fetch_and_cache_ssb(dataset_id, cache_name)
            
            self.expansion_results['new_datasets'].append({
                'source': 'ssb',
                'dataset_id': dataset_id,
                'cache_name': cache_name,
                'title': title,
                'type': 'ssb'
            })
            
            self.expansion_results['summary']['datasets_added'] += 1
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to add SSB dataset {dataset_id}: {str(e)}")
            self.expansion_results['failed_expansions'].append({
                'source': 'ssb',
                'dataset_id': dataset_id,
                'error': str(e)
            })
            self.expansion_results['summary']['failed'] += 1
            return False

    async def add_norges_bank_dataset(self, api_path: str, cache_name: str, title: str,
                                    description: str = "", chart_type: str = "line") -> bool:
        """Add a new Norges Bank dataset"""
        try:
            self.logger.info(f"Adding Norges Bank dataset: {api_path} -> {cache_name}")
            
            # Test the API endpoint
            url = f"https://data.norges-bank.no/api/data/{api_path}"
            success = await self._test_nb_endpoint(url, cache_name)
            
            if not success:
                return False
            
            # Add to mappings
            self.existing_mappings['norges_bank'][cache_name] = api_path
            
            # Update config.js
            self._update_config_js()
            
            # Add to main.js
            self._add_to_main_js(cache_name, url, title, chart_type)
            
            # Add to HTML
            self._add_to_html(cache_name, title, description)
            
            # Fetch and cache the data
            await self._fetch_and_cache_nb(api_path, cache_name)
            
            self.expansion_results['new_datasets'].append({
                'source': 'norges_bank',
                'api_path': api_path,
                'cache_name': cache_name,
                'title': title,
                'type': 'norges_bank'
            })
            
            self.expansion_results['summary']['datasets_added'] += 1
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to add Norges Bank dataset {api_path}: {str(e)}")
            self.expansion_results['failed_expansions'].append({
                'source': 'norges_bank',
                'api_path': api_path,
                'error': str(e)
            })
            self.expansion_results['summary']['failed'] += 1
            return False

    async def add_static_dataset(self, data: Dict, cache_name: str, title: str,
                               description: str = "", chart_type: str = "line") -> bool:
        """Add a new static dataset"""
        try:
            self.logger.info(f"Adding static dataset: {cache_name}")
            
            # Save static data
            data_file = Path('data') / f'{cache_name}.json'
            data_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(data_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            # Add to main.js
            self._add_to_main_js(cache_name, f'data/{cache_name}.json', title, chart_type)
            
            # Add to HTML
            self._add_to_html(cache_name, title, description)
            
            self.expansion_results['new_datasets'].append({
                'source': 'static',
                'cache_name': cache_name,
                'title': title,
                'type': 'static'
            })
            
            self.expansion_results['summary']['datasets_added'] += 1
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to add static dataset {cache_name}: {str(e)}")
            self.expansion_results['failed_expansions'].append({
                'source': 'static',
                'cache_name': cache_name,
                'error': str(e)
            })
            self.expansion_results['summary']['failed'] += 1
            return False

    async def add_new_data_source(self, source_name: str, base_url: str, 
                                description: str = "") -> bool:
        """Add a new data source"""
        try:
            self.logger.info(f"Adding new data source: {source_name}")
            
            # Add to config.js
            self._add_data_source_to_config(source_name, base_url)
            
            # Create fetcher class
            self._create_fetcher_class(source_name, base_url)
            
            # Update main.py
            self._update_main_py(source_name)
            
            self.expansion_results['new_sources'].append({
                'name': source_name,
                'base_url': base_url,
                'description': description
            })
            
            self.expansion_results['summary']['sources_added'] += 1
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to add data source {source_name}: {str(e)}")
            self.expansion_results['failed_expansions'].append({
                'source': 'new_source',
                'name': source_name,
                'error': str(e)
            })
            self.expansion_results['summary']['failed'] += 1
            return False

    async def _test_ssb_endpoint(self, url: str, dataset_id: str) -> bool:
        """Test SSB API endpoint"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=10) as response:
                    if response.status == 200:
                        data = await response.json()
                        if 'dataset' in data:
                            self.logger.info(f"✅ SSB endpoint {dataset_id} is valid")
                            return True
                        else:
                            self.logger.error(f"❌ SSB endpoint {dataset_id} has invalid structure")
                            return False
                    else:
                        self.logger.error(f"❌ SSB endpoint {dataset_id} returned HTTP {response.status}")
                        return False
        except Exception as e:
            self.logger.error(f"❌ SSB endpoint {dataset_id} test failed: {str(e)}")
            return False

    async def _test_nb_endpoint(self, url: str, cache_name: str) -> bool:
        """Test Norges Bank API endpoint"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=10) as response:
                    if response.status == 200:
                        data = await response.json()
                        if 'data' in data:
                            self.logger.info(f"✅ Norges Bank endpoint {cache_name} is valid")
                            return True
                        else:
                            self.logger.error(f"❌ Norges Bank endpoint {cache_name} has invalid structure")
                            return False
                    else:
                        self.logger.error(f"❌ Norges Bank endpoint {cache_name} returned HTTP {response.status}")
                        return False
        except Exception as e:
            self.logger.error(f"❌ Norges Bank endpoint {cache_name} test failed: {str(e)}")
            return False

    async def _fetch_and_cache_ssb(self, dataset_id: str, cache_name: str):
        """Fetch and cache SSB data"""
        url = f"https://data.ssb.no/api/v0/dataset/{dataset_id}.json?lang=en"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=30) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Save to cache
                    cache_file = self.cache_dir / 'ssb' / f'{cache_name}.json'
                    cache_file.parent.mkdir(parents=True, exist_ok=True)
                    
                    with open(cache_file, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)
                    
                    self.logger.info(f"✅ Cached SSB data for {cache_name}")

    async def _fetch_and_cache_nb(self, api_path: str, cache_name: str):
        """Fetch and cache Norges Bank data"""
        url = f"https://data.norges-bank.no/api/data/{api_path}"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=30) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Save to cache
                    cache_file = self.cache_dir / 'norges-bank' / f'{cache_name}.json'
                    cache_file.parent.mkdir(parents=True, exist_ok=True)
                    
                    with open(cache_file, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)
                    
                    self.logger.info(f"✅ Cached Norges Bank data for {cache_name}")

    def _update_config_js(self):
        """Update config.js with new dataset mappings"""
        try:
            with open(self.config_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Update SSB mappings
            ssb_mappings_str = self._format_ssb_mappings()
            content = re.sub(
                r'ssb:\s*{[^}]+}',
                f'ssb: {{\n        {ssb_mappings_str}\n    }}',
                content,
                flags=re.DOTALL
            )
            
            # Update Norges Bank mappings
            nb_mappings_str = self._format_nb_mappings()
            content = re.sub(
                r'norges_bank:\s*{[^}]+}',
                f'norges_bank: {{\n        {nb_mappings_str}\n    }}',
                content,
                flags=re.DOTALL
            )
            
            with open(self.config_file, 'w', encoding='utf-8') as f:
                f.write(content)
            
            self.logger.info("✅ Updated config.js")
            
        except Exception as e:
            self.logger.error(f"Failed to update config.js: {str(e)}")

    def _format_ssb_mappings(self) -> str:
        """Format SSB mappings for config.js"""
        lines = []
        for cache_name, dataset_id in self.existing_mappings['ssb'].items():
            lines.append(f"'{dataset_id}': '{cache_name}',")
        return '\n        '.join(lines)

    def _format_nb_mappings(self) -> str:
        """Format Norges Bank mappings for config.js"""
        lines = []
        for cache_name, api_path in self.existing_mappings['norges_bank'].items():
            lines.append(f"'{api_path}': '{cache_name}',")
        return '\n        '.join(lines)

    def _add_to_main_js(self, cache_name: str, url: str, title: str, chart_type: str = "line"):
        """Add new chart to main.js"""
        try:
            main_js_file = Path('src/js/main.js')
            
            with open(main_js_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find the chart promises section
            chart_promise_pattern = r'(\s*// \d+ Additional charts\s*\n)'
            match = re.search(chart_promise_pattern, content)
            
            if match:
                # Add before the last "Additional charts" comment
                chart_type_param = f", '{chart_type}'" if chart_type != "line" else ""
                new_chart_line = f'            loadChartData(\'{cache_name}-chart\', \'{url}\', \'{title}\'{chart_type_param}),\n'
                
                # Find the last occurrence of the pattern
                last_match = None
                for match in re.finditer(chart_promise_pattern, content):
                    last_match = match
                
                if last_match:
                    insert_pos = last_match.start()
                    content = content[:insert_pos] + new_chart_line + content[insert_pos:]
            else:
                # Add to the end of chart promises
                chart_promises_end = content.rfind('        ];')
                if chart_promises_end != -1:
                    new_chart_line = f'            loadChartData(\'{cache_name}-chart\', \'{url}\', \'{title}\'{", \'" + chart_type + "\'" if chart_type != "line" else ""}),\n        '
                    content = content[:chart_promises_end] + new_chart_line + content[chart_promises_end:]
            
            with open(main_js_file, 'w', encoding='utf-8') as f:
                f.write(content)
            
            self.logger.info(f"✅ Added {cache_name} to main.js")
            
        except Exception as e:
            self.logger.error(f"Failed to update main.js: {str(e)}")

    def _add_to_html(self, cache_name: str, title: str, description: str = ""):
        """Add new chart to HTML"""
        try:
            html_file = Path('index.html')
            
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find the chart grid section
            chart_grid_pattern = r'(<div class="chart-grid">)'
            match = re.search(chart_grid_pattern, content)
            
            if match:
                # Create new chart card HTML
                new_chart_html = f'''
            <div class="chart-card">
                <div class="chart-header">
                    <h3>{title}</h3>
                    <a href="#" target="_blank" class="source-link">Source</a>
                    <div class="chart-subtitle">{description}</div>
                </div>
                <div class="skeleton-chart" id="{cache_name}-skeleton"></div>
                <div class="chart-container">
                    <canvas id="{cache_name}-chart"></canvas>
                    <div class="static-tooltip" id="{cache_name}-tooltip"></div>
                </div>
            </div>'''
                
                # Insert after the chart grid opening tag
                insert_pos = match.end()
                content = content[:insert_pos] + new_chart_html + content[insert_pos:]
            
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(content)
            
            self.logger.info(f"✅ Added {cache_name} to HTML")
            
        except Exception as e:
            self.logger.error(f"Failed to update HTML: {str(e)}")

    def _add_data_source_to_config(self, source_name: str, base_url: str):
        """Add new data source to config.js"""
        try:
            with open(self.config_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Add to DATA_SOURCES
            source_key = source_name.upper().replace('-', '_')
            new_source_line = f"    {source_key}: '{source_name.lower()}',\n"
            
            # Find DATA_SOURCES section
            data_sources_pattern = r'(DATA_SOURCES\s*=\s*{[^}]+})'
            match = re.search(data_sources_pattern, content, re.DOTALL)
            
            if match:
                data_sources_section = match.group(1)
                # Add before the closing brace
                updated_section = data_sources_section.rstrip()[:-1] + new_source_line + "}"
                content = content.replace(data_sources_section, updated_section)
            
            with open(self.config_file, 'w', encoding='utf-8') as f:
                f.write(content)
            
            self.logger.info(f"✅ Added {source_name} to config.js")
            
        except Exception as e:
            self.logger.error(f"Failed to add data source to config.js: {str(e)}")

    def _create_fetcher_class(self, source_name: str, base_url: str):
        """Create a new fetcher class for the data source"""
        try:
            fetcher_file = Path('scripts/fetch') / f'{source_name.lower()}.py'
            
            fetcher_template = f'''#!/usr/bin/env python3
"""
{source_name.title()} Data Fetcher
Fetches data from {source_name} API
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Tuple
from .base import BaseFetcher

class {source_name.title()}Fetcher(BaseFetcher):
    def __init__(self, cache_dir: Path):
        super().__init__(cache_dir / "{source_name.lower()}")
        self.base_url = "{base_url}"
        
        # Define datasets for this source
        self.datasets = {{
            # Add your datasets here
            # 'dataset_name': 'api_endpoint',
        }}
    
    def fetch_all(self) -> Tuple[int, int]:
        """Fetch all datasets from {source_name}"""
        successful = 0
        failed = 0
        
        for dataset_name, endpoint in self.datasets.items():
            try:
                url = f"{{self.base_url}}{{endpoint}}"
                data = self._fetch_dataset(url, dataset_name)
                
                if data:
                    successful += 1
                    self.logger.info(f"✅ Successfully fetched {{dataset_name}}")
                else:
                    failed += 1
                    self.logger.error(f"❌ Failed to fetch {{dataset_name}}")
                    
            except Exception as e:
                failed += 1
                self.logger.error(f"❌ Error fetching {{dataset_name}}: {{str(e)}}")
        
        return successful, failed
    
    def _fetch_dataset(self, url: str, dataset_name: str) -> Dict:
        """Fetch a single dataset"""
        # Implement the specific fetching logic for this source
        # This is a template - customize based on the API structure
        
        response = self._make_request(url)
        if response and response.status_code == 200:
            data = response.json()
            
            # Save to cache
            cache_file = self.cache_dir / f"{{dataset_name}}.json"
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            return data
        
        return None
'''
            
            with open(fetcher_file, 'w', encoding='utf-8') as f:
                f.write(fetcher_template)
            
            self.logger.info(f"✅ Created fetcher class for {source_name}")
            
        except Exception as e:
            self.logger.error(f"Failed to create fetcher class: {str(e)}")

    def _update_main_py(self, source_name: str):
        """Update main.py to include the new data source"""
        try:
            main_py_file = Path('scripts/main.py')
            
            with open(main_py_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Add import
            import_line = f"from fetch.{source_name.lower()} import {source_name.title()}Fetcher\n"
            
            # Find the imports section
            imports_pattern = r'(from fetch import [^\n]+)'
            match = re.search(imports_pattern, content)
            
            if match:
                # Add after existing imports
                insert_pos = match.end()
                content = content[:insert_pos] + import_line + content[insert_pos:]
            
            # Add to fetch_data function
            fetch_pattern = r'(if \'norges-bank\' in sources:[\s\S]+?)(\n    return total_successful, total_failed)'
            match = re.search(fetch_pattern, content)
            
            if match:
                new_fetch_block = f'''
    if '{source_name.lower()}' in sources:
        logging.info("🔄 Fetching {source_name} data...")
        {source_name.lower()}_fetcher = {source_name.title()}Fetcher(cache_path)
        successful, failed = {source_name.lower()}_fetcher.fetch_all()
        total_successful += successful
        total_failed += failed'''
                
                insert_pos = match.start(2)
                content = content[:insert_pos] + new_fetch_block + content[insert_pos:]
            
            with open(main_py_file, 'w', encoding='utf-8') as f:
                f.write(content)
            
            self.logger.info(f"✅ Updated main.py for {source_name}")
            
        except Exception as e:
            self.logger.error(f"Failed to update main.py: {str(e)}")

    def generate_expansion_report(self) -> str:
        """Generate expansion report"""
        report = []
        report.append("=" * 60)
        report.append("RIKSDATA EXPANSION REPORT")
        report.append("=" * 60)
        report.append(f"Generated: {self.expansion_results['timestamp']}")
        report.append("")
        
        summary = self.expansion_results['summary']
        report.append("📊 EXPANSION SUMMARY")
        report.append("-" * 30)
        report.append(f"New sources added: {summary['sources_added']}")
        report.append(f"New datasets added: {summary['datasets_added']}")
        report.append(f"Failed expansions: {summary['failed']}")
        report.append("")
        
        if self.expansion_results['new_sources']:
            report.append("🆕 NEW DATA SOURCES")
            report.append("-" * 30)
            for source in self.expansion_results['new_sources']:
                report.append(f"  • {source['name']}: {source['base_url']}")
            report.append("")
        
        if self.expansion_results['new_datasets']:
            report.append("📈 NEW DATASETS")
            report.append("-" * 30)
            for dataset in self.expansion_results['new_datasets']:
                if dataset['type'] == 'ssb':
                    report.append(f"  • SSB {dataset['dataset_id']} -> {dataset['cache_name']} ({dataset['title']})")
                elif dataset['type'] == 'norges_bank':
                    report.append(f"  • Norges Bank {dataset['api_path']} -> {dataset['cache_name']} ({dataset['title']})")
                else:
                    report.append(f"  • Static {dataset['cache_name']} ({dataset['title']})")
            report.append("")
        
        if self.expansion_results['failed_expansions']:
            report.append("❌ FAILED EXPANSIONS")
            report.append("-" * 30)
            for failure in self.expansion_results['failed_expansions']:
                report.append(f"  • {failure.get('name', failure.get('dataset_id', failure.get('api_path', failure.get('cache_name'))))}: {failure['error']}")
            report.append("")
        
        report.append("=" * 60)
        
        return "\n".join(report)

    async def run_expansion_from_file(self, expansion_file: str) -> Dict:
        """Run expansion from a configuration file"""
        try:
            with open(expansion_file, 'r', encoding='utf-8') as f:
                expansion_config = json.load(f)
            
            self.logger.info(f"Running expansion from {expansion_file}")
            
            # Add new data sources
            for source in expansion_config.get('sources', []):
                await self.add_new_data_source(
                    source['name'],
                    source['base_url'],
                    source.get('description', '')
                )
            
            # Add new datasets
            for dataset in expansion_config.get('datasets', []):
                if dataset['type'] == 'ssb':
                    await self.add_ssb_dataset(
                        dataset['dataset_id'],
                        dataset['cache_name'],
                        dataset['title'],
                        dataset.get('description', ''),
                        dataset.get('chart_type', 'line')
                    )
                elif dataset['type'] == 'norges_bank':
                    await self.add_norges_bank_dataset(
                        dataset['api_path'],
                        dataset['cache_name'],
                        dataset['title'],
                        dataset.get('description', ''),
                        dataset.get('chart_type', 'line')
                    )
                elif dataset['type'] == 'static':
                    await self.add_static_dataset(
                        dataset['data'],
                        dataset['cache_name'],
                        dataset['title'],
                        dataset.get('description', ''),
                        dataset.get('chart_type', 'line')
                    )
            
            # Generate and save report
            report = self.generate_expansion_report()
            print(report)
            
            # Save detailed results
            results_file = Path('expansion_results.json')
            with open(results_file, 'w', encoding='utf-8') as f:
                json.dump(self.expansion_results, f, indent=2, default=str)
            
            self.logger.info(f"📊 Detailed expansion results saved to: {results_file}")
            
            return self.expansion_results
            
        except Exception as e:
            self.logger.error(f"Failed to run expansion from file: {str(e)}")
            return self.expansion_results

async def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Riksdata Data Expansion')
    parser.add_argument('--config-file', required=True,
                       help='Expansion configuration file (JSON)')
    parser.add_argument('--cache-dir', default='data/cached', 
                       help='Cache directory (default: data/cached)')
    parser.add_argument('--output', default='expansion_results.json',
                       help='Output file for detailed results')
    
    args = parser.parse_args()
    
    expander = RiksdataExpander(args.cache_dir)
    results = await expander.run_expansion_from_file(args.config_file)
    
    # Exit with error code if there are failed expansions
    if results['summary']['failed'] > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == '__main__':
    asyncio.run(main())
