#!/usr/bin/env python3
"""
OSLO Stock Indices Fetcher
Fetches OSEAX and OSEBX data using yfinance and saves to JSON format.
"""

import yfinance as yf
import pandas as pd
import json
import os
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
            "OSEAX": "^OSEAX",  # Oslo Stock Exchange All Share Index
            "OSEBX": "^OSEBX"   # Oslo Stock Exchange Benchmark Index
        }
        
        # Alternative tickers to try for OSEBX
        self.alternative_tickers = {
            "OSEBX": ["OSEBX.OL", "OSEBX.HE", "OSEBX.ST", "OSEBX.IC"]
        }
    
    def fetch_index_data(self, ticker_symbol, index_name):
        """Fetch data for a specific index"""
        try:
            logger.info(f"Fetching data for {index_name} ({ticker_symbol})")
            
            # Fetch data from yfinance
            ticker = yf.Ticker(ticker_symbol)
            
            # Get historical data (monthly frequency, as far back as possible)
            data = ticker.history(period="max", interval="1mo")
            
            if data.empty:
                logger.warning(f"No data found for {index_name}")
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
            
            return result
            
        except Exception as e:
            logger.error(f"Error fetching data for {index_name}: {str(e)}")
            return None
    
    def fetch_all(self):
        """Fetch data for all Oslo indices"""
        results = {}
        
        for index_name, ticker_symbol in self.indices.items():
            data = self.fetch_index_data(ticker_symbol, index_name)
            
            # If primary ticker fails, try alternative tickers
            if not data and index_name in self.alternative_tickers:
                logger.info(f"Primary ticker failed for {index_name}, trying alternatives...")
                for alt_ticker in self.alternative_tickers[index_name]:
                    logger.info(f"Trying alternative ticker: {alt_ticker}")
                    data = self.fetch_index_data(alt_ticker, index_name)
                    if data:
                        logger.info(f"Success with alternative ticker: {alt_ticker}")
                        break
            
            if data:
                # Save to file
                filename = f"{index_name.lower()}.json"
                filepath = os.path.join(self.oslo_dir, filename)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                
                logger.info(f"Saved {index_name} data to {filepath}")
                results[index_name] = {
                    "success": True,
                    "filepath": filepath,
                    "data_points": len(data["data"])
                }
            else:
                results[index_name] = {
                    "success": False,
                    "error": f"Failed to fetch {index_name} data with all tickers"
                }
        
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
    logger.info("Starting Oslo Indices data fetch...")
    
    fetcher = OsloIndicesFetcher()
    results = fetcher.fetch_all()
    
    # Print results
    print("\n" + "="*50)
    print("OSLO INDICES FETCH RESULTS")
    print("="*50)
    
    for index_name, result in results.items():
        if result["success"]:
            print(f"✅ {index_name}: {result['data_points']} data points saved")
        else:
            print(f"❌ {index_name}: {result['error']}")
    
    # Update metadata
    fetcher.update_metadata()
    
    print("\n" + "="*50)
    print("Fetch completed!")
    print("="*50)

if __name__ == "__main__":
    main()
