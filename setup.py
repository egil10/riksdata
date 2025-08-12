#!/usr/bin/env python3
"""
Riksdata Setup Script
Easy setup and initialization for the Riksdata project
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True

def install_dependencies():
    """Install Python dependencies"""
    if not os.path.exists('requirements.txt'):
        print("❌ requirements.txt not found")
        return False
    
    return run_command('pip install -r requirements.txt', 'Installing Python dependencies')

def create_directories():
    """Create necessary directories"""
    directories = [
        'data/cached/ssb',
        'data/cached/norges-bank',
        'data/static',
        'tests',
        'docs'
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
    
    print("✅ Directories created")
    return True

def fetch_initial_data():
    """Fetch initial data"""
    return run_command('python scripts/main.py --fetch-only', 'Fetching initial data')

def validate_data():
    """Validate fetched data"""
    return run_command('python scripts/main.py --validate-only', 'Validating data')

def main():
    """Main setup function"""
    print("🚀 Riksdata Setup")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Create directories
    if not create_directories():
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Failed to install dependencies")
        sys.exit(1)
    
    # Fetch data
    print("\n📊 Data Setup")
    print("-" * 30)
    
    fetch_data = input("Fetch initial data? (y/n): ").lower().strip()
    if fetch_data in ['y', 'yes']:
        if not fetch_initial_data():
            print("⚠️  Data fetching failed, but setup can continue")
        
        validate_data_input = input("Validate fetched data? (y/n): ").lower().strip()
        if validate_data_input in ['y', 'yes']:
            validate_data()
    
    print("\n🎉 Setup completed!")
    print("\n📋 Next steps:")
    print("1. Start the local server: python -m http.server 8000")
    print("2. Open http://localhost:8000/src/html/ in your browser")
    print("3. To update data: python scripts/main.py")
    print("4. For help: python scripts/main.py --help")

if __name__ == '__main__':
    main()
