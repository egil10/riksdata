#!/usr/bin/env python3
"""
Riksdata Main Script Runner
Orchestrates data fetching and validation
"""

import sys
import logging
import argparse
from pathlib import Path

# Add the scripts directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from fetch import SSBFetcher, NorgesBankFetcher
from validate import RiksdataValidator

def setup_logging(verbose=False):
    """Setup logging configuration"""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )

def fetch_data(cache_dir, sources=None):
    """Fetch data from specified sources"""
    cache_path = Path(cache_dir)
    cache_path.mkdir(parents=True, exist_ok=True)
    
    total_successful = 0
    total_failed = 0
    
    # Determine which sources to fetch
    if sources is None:
        sources = ['ssb', 'norges-bank']
    
    if 'ssb' in sources:
        logging.info("🔄 Fetching SSB data...")
        ssb_fetcher = SSBFetcher(cache_path)
        successful, failed = ssb_fetcher.fetch_all()
        total_successful += successful
        total_failed += failed
    
    if 'norges-bank' in sources:
        logging.info("🔄 Fetching Norges Bank data...")
        nb_fetcher = NorgesBankFetcher(cache_path)
        successful, failed = nb_fetcher.fetch_all()
        total_successful += successful
        total_failed += failed
    
    logging.info(f"\n📊 Fetch Summary:")
    logging.info(f"   Total successful: {total_successful}")
    logging.info(f"   Total failed: {total_failed}")
    
    return total_successful, total_failed

def validate_data(cache_dir):
    """Validate cached data"""
    logging.info("🔍 Validating cached data...")
    validator = RiksdataValidator(cache_dir)
    return validator.run_validation()

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='Riksdata Data Management')
    parser.add_argument('--cache-dir', default='data/cached', 
                       help='Cache directory (default: data/cached)')
    parser.add_argument('--sources', nargs='+', 
                       choices=['ssb', 'norges-bank'],
                       help='Data sources to fetch (default: all)')
    parser.add_argument('--fetch-only', action='store_true',
                       help='Only fetch data, skip validation')
    parser.add_argument('--validate-only', action='store_true',
                       help='Only validate data, skip fetching')
    parser.add_argument('--verbose', '-v', action='store_true',
                       help='Verbose logging')
    
    args = parser.parse_args()
    
    setup_logging(args.verbose)
    
    logging.info("🚀 Starting Riksdata data management...")
    
    try:
        # Fetch data
        if not args.validate_only:
            successful, failed = fetch_data(args.cache_dir, args.sources)
            if failed > 0:
                logging.warning(f"⚠️  {failed} fetches failed")
        
        # Validate data
        if not args.fetch_only:
            is_valid = validate_data(args.cache_dir)
            if is_valid:
                logging.info("✅ All data validation passed!")
            else:
                logging.error("❌ Data validation failed!")
                sys.exit(1)
        
        logging.info("🎉 Riksdata data management completed successfully!")
        
    except KeyboardInterrupt:
        logging.info("\n⏹️  Operation cancelled by user")
        sys.exit(1)
    except Exception as e:
        logging.error(f"💥 Unexpected error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
