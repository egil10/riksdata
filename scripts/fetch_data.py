#!/usr/bin/env python3
"""
Riksdata Data Fetcher
Fetches and caches all API data for reliable local access
"""

import json
import os
import time
import requests
from datetime import datetime, timedelta
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RiksdataFetcher:
    def __init__(self):
        self.base_dir = Path(__file__).parent.parent
        self.cache_dir = self.base_dir / "data" / "cached"
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Create subdirectories
        (self.cache_dir / "ssb").mkdir(exist_ok=True)
        (self.cache_dir / "norges-bank").mkdir(exist_ok=True)
        
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Riksdata/1.0 (https://github.com/egil10/riksdata)'
        })
        
        # Rate limiting
        self.request_delay = 0.5  # 500ms between requests
        
    def fetch_with_retry(self, url, max_retries=3):
        """Fetch data with retry logic"""
        for attempt in range(max_retries):
            try:
                logger.info(f"Fetching {url} (attempt {attempt + 1})")
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                
                # Rate limiting
                time.sleep(self.request_delay)
                return response.json()
                
            except requests.exceptions.RequestException as e:
                logger.warning(f"Attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    raise
                time.sleep(2 ** attempt)  # Exponential backoff
    
    def save_data(self, data, filename):
        """Save data to cache file"""
        filepath = self.cache_dir / filename
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        logger.info(f"Saved {filepath}")
    
    def fetch_ssb_data(self):
        """Fetch all SSB datasets"""
        ssb_datasets = [
            {"id": "1086", "name": "cpi", "title": "Consumer Price Index"},
            {"id": "1054", "name": "unemployment", "title": "Unemployment Rate"},
            {"id": "1060", "name": "house-prices", "title": "House Price Index"},
            {"id": "26426", "name": "ppi", "title": "Producer Price Index"},
            {"id": "1124", "name": "wage", "title": "Wage Index"},
            {"id": "59012", "name": "gdp-growth", "title": "GDP Growth"},
            {"id": "58962", "name": "trade-balance", "title": "Trade Balance"},
            {"id": "95265", "name": "bankruptcies", "title": "Bankruptcies"},
            {"id": "49626", "name": "population-growth", "title": "Population Growth"},
            {"id": "26944", "name": "construction-costs", "title": "Construction Costs"},
            {"id": "27002", "name": "industrial-production", "title": "Industrial Production"},
            {"id": "1064", "name": "retail-sales", "title": "Retail Sales"},
            {"id": "179421", "name": "export-volume", "title": "Export Volume"},
            {"id": "179422", "name": "import-volume", "title": "Import Volume"},
            {"id": "166316", "name": "business-confidence", "title": "Business Confidence"},
            {"id": "166330", "name": "consumer-confidence", "title": "Consumer Confidence"},
            {"id": "95146", "name": "housing-starts", "title": "Housing Starts"},
            {"id": "172769", "name": "monetary-aggregates", "title": "Monetary Aggregates"},
            {"id": "166328", "name": "job-vacancies", "title": "Job Vacancies"},
            {"id": "166331", "name": "household-consumption", "title": "Household Consumption"},
            {"id": "26427", "name": "producer-prices", "title": "Producer Prices"},
            {"id": "924808", "name": "construction-production", "title": "Construction Production"},
            {"id": "166326", "name": "credit-indicator", "title": "Credit Indicator"},
            {"id": "928196", "name": "energy-consumption", "title": "Energy Consumption"},
            {"id": "928194", "name": "government-revenue", "title": "Government Revenue"},
            {"id": "924820", "name": "international-accounts", "title": "International Accounts"},
            {"id": "760065", "name": "labour-cost-index", "title": "Labour Cost Index"},
            {"id": "61819", "name": "rd-expenditure", "title": "R&D Expenditure"},
            {"id": "1122", "name": "salmon-export", "title": "Salmon Export Value"},
            {"id": "166334", "name": "oil-gas-investment", "title": "Oil & Gas Investment"},
            {"id": "48651", "name": "immigration-rate", "title": "Immigration Rate"},
            {"id": "56900", "name": "household-income", "title": "Household Income"},
            {"id": "102811", "name": "life-expectancy", "title": "Life Expectancy"},
            {"id": "97445", "name": "crime-rate", "title": "Crime Rate"},
            {"id": "85454", "name": "education-level", "title": "Education Level"},
            {"id": "65962", "name": "holiday-property-sales", "title": "Holiday Property Sales"},
            {"id": "832678", "name": "greenhouse-gas", "title": "Greenhouse Gas Emissions"},
            {"id": "934513", "name": "economic-forecasts", "title": "Economic Forecasts"},
            {"id": "26158", "name": "new-dwellings-price", "title": "New Dwellings Price"},
            {"id": "832683", "name": "lifestyle-habits", "title": "Lifestyle Habits"},
            {"id": "832685", "name": "long-term-illness", "title": "Long-term Illness"},
            {"id": "1104", "name": "population-growth-alt", "title": "Population Growth Alt"},
            {"id": "1106", "name": "births-deaths", "title": "Births and Deaths"},
            {"id": "1118", "name": "cpi-ate", "title": "CPI-ATE Index"},
            {"id": "1120", "name": "salmon-export-volume", "title": "Salmon Export Volume"},
            {"id": "1126", "name": "basic-salary", "title": "Basic Salary Index"},
            {"id": "1130", "name": "export-country", "title": "Export by Country"},
            {"id": "1132", "name": "import-country", "title": "Import by Country"},
            {"id": "1134", "name": "export-commodity", "title": "Export by Commodity"},
            {"id": "1140", "name": "import-commodity", "title": "Import by Commodity"},
            {"id": "1056", "name": "construction-cost-wood", "title": "Construction Cost Wood"},
            {"id": "1058", "name": "construction-cost-multi", "title": "Construction Cost Multi"},
            {"id": "1065", "name": "wholesale-retail", "title": "Wholesale Retail Sales"},
            {"id": "1068", "name": "household-types", "title": "Household Types"},
            {"id": "1074", "name": "population-age", "title": "Population by Age"},
            {"id": "1084", "name": "cpi-coicop", "title": "CPI Coicop Divisions"},
            {"id": "1090", "name": "cpi-subgroups", "title": "CPI Sub-groups"},
            {"id": "1096", "name": "cpi-items", "title": "CPI Items"},
            {"id": "1100", "name": "cpi-delivery", "title": "CPI Delivery Sectors"},
            {"id": "56957", "name": "household-income-size", "title": "Household Income Size"},
            {"id": "85440", "name": "cohabiting-arrangements", "title": "Cohabiting Arrangements"},
            {"id": "95177", "name": "utility-floor-space", "title": "Utility Floor Space"},
            {"id": "166327", "name": "credit-indicator-c2", "title": "Credit Indicator C2"},
            {"id": "166329", "name": "job-vacancies-new", "title": "Job Vacancies New"},
            {"id": "124322", "name": "oil-gas-turnover", "title": "Oil Gas Turnover"},
            {"id": "179415", "name": "trade-volume-price", "title": "Trade Volume Price"},
            {"id": "741023", "name": "producer-price-industry", "title": "Producer Price Industry"},
            {"id": "567324", "name": "deaths-age", "title": "Deaths by Age"},
            {"id": "924809", "name": "construction-production-alt", "title": "Construction Production Alt"},
            {"id": "924816", "name": "bankruptcies-total", "title": "Bankruptcies Total"},
            {"id": "928197", "name": "energy-accounts", "title": "Energy Accounts"},
            {"id": "172793", "name": "monetary-m3", "title": "Monetary Aggregate M3"},
            {"id": "25139", "name": "new-dwellings-price-alt", "title": "New Dwellings Price Alt"},
            {"id": "166317", "name": "business-tendency", "title": "Business Tendency Survey"}
        ]
        
        logger.info(f"Fetching {len(ssb_datasets)} SSB datasets...")
        
        for dataset in ssb_datasets:
            try:
                url = f"https://data.ssb.no/api/v0/dataset/{dataset['id']}.json?lang=en"
                data = self.fetch_with_retry(url)
                
                # Add metadata
                data['_metadata'] = {
                    'source': 'SSB',
                    'dataset_id': dataset['id'],
                    'title': dataset['title'],
                    'fetched_at': datetime.now().isoformat(),
                    'url': url
                }
                
                filename = f"ssb/{dataset['name']}.json"
                self.save_data(data, filename)
                
            except Exception as e:
                logger.error(f"Failed to fetch SSB dataset {dataset['id']}: {e}")
    
    def fetch_norges_bank_data(self):
        """Fetch Norges Bank datasets"""
        norges_bank_datasets = [
            {
                "name": "exchange-rates",
                "url": "https://data.norges-bank.no/api/data/EXR/M.USD+EUR.NOK.SP?format=sdmx-json&startPeriod=2015-08-11&endPeriod=2025-08-01&locale=no",
                "title": "Exchange Rates"
            },
            {
                "name": "interest-rate",
                "url": "https://data.norges-bank.no/api/data/IR/M.KPRA..?format=sdmx-json&startPeriod=2000-01-01&endPeriod=2025-08-01&locale=no",
                "title": "Key Policy Rate"
            },
            {
                "name": "government-debt",
                "url": "https://data.norges-bank.no/api/data/GOVT_KEYFIGURES/V_O+N_V+V_I+ATRI+V_IRS..B.GBON?endPeriod=2025-08-01&format=sdmx-json&locale=no&startPeriod=2000-01-01",
                "title": "Government Debt"
            }
        ]
        
        logger.info(f"Fetching {len(norges_bank_datasets)} Norges Bank datasets...")
        
        for dataset in norges_bank_datasets:
            try:
                data = self.fetch_with_retry(dataset['url'])
                
                # Add metadata
                data['_metadata'] = {
                    'source': 'Norges Bank',
                    'title': dataset['title'],
                    'fetched_at': datetime.now().isoformat(),
                    'url': dataset['url']
                }
                
                filename = f"norges-bank/{dataset['name']}.json"
                self.save_data(data, filename)
                
            except Exception as e:
                logger.error(f"Failed to fetch Norges Bank dataset {dataset['name']}: {e}")
    
    def create_metadata(self):
        """Create metadata file with cache information"""
        metadata = {
            'cache_created_at': datetime.now().isoformat(),
            'total_datasets': 0,
            'datasets': {},
            'last_update': datetime.now().isoformat()
        }
        
        # Count files and get info
        for filepath in self.cache_dir.rglob('*.json'):
            if filepath.name != 'metadata.json':
                relative_path = filepath.relative_to(self.cache_dir)
                stat = filepath.stat()
                
                metadata['datasets'][str(relative_path)] = {
                    'size_bytes': stat.st_size,
                    'modified_at': datetime.fromtimestamp(stat.st_mtime).isoformat()
                }
                metadata['total_datasets'] += 1
        
        self.save_data(metadata, 'metadata.json')
        logger.info(f"Created metadata with {metadata['total_datasets']} datasets")
    
    def run(self):
        """Run the complete data fetching process"""
        logger.info("Starting Riksdata data fetch...")
        
        try:
            self.fetch_ssb_data()
            self.fetch_norges_bank_data()
            self.create_metadata()
            
            logger.info("Data fetching completed successfully!")
            
        except Exception as e:
            logger.error(f"Data fetching failed: {e}")
            raise

if __name__ == "__main__":
    fetcher = RiksdataFetcher()
    fetcher.run()

