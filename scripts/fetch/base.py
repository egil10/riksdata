#!/usr/bin/env python3
"""
Base Data Fetcher Class
Provides common functionality for all data fetchers
"""

import json
import os
import time
import requests
from datetime import datetime
from pathlib import Path
import logging

class BaseFetcher:
    def __init__(self, cache_dir):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Riksdata/1.0 (https://github.com/egil10/riksdata)'
        })
        
        # Conservative rate limiting to avoid 429 errors
        self.request_delay = 2.0  # 2 seconds between requests
        
    def fetch_with_retry(self, url, max_retries=5):
        """Fetch data with retry logic and exponential backoff"""
        for attempt in range(max_retries):
            try:
                logging.info(f"Fetching {url} (attempt {attempt + 1})")
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                
                # Rate limiting - longer delay
                time.sleep(self.request_delay)
                return response.json()
                
            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 429:
                    # Rate limited - wait longer
                    wait_time = (2 ** attempt) * 5  # 5, 10, 20, 40, 80 seconds
                    logging.warning(f"Rate limited, waiting {wait_time} seconds...")
                    time.sleep(wait_time)
                else:
                    logging.warning(f"HTTP error {e.response.status_code}: {e}")
                    if attempt == max_retries - 1:
                        raise
                    time.sleep(2 ** attempt)
            except requests.exceptions.RequestException as e:
                logging.warning(f"Attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    raise
                time.sleep(2 ** attempt)  # Exponential backoff
    
    def save_data(self, data, filename):
        """Save data to cache file"""
        filepath = self.cache_dir / filename
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        logging.info(f"Saved {filepath}")
    
    def add_metadata(self, data, source, title, url):
        """Add metadata to data object"""
        data['_metadata'] = {
            'source': source,
            'title': title,
            'fetched_at': datetime.now().isoformat(),
            'url': url
        }
        return data
