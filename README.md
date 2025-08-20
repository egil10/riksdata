# Riksdata

A comprehensive Norwegian economic data dashboard with political party-colored charts, featuring data from Statistics Norway (SSB), Norges Bank, and NVE (Norwegian Water Resources and Energy Directorate). Features an optimized light/dark mode toggle for instant theme switching.

## 🏗️ Project Structure

```
riksdata/
├── index.html             # Main application (GitHub Pages entry point)
├── src/                   # Source files
│   ├── js/               # JavaScript modules
│   │   ├── main.js       # Main application logic
│   │   ├── charts.js     # Chart rendering and data parsing
│   │   ├── utils.js      # Utility functions
│   │   └── config.js     # Configuration and constants
│   ├── css/              # Stylesheets
│   │   └── main.css      # Main stylesheet
│   └── html/             # HTML files (development version)
│       └── index.html    # Development version
├── data/                 # Data files
│   ├── cached/           # Cached API data (git-ignored)
│   │   ├── ssb/          # SSB datasets
│   │   ├── norges-bank/  # Norges Bank datasets
│   │   ├── nve/          # NVE datasets (reservoir data)
│   │   └── metadata.json # Cache metadata
│   └── static/           # Static data files
├── scripts/              # Python scripts
│   ├── fetch/            # Data fetching scripts
│   │   ├── fetch_oslo_indices.py # Oslo indices fetcher
│   │   └── README.md     # Scripts documentation
│   ├── requirements.txt  # Python dependencies
│   └── README.md         # Scripts documentation
├── tests/                # Test files
│   ├── test_cache.html   # Cache testing
│   ├── debug.html        # Debug utilities
│   └── test-modules.html # Module loading test
├── docs/                 # Documentation
│   ├── README.md         # Main documentation
│   ├── API.md            # API documentation
│   └── CACHE_STATUS.md   # Cache status
├── .gitignore
├── requirements.txt
└── setup.py              # Setup script
```

## 🚀 Quick Start

### 1. Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/riksdata.git
cd riksdata

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Fetch Data

```bash
# Fetch Oslo indices data
cd scripts
python fetch/fetch_oslo_indices.py

# Install dependencies (if needed)
pip install -r requirements.txt
```

**Note**: The original SSB and Norges Bank data fetching scripts are not included in this repository. The Oslo indices fetcher is available in the `scripts/` directory.

### 3. Run the Website

#### Local Development
```bash
# Start local server
python -m http.server 8000

# Open in browser (root version - recommended)
open http://localhost:8000/

# Or open development version
open http://localhost:8000/src/html/
```

#### GitHub Pages Deployment
The website is automatically deployed to GitHub Pages from the `main` branch. The `index.html` in the root directory serves as the entry point.

**Important**: 
- The root `index.html` is configured for GitHub Pages deployment
- The `src/html/index.html` is for local development testing

#### Debug Cache Issues
If you encounter loading problems, visit the diagnostics page:
```bash
# Local development
open http://localhost:8000/tests/debug-cache.html

# GitHub Pages
open https://egil10.github.io/riksdata/tests/debug-cache.html
```

This page will test all cache files and show which ones are missing or causing errors.
- Both versions use the same JavaScript modules and CSS files

## 📊 Features

### Data Sources
- **Statistics Norway (SSB)**: 67+ economic indicators
- **Norges Bank**: Exchange rates, interest rates, government debt
- **Statnett**: Electricity production and consumption data
- **NVE**: Reservoir fill levels and hydropower statistics
- **Oslo Stock Exchange**: OSEAX (All Share Index)
- **Static Data**: Oil fund data, etc.

### Chart Features
- **Political Party Coloring**: Charts colored by ruling political parties
- **Interactive Tooltips**: Hover for detailed information
- **Responsive Design**: Works on all devices
- **Search & Filter**: Find specific charts quickly
- **Optimized Dark/Light Theme**: Instant theme switching with CSS variables
- **Bilingual**: English and Norwegian support

### Technical Features
- **Modular Architecture**: Clean, maintainable code structure
- **Cached Data**: 100% reliable data loading
- **Error Handling**: Robust error handling and recovery
- **Rate Limiting**: Respectful API usage
- **Data Validation**: Ensures data integrity
- **Optimized Theme System**: CSS variables for instant theme switching

## 🌙 Theme System

The dashboard features an optimized light/dark mode toggle that switches themes instantly:

### How It Works
- **CSS Variables**: All theme colors are defined as CSS custom properties
- **Single Class Toggle**: Theme switching requires only one class change on the `<html>` element
- **Chart Integration**: Charts automatically adapt to theme changes using CSS variables
- **Persistent Storage**: Theme preference is saved in localStorage

### Performance Benefits
- **Instant Switching**: Theme changes happen in under 100ms
- **No Re-rendering**: Charts update colors without full re-rendering
- **Smooth Transitions**: 0.2s transitions for visual polish
- **Mobile Optimized**: Efficient on all devices

### Testing
Test the theme toggle functionality:
```bash
# Open the test page
open http://localhost:8000/test-theme.html
```

## 🔧 Development

### Adding New Data Sources

1. **Create a new fetcher** in `scripts/fetch/`:
```python
# Example: fetch_new_data.py
import yfinance as yf
import json
import os
from datetime import datetime

class NewDataFetcher:
    def __init__(self, cache_dir="data/cached"):
        self.cache_dir = cache_dir
        self.data_dir = os.path.join(cache_dir, "new-source")
        os.makedirs(self.data_dir, exist_ok=True)
    
    def fetch_data(self):
        # Implement your fetching logic here
        pass
```

