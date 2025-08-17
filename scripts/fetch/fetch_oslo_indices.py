#!/usr/bin/env python3
"""
OSLO Stock Indices Fetcher
Fetches OSEAX and OSEBX data using yfinance and saves to JSON format.
Handles rate limits by fetching data in multiple rounds with delays.
"""

import yfinance as yf
import pandas as pd
import json
import os
import time
from datetime import datetime, timedelta
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class OsloIndicesFetcher:
    def __init__(self, cache_dir="data/cached"):
        self.cache_dir = cache_dir
        self.oslo_dir = os.path.join(cache_dir, "oslo-indices")
        
        # Create directories if they don't exist
        os.makedirs(self.cache_dir, exist_ok=True)
        os.makedirs(self.oslo_dir, exist_ok=True)
        
        # Oslo indices tickers
        self.indices = {
            "OSEAX": "OSEAX.OL",  # Oslo Stock Exchange All Share Index
            "OSEBX": "OSEBX.OL"   # Oslo Stock Exchange Benchmark Index
        }
        
        # Alternative tickers to try for OSEBX
        self.alternative_tickers = {
            "OSEBX": ["OSEBX.OL", "OSEBX.HE", "OSEBX.ST", "OSEBX.IC"]
        }
        
        # Rate limiting settings
        self.delay_between_requests = 5  # seconds
        self.max_retries = 3
        self.retry_delay = 30  # seconds after rate limit hit
    
    def load_existing_data(self, index_name):
        """Load existing data if available"""
        filename = f"{index_name.lower()}.json"
        filepath = os.path.join(self.oslo_dir, filename)
        
        if os.path.exists(filepath):
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
                logger.info(f"Loaded existing data for {index_name}: {len(existing_data.get('data', []))} points")
                return existing_data
            except Exception as e:
                logger.warning(f"Failed to load existing data for {index_name}: {e}")
        
        return None
    
    def merge_data(self, existing_data, new_data):
        """Merge existing and new data, removing duplicates"""
        if not existing_data or not new_data:
            return new_data or existing_data
        
        existing_points = existing_data.get('data', [])
        new_points = new_data.get('data', [])
        
        # Create a set of existing dates for quick lookup
        existing_dates = {point['date'] for point in existing_points}
        
        # Add only new points that don't exist
        merged_points = existing_points.copy()
        for point in new_points:
            if point['date'] not in existing_dates:
                merged_points.append(point)
                existing_dates.add(point['date'])
        
        # Sort by date
        merged_points.sort(key=lambda x: x['date'])
        
        # Update metadata
        merged_data = existing_data.copy()
        merged_data['data'] = merged_points
        merged_data['metadata']['data_points'] = len(merged_points)
        merged_data['metadata']['last_updated'] = datetime.now().isoformat()
        
        if merged_points:
            merged_data['metadata']['date_range'] = {
                "start": merged_points[0]["date"],
                "end": merged_points[-1]["date"]
            }
        
        return merged_data
    
    def fetch_index_data_with_retry(self, ticker_symbol, index_name, retry_count=0):
        """Fetch data for a specific index with retry logic"""
        try:
            logger.info(f"Fetching data for {index_name} ({ticker_symbol}) - attempt {retry_count + 1}")
            
            # Add delay between requests to avoid rate limiting
            if retry_count > 0:
                time.sleep(self.delay_between_requests)
            
            # Fetch data from yfinance
            ticker = yf.Ticker(ticker_symbol)
            
            # Get historical data (monthly frequency, as far back as possible)
            data = ticker.history(period="max", interval="1mo")
            
            if data.empty:
                logger.warning(f"No data found for {index_name} ({ticker_symbol})")
                return None
            
            # Convert to the format expected by the dashboard
            formatted_data = []
            
            for date, row in data.iterrows():
                formatted_data.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "value": float(row['Close']),
                    "volume": int(row['Volume']) if pd.notna(row['Volume']) else None,
                    "open": float(row['Open']) if pd.notna(row['Open']) else None,
                    "high": float(row['High']) if pd.notna(row['High']) else None,
                    "low": float(row['Low']) if pd.notna(row['Low']) else None
                })
            
            # Create metadata
            metadata = {
                "source": "Yahoo Finance",
                "ticker": ticker_symbol,
                "name": index_name,
                "description": f"{index_name} - Oslo Stock Exchange Index",
                "frequency": "monthly",
                "last_updated": datetime.now().isoformat(),
                "data_points": len(formatted_data),
                "date_range": {
                    "start": formatted_data[0]["date"] if formatted_data else None,
                    "end": formatted_data[-1]["date"] if formatted_data else None
                }
            }
            
            # Create final data structure
            result = {
                "metadata": metadata,
                "data": formatted_data
            }
            
            logger.info(f"Successfully fetched {len(formatted_data)} data points for {index_name}")
            return result
            
        except Exception as e:
            error_msg = str(e).lower()
            if "rate limit" in error_msg or "too many requests" in error_msg:
                logger.warning(f"Rate limit hit for {index_name} ({ticker_symbol})")
                if retry_count < self.max_retries:
                    logger.info(f"Waiting {self.retry_delay} seconds before retry...")
                    time.sleep(self.retry_delay)
                    return self.fetch_index_data_with_retry(ticker_symbol, index_name, retry_count + 1)
                else:
                    logger.error(f"Max retries reached for {index_name} ({ticker_symbol})")
                    return None
            else:
                logger.error(f"Error fetching data for {index_name} ({ticker_symbol}): {str(e)}")
                return None
    
    def fetch_index_in_rounds(self, index_name, ticker_symbols):
        """Fetch data for an index trying multiple tickers in rounds"""
        logger.info(f"Starting multi-round fetch for {index_name}")
        
        # Load existing data
        existing_data = self.load_existing_data(index_name)
        
        for round_num, ticker_symbol in enumerate(ticker_symbols):
            logger.info(f"Round {round_num + 1}/{len(ticker_symbols)}: Trying {ticker_symbol}")
            
            # Add delay between rounds
            if round_num > 0:
                logger.info(f"Waiting {self.delay_between_requests} seconds between rounds...")
                time.sleep(self.delay_between_requests)
            
            # Try to fetch data
            new_data = self.fetch_index_data_with_retry(ticker_symbol, index_name)
            
            if new_data:
                # Merge with existing data
                merged_data = self.merge_data(existing_data, new_data)
                
                # Save merged data
                filename = f"{index_name.lower()}.json"
                filepath = os.path.join(self.oslo_dir, filename)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(merged_data, f, indent=2, ensure_ascii=False)
                
                logger.info(f"Successfully saved {index_name} data: {len(merged_data['data'])} total points")
                
                return {
                    "success": True,
                    "filepath": filepath,
                    "data_points": len(merged_data['data']),
                    "ticker_used": ticker_symbol,
                    "round": round_num + 1
                }
            else:
                logger.warning(f"Failed to fetch data for {index_name} using {ticker_symbol}")
        
        # If we get here, all tickers failed
        logger.error(f"All tickers failed for {index_name}")
        return {
            "success": False,
            "error": f"Failed to fetch {index_name} data with all tickers"
        }
    
    def fetch_all(self):
        """Fetch data for all Oslo indices in multiple rounds"""
        results = {}
        
        for index_name, ticker_symbol in self.indices.items():
            logger.info(f"\n{'='*50}")
            logger.info(f"Processing {index_name}")
            logger.info(f"{'='*50}")
            
            # Create list of tickers to try (primary + alternatives)
            ticker_symbols = [ticker_symbol]
            if index_name in self.alternative_tickers:
                ticker_symbols.extend(self.alternative_tickers[index_name])
            
            result = self.fetch_index_in_rounds(index_name, ticker_symbols)
            results[index_name] = result
            
            # Add delay between different indices
            if index_name != list(self.indices.keys())[-1]:  # Not the last one
                logger.info(f"Waiting {self.delay_between_requests} seconds before next index...")
                time.sleep(self.delay_between_requests)
        
        return results
    
    def update_metadata(self):
        """Update the main metadata.json file to include Oslo indices"""
        metadata_file = os.path.join(self.cache_dir, "metadata.json")
        
        # Read existing metadata
        if os.path.exists(metadata_file):
            with open(metadata_file, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
        else:
            metadata = {
                "cache_created_at": datetime.now().isoformat(),
                "total_datasets": 0,
                "datasets": {}
            }
        
        # Add Oslo indices to metadata
        for index_name in self.indices.keys():
            filename = f"oslo-indices/{index_name.lower()}.json"
            filepath = os.path.join(self.oslo_dir, f"{index_name.lower()}.json")
            
            if os.path.exists(filepath):
                file_size = os.path.getsize(filepath)
                modified_time = datetime.fromtimestamp(os.path.getmtime(filepath)).isoformat()
                
                metadata["datasets"][filename] = {
                    "size_bytes": file_size,
                    "modified_at": modified_time
                }
        
        # Update total count
        metadata["total_datasets"] = len(metadata["datasets"])
        metadata["cache_created_at"] = datetime.now().isoformat()
        
        # Save updated metadata
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Updated metadata file: {metadata_file}")

def main():
    """Main function to run the fetcher"""
    logger.info("Starting Oslo Indices data fetch with rate limit handling...")
    logger.info("This will fetch data in multiple rounds to avoid rate limits.")
    
    fetcher = OsloIndicesFetcher()
    results = fetcher.fetch_all()
    
    # Print results
    print("\n" + "="*60)
    print("OSLO INDICES FETCH RESULTS")
    print("="*60)
    
    for index_name, result in results.items():
        if result["success"]:
            ticker_info = f" (using {result.get('ticker_used', 'unknown')} in round {result.get('round', 'unknown')})"
            print(f"✅ {index_name}: {result['data_points']} data points saved{ticker_info}")
        else:
            print(f"❌ {index_name}: {result['error']}")
    
    # Update metadata
    fetcher.update_metadata()
    
    print("\n" + "="*60)
    print("Fetch completed!")
    print("="*60)

if __name__ == "__main__":
    main()
