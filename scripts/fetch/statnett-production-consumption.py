#!/usr/bin/env python3
"""
Statnett Production and Consumption Data Fetcher

Fetches electricity production and consumption data from Statnett's REST API.
Data includes daily production and consumption values from 2012 onwards.

API Documentation: https://driftsdata.statnett.no/restapi
"""

import requests
import json
import os
from datetime import datetime, timedelta
import time

class StatnettDataFetcher:
    def __init__(self, cache_dir="../../data/cached"):
        self.cache_dir = cache_dir
        self.data_dir = os.path.join(cache_dir, "statnett")
        self.base_url = "https://driftsdata.statnett.no/restapi"
        
        # Create directory if it doesn't exist
        os.makedirs(self.data_dir, exist_ok=True)
    
    def fetch_production_consumption_data(self, start_date="2012-01-01"):
        """
        Fetch production and consumption data from Statnett API
        
        Args:
            start_date (str): Start date in YYYY-MM-DD format
        """
        url = f"{self.base_url}/ProductionConsumption/GetData"
        params = {"From": start_date}
        
        try:
            print(f"Fetching Statnett production/consumption data from {start_date}...")
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            # Save raw data
            output_file = os.path.join(self.data_dir, "production-consumption.json")
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Data saved to {output_file}")
            
            # Print summary statistics
            if 'ProductionConsumptionSidebarViewModel' in data:
                stats = data['ProductionConsumptionSidebarViewModel']
                print(f"📊 Production: avg={stats['production']['avg']:.0f}, max={stats['production']['max']:.0f}")
                print(f"📊 Consumption: avg={stats['consumption']['avg']:.0f}, max={stats['consumption']['max']:.0f}")
            
            return data
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Error fetching data: {e}")
            return None
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing JSON: {e}")
            return None
    
    def fetch_latest_detailed_overview(self):
        """
        Fetch the latest detailed overview data
        """
        url = f"{self.base_url}/ProductionConsumption/GetLatestDetailedOverview"
        
        try:
            print("Fetching latest detailed overview...")
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            # Save raw data
            output_file = os.path.join(self.data_dir, "latest-detailed-overview.json")
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Latest overview saved to {output_file}")
            return data
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Error fetching latest overview: {e}")
            return None
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing JSON: {e}")
            return None
    
    def fetch_all_data(self):
        """
        Fetch all available Statnett data
        """
        print("🚀 Starting Statnett data fetch...")
        
        # Fetch main production/consumption data
        main_data = self.fetch_production_consumption_data()
        
        # Fetch latest detailed overview
        latest_data = self.fetch_latest_detailed_overview()
        
        # Create metadata
        metadata = {
            "source": "Statnett",
            "description": "Norwegian electricity production and consumption data",
            "api_base_url": self.base_url,
            "last_updated": datetime.now().isoformat(),
            "datasets": {
                "production-consumption": {
                    "description": "Daily production and consumption data from 2012",
                    "file": "production-consumption.json",
                    "data_points": len(main_data.get('Production', [])) if main_data else 0
                },
                "latest-detailed-overview": {
                    "description": "Latest detailed overview data",
                    "file": "latest-detailed-overview.json",
                    "data_points": 1 if latest_data else 0
                }
            }
        }
        
        # Save metadata
        metadata_file = os.path.join(self.data_dir, "metadata.json")
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Metadata saved to {metadata_file}")
        print("🎉 Statnett data fetch completed!")
        
        return main_data, latest_data

def main():
    """Main function to run the fetcher"""
    fetcher = StatnettDataFetcher()
    fetcher.fetch_all_data()

if __name__ == "__main__":
    main()