2. **Update configuration** in `src/js/config.js`:
```javascript
export const DATASET_MAPPINGS = {
    // ... existing mappings
    new_source: {
        'dataset_id': 'cache_filename'
    }
};
```

3. **Add chart loading** in `src/js/main.js`:
```javascript
loadChartData('new-chart', './data/cached/new-source/data.json', 'New Chart Title')
```

### Adding New Charts

1. **Add HTML** in `src/html/index.html`:
```html
<div class="chart-card">
    <div class="chart-header">
        <h3>New Chart Title</h3>
        <a href="API_URL" target="_blank" class="source-link">Source</a>
        <div class="chart-subtitle">Description</div>
    </div>
    <div class="skeleton-chart" id="new-chart-skeleton"></div>
    <div class="chart-container">
        <canvas id="new-chart"></canvas>
        <div class="static-tooltip" id="new-chart-tooltip"></div>
    </div>
</div>
```

2. **Add to main.js**:
```javascript
loadChartData('new-chart', 'API_URL', 'New Chart Title')
```

## 📈 Available Charts

### Economic Indicators
- Consumer Price Index (CPI)
- Unemployment Rate
- GDP Growth
- Producer Price Index
- Wage Index
- House Price Index

### Financial Data
- Exchange Rates (USD/NOK, EUR/NOK)
- Key Policy Rate
- Government Debt
- Oil Fund Value
- Monetary Aggregates
- Oslo Stock Exchange Indices (OSEAX)
- Oslo Stock Exchange Indices (OSEBX)

### Trade & Industry
- Trade Balance
- Export/Import Volume
- Industrial Production
- Retail Sales

### Social Indicators
- Population Growth 
- Life Expectancy
- Education Level 
- Crime Rate
- Immigration Rate 

### And 50+ more indicators...

## ⚡ Statnett Production and Consumption Data

The dashboard now includes **Statnett** electricity production and consumption data, providing comprehensive information about Norway's electricity system:

### Production and Consumption Charts
- **Production**: Daily electricity production in MWh
- **Consumption**: Daily electricity consumption in MWh  
- **Net**: Net production (Production - Consumption) showing surplus/deficit
- **Historical Data**: Complete dataset from 2012 onwards
- **Interactive Tooltips**: Hover for detailed information with Norwegian date formatting

### Chart Features
- **Three-Line Display**: Production (blue), Consumption (red), and Net (green dashed)
- **Daily Resolution**: High-frequency data showing daily patterns
- **Long Historical Series**: Over 10 years of data for trend analysis
- **Responsive Design**: Optimized for all devices
- **Theme Integration**: Automatically adapts to light/dark mode

### Data Source
- **API**: [Statnett Driftsdata REST API](https://driftsdata.statnett.no/restapi)
- **Coverage**: Norwegian electricity system
- **Update Frequency**: Daily
- **Units**: Megawatt-hours (MWh)

## 🌊 NVE Reservoir Data

The dashboard now includes **NVE Magasinstatistikk** (reservoir statistics) data, providing real-time information about Norway's hydropower reservoir levels:

### Reservoir Fill Charts
- **Norge (Norway)**: Overall national reservoir fill percentage
- **Østlandet (NO1)**: Eastern Norway reservoir levels
- **Sørlandet (NO2)**: Southern Norway reservoir levels  
- **Vestlandet (NO3)**: Western Norway reservoir levels
- **Trøndelag (NO4)**: Central Norway reservoir levels
- **Nord-Norge (NO5)**: Northern Norway reservoir levels

### Chart Features
- **Current Year**: Bold line showing current reservoir fill levels
- **Previous Year**: Faint line for year-over-year comparison
- **20-Year Statistics**: Min/max bands and median line showing historical patterns
- **Weekly Updates**: Data updated weekly (typically Wed/Thu)
- **Interactive Tooltips**: Hover for detailed information

### Data Source
- **API**: [NVE Magasinstatistikk API](https://biapi.nve.no/magasinstatistikk/swagger/index.html)
- **Coverage**: 490 major reservoirs across Norway
- **Capacity**: ~87 TWh total reservoir capacity
- **Update Frequency**: Weekly

## 🛠️ Scripts

### Data Management

```bash
# Fetch Oslo indices data
cd scripts
python fetch/fetch_oslo_indices.py

# Fetch Statnett production and consumption data
cd scripts
python fetch/statnett-production-consumption.py

# Install dependencies
pip install -r requirements.txt
```

### Testing

```bash
# Test cache loading
open tests/test_cache.html

# Debug utilities
open tests/debug.html
```

## 🔍 Data Validation

The system includes comprehensive data validation:

- **Structure Validation**: Ensures data follows expected format
- **Metadata Validation**: Checks for required metadata fields
- **Freshness Check**: Warns about stale data
- **Source-specific Validation**: Validates SSB and Norges Bank formats

## 📝 Configuration

### Chart Configuration
Edit `src/js/config.js` to modify:
- Political party periods and colors
- Chart appearance settings
- API endpoints
- Dataset mappings

### Styling
Edit `src/css/main.css` to customize:
- Color schemes
- Layout and spacing
- Responsive breakpoints
- Theme variations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Statistics Norway (SSB)** for providing comprehensive economic data
- **Norges Bank** for financial data
- **Chart.js** for the excellent charting library
- **Norwegian Political Parties** for the color inspiration

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Check the documentation in `docs/`
- Review the cache status in `docs/CACHE_STATUS.md`