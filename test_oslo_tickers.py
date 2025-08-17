#!/usr/bin/env python3
"""
Test script to check available Oslo stock indices on Yahoo Finance
"""

import yfinance as yf
import time

def test_ticker(ticker_symbol):
    """Test if a ticker is available"""
    try:
        print(f"Testing {ticker_symbol}...")
        ticker = yf.Ticker(ticker_symbol)
        info = ticker.info
        
        if info and 'regularMarketPrice' in info and info['regularMarketPrice']:
            print(f"✅ {ticker_symbol}: {info.get('longName', 'Unknown')} - Price: {info['regularMarketPrice']}")
            return True
        else:
            print(f"❌ {ticker_symbol}: No data available")
            return False
            
    except Exception as e:
        print(f"❌ {ticker_symbol}: Error - {str(e)}")
        return False

def main():
    """Test various Oslo indices"""
    print("Testing Oslo Stock Exchange indices...")
    print("="*50)
    
    # Common Oslo indices to test
    tickers_to_test = [
        "^OSEAX",      # Oslo Stock Exchange All Share Index
        "^OSEBX",      # Oslo Stock Exchange Benchmark Index
        "OSEAX.OL",    # Alternative format
        "OSEBX.OL",    # Alternative format
        "^OSEFX",      # Oslo Stock Exchange Focus Index
        "^OSEGX",      # Oslo Stock Exchange Global Index
        "OSEFX.OL",
        "OSEGX.OL",
        "OSLO.OL",     # Oslo Børs
        "OSEBX.HE",    # Helsinki exchange
        "OSEBX.ST",    # Stockholm exchange
        "OSEBX.IC",    # Iceland exchange
    ]
    
    successful_tickers = []
    
    for ticker in tickers_to_test:
        if test_ticker(ticker):
            successful_tickers.append(ticker)
        time.sleep(2)  # Delay to avoid rate limiting
    
    print("\n" + "="*50)
    print("SUMMARY")
    print("="*50)
    print(f"Successful tickers: {successful_tickers}")
    
    if successful_tickers:
        print("\nRecommended tickers for the dashboard:")
        for ticker in successful_tickers:
            print(f"  - {ticker}")

if __name__ == "__main__":
    main()
