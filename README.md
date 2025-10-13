# Riksdata 🇳🇴

A **super lean** Norwegian economic data dashboard featuring ~120 working charts from Statistics Norway (SSB), Norges Bank, NVE, Statnett, DFO, and Our World in Data.

## ⚡ Ultra-Lean Architecture

**Drastically simplified for maximum efficiency:**
- 📉 **70% fewer files** (115 vs 384)
- 📄 **94% smaller HTML** (280 lines vs 4,800)
- 🎯 **Only working charts** (~120 vs ~300)
- 🚀 **Modular design** - Charts generated dynamically
- 🧹 **Clean pipeline** - No bloat, just what's needed

## 🏗️ Project Structure

```
riksdata/
├── index.html             # Main application (280 lines - modular!)
├── src/                   # Source files
│   ├── js/               # JavaScript modules
│   │   ├── main.js       # Main app logic & dynamic chart generation
│   │   ├── charts.js     # Chart rendering and data parsing
│   │   ├── utils.js      # Utility functions
│   │   ├── config.js     # Configuration and constants
│   │   ├── registry.js   # Chart registry
│   │   ├── chart-theme.js # Theme management
│   │   ├── mood-rating.js # Mood rating widget
│   │   ├── icons.js      # Icon definitions
│   │   └── charts/       # Specialized chart modules
│   ├── css/              # Stylesheets
│   │   ├── main.css      # Main stylesheet
│   │   └── theme.css     # Theme variables
│   └── assets/           # Assets
│       └── favicon2.ico  # Site favicon
├── data/                 # Data files
│   ├── cached/           # Cached data (83 files)
│   │   ├── dfo/          # Norwegian government budgets (30 files)
│   │   ├── norges-bank/  # Exchange rates & interest rate
│   │   ├── oslo-indices/ # Stock market indices
│   │   ├── nve/          # Reservoir statistics
│   │   ├── statnett/     # Electricity data
│   │   ├── *.json        # OWID Norway statistics (26 files)
│   │   └── metadata.json # Cache metadata
│   └── static/           # Static data files
│       └── nve-reservoir-fill.json
├── docs/                 # Documentation
│   ├── README.md
│   ├── DATA_FORMAT_GUIDE.md
│   ├── DFO_INTEGRATION_GUIDE.md
│   └── REPOSITORY_ORGANIZATION.md
├── .gitignore
├── CNAME
└── package.json
```

## 🚀 Quick Start

### 1. Clone & Run

```bash
# Clone the repository
git clone https://github.com/yourusername/riksdata.git
cd riksdata

# Start local server
python -m http.server 8000

# Open in browser
open http://localhost:8000/
```

### 2. GitHub Pages Deployment

The website is automatically deployed to GitHub Pages from the `main` branch.
- **Live Site**: `https://your-username.github.io/riksdata/`
- **Entry Point**: `index.html` (280 lines - modular!)

### 3. Data Pipeline

**Note**: The project uses cached data files in `data/cached/`. SSB charts fetch live data from the SSB API. You'll need to implement your own data fetching scripts for:
- SSB datasets (70 charts via live API calls)
- OWID data updates (26 cached files)
- Other cached data sources

All chart configurations are in `src/js/main.js` in the `chartConfigs` array

## 📊 Features & Data Sources

### ~120 Working Charts

**SSB (Statistics Norway)** - 70 charts via live API
- Economic indicators (CPI, unemployment, GDP, etc.)
- Trade data (exports, imports, volumes)
- Producer & consumer prices
- Money supply, credit indicators
- Population, immigration, crime statistics
- Energy, construction, industrial production

**DFO (Norwegian Government)** - 30 charts (cached)
- All department budgets 2014-2024
- Expenditures & revenues for 15 departments

**Our World in Data** - 26 charts (cached)
- Life expectancy, child mortality, fertility
- Education (PISA scores, years of schooling)
- CO₂ emissions, energy use per capita
- Economic indicators (income, trade share)
- Social data (marriage rate, alcohol consumption, etc.)

**Norges Bank** - 8 charts (cached)
- Exchange rates (USD, EUR, GBP, CHF, SEK, CNY, I44)
- Key policy rate

**Oslo Børs** - 3 charts (cached)
- OSEAX, OSEBX, OBX indices

**Oil Fund** - 5 charts (cached)
- Total market value, equities, fixed income, real estate, renewable infrastructure

**NVE** - 4 charts (cached + static)
- Reservoir statistics by area
- Annual reservoir fill

**Statnett** - 2 charts (cached)
- Electricity production & consumption

### Key Features
- **Modular HTML**: Charts generated dynamically via JavaScript
- **Political Party Timeline**: Sidebar showing Norwegian government history
- **Search & Filter**: Find charts instantly
- **Responsive Design**: Works on all devices
- **Light Theme**: Clean, professional interface
- **Interactive Tooltips**: Detailed hover information
- **Lazy Loading**: Charts load as you scroll

## 🔧 Development

### Architecture

**Modular Design**: Charts are dynamically generated from the `chartConfigs` array in `src/js/main.js`

```javascript
// Chart configuration example
const chartConfigs = [
    { 
        id: 'cpi-chart', 
        url: 'https://data.ssb.no/api/v0/dataset/1086.json?lang=en', 
        title: 'Consumer Price Index' 
    },
    // ... ~120 total configs
];
```

### Adding New Charts

1. **Add to chartConfigs** in `src/js/main.js`:
```javascript
{ 
    id: 'my-new-chart', 
    url: './data/cached/my-data.json', 
    title: 'My New Chart',
    subtitle: 'Optional subtitle',
    type: 'line'  // or 'bar', 'dfo-budget', etc.
}
```

2. **Add data file** to `data/cached/`:
```json
{
    "labels": ["2020", "2021", "2022"],
    "datasets": [{
        "label": "My Data",
        "data": [100, 110, 120]
    }]
}
```

3. **Charts auto-generate** on page load via `renderChartCards()` function

### Metadata Inference

Chart metadata (subtitle, source URL, source name) is automatically inferred from the URL:
- SSB URLs → SSB metadata
- Norges Bank URLs → Norges Bank metadata
- DFO files → DFO metadata
- OWID files → OWID metadata

See `inferChartMetadata()` in `src/js/main.js` for details

## 🎨 Customization

### Chart Configuration
All charts are configured in `src/js/main.js` in the `chartConfigs` array:
```javascript
const chartConfigs = [
    { id: 'chart-id', url: 'data-url', title: 'Chart Title', subtitle: 'Optional', type: 'line' },
    // ... add your charts here
];
```

### Political Party Colors
Political party periods and colors are defined in `src/js/config.js`:
- Party colors for chart background shading
- Government periods with start/end dates
- Coalition information

### Styling
Customize appearance in:
- `src/css/main.css` - Layout, components, responsive design
- `src/css/theme.css` - Theme variables and colors

## 🏆 Project Stats

- **Total Files**: 115 (down from 384!)
- **Working Charts**: ~120 (down from ~300)
- **index.html**: 280 lines (down from 4,800!)
- **Data Files**: 83 cached files (all active)
- **Architecture**: Super lean & modular

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Statistics Norway (SSB)** - Comprehensive economic data
- **Norges Bank** - Exchange rates & financial data
- **NVE** - Hydropower reservoir statistics
- **Statnett** - Electricity production/consumption data
- **DFO** - Norwegian government budget data
- **Our World in Data** - Global development statistics
- **Chart.js** - Excellent charting library

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Check the documentation in `docs/`