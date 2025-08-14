#!/usr/bin/env python3
"""
Norges Bank Data Fetcher
Fetches data from Norges Bank API
"""

import logging
from .base import BaseFetcher

class NorgesBankFetcher(BaseFetcher):
    def __init__(self, cache_dir):
        super().__init__(cache_dir / "norges-bank")
        self.base_url = "https://data.norges-bank.no/api/data"
        
        # Norges Bank datasets
        self.datasets = [
            {
                "name": "exchange-rates",
                "url": "https://data.norges-bank.no/api/data/EXR/M.USD+EUR.NOK.SP?format=sdmx-json&startPeriod=2015-08-11&endPeriod=2025-08-01&locale=no",
                "title": "Exchange Rates"
            },
            {
                "name": "interest-rate",
                "url": "https://data.norges-bank.no/api/data/IR/M.KPRA.SD.?format=sdmx-json&startPeriod=2000-01-01&endPeriod=2025-08-01&locale=en",
                "title": "Key Policy Rate"
            },
            {
                "name": "government-debt",
                "url": "https://data.norges-bank.no/api/data/GOVT_KEYFIGURES/V_O+N_V+V_I+ATRI+V_IRS..B.GBON?endPeriod=2025-08-01&format=sdmx-json&locale=no&startPeriod=2000-01-01",
                "title": "Government Debt"
            }
        ]
    
    def fetch_all(self):
        """Fetch all Norges Bank datasets"""
        logging.info(f"Fetching {len(self.datasets)} Norges Bank datasets...")
        
        successful_fetches = 0
        failed_fetches = 0
        
        for dataset in self.datasets:
            try:
                data = self.fetch_with_retry(dataset['url'])
                
                # Add metadata
                data = self.add_metadata(data, 'Norges Bank', dataset['title'], dataset['url'])
                
                filename = f"{dataset['name']}.json"
                self.save_data(data, filename)
                successful_fetches += 1
                
            except Exception as e:
                logging.error(f"Failed to fetch Norges Bank dataset {dataset['name']}: {e}")
                failed_fetches += 1
        
        logging.info(f"Norges Bank fetch completed: {successful_fetches} successful, {failed_fetches} failed")
        return successful_fetches, failed_fetches
