# Riksdata

A comprehensive Norwegian economic data dashboard with political party-colored charts, featuring data from Statistics Norway (SSB) and Norges Bank.

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
│   │   └── metadata.json # Cache metadata
│   └── static/           # Static data files
├── scripts/              # Python scripts
│   ├── fetch/            # Data fetching scripts
│   │   ├── __init__.py
│   │   ├── ssb.py        # SSB data fetcher
│   │   ├── norges_bank.py # Norges Bank data fetcher
│   │   └── base.py       # Base fetcher class
│   ├── validate/         # Data validation scripts
│   │   ├── __init__.py
│   │   └── validator.py  # Data validator
│   ├── utils/            # Utility scripts
│   │   ├── __init__.py
│   │   └── helpers.py    # Helper functions
│   └── main.py           # Main script runner
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
# Fetch all data (SSB + Norges Bank)
python scripts/main.py

# Fetch only SSB data
python scripts/main.py --sources ssb

# Fetch only Norges Bank data
python scripts/main.py --sources norges-bank

# Fetch with verbose logging
python scripts/main.py --verbose
```

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
- **Static Data**: Oil fund data, etc.

### Chart Features
- **Political Party Coloring**: Charts colored by ruling political parties
- **Interactive Tooltips**: Hover for detailed information
- **Responsive Design**: Works on all devices
- **Search & Filter**: Find specific charts quickly
- **Dark/Light Theme**: Toggle between themes
- **Bilingual**: English and Norwegian support

### Technical Features
- **Modular Architecture**: Clean, maintainable code structure
- **Cached Data**: 100% reliable data loading
- **Error Handling**: Robust error handling and recovery
- **Rate Limiting**: Respectful API usage
- **Data Validation**: Ensures data integrity

## 🔧 Development

### Adding New Data Sources

1. **Create a new fetcher** in `scripts/fetch/`:
```python
from .base import BaseFetcher

class NewSourceFetcher(BaseFetcher):
    def __init__(self, cache_dir):
        super().__init__(cache_dir / "new-source")
        # Add your datasets here
    
    def fetch_all(self):
        # Implement fetching logic
        pass
```

2. **Add to main.py**:
```python
from fetch import NewSourceFetcher

# In fetch_data function:
if 'new-source' in sources:
    new_fetcher = NewSourceFetcher(cache_path)
    successful, failed = new_fetcher.fetch_all()
```

3. **Update configuration** in `src/js/config.js`:
```javascript
export const DATASET_MAPPINGS = {
    // ... existing mappings
    new_source: {
        'dataset_id': 'cache_filename'
    }
};
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

### Trade & Industry
- Trade Balance
- Export/Import Volume
- Industrial Production
- Retail Sales
- Business Confidence

### Social Indicators
- Population Growth
- Life Expectancy
- Education Level
- Crime Rate
- Immigration Rate

### And 50+ more indicators...

## 🛠️ Scripts

### Data Management

```bash
# Fetch and validate all data
python scripts/main.py

# Only fetch data
python scripts/main.py --fetch-only

# Only validate data
python scripts/main.py --validate-only

# Fetch specific sources
python scripts/main.py --sources ssb norges-bank

# Verbose output
python scripts/main.py --verbose
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