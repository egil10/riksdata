#!/usr/bin/env python3
"""
Riksdata Cache Setup
Initializes the cache system and fetches initial data
"""

import os
import sys
from pathlib import Path

# Add the parent directory to the path so we can import our modules
sys.path.append(str(Path(__file__).parent.parent))

from scripts.fetch_data import RiksdataFetcher
from scripts.validate_data import RiksdataValidator

def main():
    print("🚀 Setting up Riksdata cache system...")
    
    # Create necessary directories
    base_dir = Path(__file__).parent.parent
    cache_dir = base_dir / "data" / "cached"
    static_dir = base_dir / "data" / "static"
    
    # Create directories
    cache_dir.mkdir(parents=True, exist_ok=True)
    (cache_dir / "ssb").mkdir(exist_ok=True)
    (cache_dir / "norges-bank").mkdir(exist_ok=True)
    static_dir.mkdir(exist_ok=True)
    
    print("📁 Created cache directories")
    
    # Initialize fetcher
    fetcher = RiksdataFetcher()
    
    print("🔄 Starting data fetch...")
    print("⚠️  This may take several minutes due to rate limiting...")
    
    try:
        # Fetch data
        fetcher.run()
        print("✅ Data fetching completed!")
        
    except Exception as e:
        print(f"❌ Data fetching failed: {e}")
        print("🔄 Continuing with validation of any data that was fetched...")
    
    # Validate what we have
    print("🔍 Validating cached data...")
    validator = RiksdataValidator()
    
    try:
        success = validator.run_validation()
        
        if success:
            print("🎉 Cache setup completed successfully!")
            print(f"📊 Data is available in: {cache_dir}")
        else:
            print("⚠️  Cache setup completed with some validation issues")
            print("💡 You can still use the website, but some charts may not load")
            
    except Exception as e:
        print(f"❌ Validation failed: {e}")
    
    print("\n📋 Next steps:")
    print("1. Open index.html in your browser")
    print("2. The website will now use cached data instead of live API calls")
    print("3. To update data, run: python scripts/fetch-data.py")
    print("4. To validate data, run: python scripts/validate-data.py")

if __name__ == "__main__":
    main()

