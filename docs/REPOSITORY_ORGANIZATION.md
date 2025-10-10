# Repository Organization

## Overview
This document describes the organized structure of the Riksdata repository after cleanup and reorganization.

## Directory Structure

```
riksdata/
├── index.html                 # Main application (GitHub Pages entry point)
├── README.md                  # Project documentation
├── requirements.txt           # Python dependencies
├── setup.py                   # Setup script
├── .gitignore                 # Git ignore rules
│
├── src/                       # Source files
│   ├── js/                   # JavaScript modules
│   │   ├── main.js           # Main application logic
│   │   ├── charts.js         # Chart rendering and data parsing
│   │   ├── charts/           # Specialized chart modules
│   │   │   ├── nve-magasins.js
│   │   │   ├── statnett-production-consumption.js
│   │   │   └── stortinget-women-representation.js
│   │   ├── utils.js          # Utility functions
│   │   ├── config.js         # Configuration and constants
│   │   ├── registry.js       # Chart data registry
│   │   ├── icons.js          # Icon utilities
│   │   ├── mood-rating.js    # Mood rating component
│   │   └── chart-theme.js    # Chart theme configuration
│   ├── css/                  # Stylesheets
│   │   ├── main.css          # Main stylesheet
│   │   └── theme.css         # Theme definitions
│   └── assets/               # Static assets
│       └── favicon.ico       # Site favicon
│
├── data/                      # Data files
│   ├── cached/               # Cached API data
│   │   ├── ssb/              # SSB datasets (42 files)
│   │   ├── norges-bank/      # Norges Bank datasets (3 files)
│   │   └── metadata.json     # Cache metadata
│   ├── reports/              # Generated reports
│   │   ├── chart_quality_report.json
│   │   ├── diagnostics_results.json
│   │   ├── excluded_charts_report.json
│   │   ├── expansion_results.json
│   │   ├── realistic_expansion.json
│   │   └── repair_results.json
│   ├── logs/                 # Log files
│   │   ├── diagnostics.log
│   │   └── expand.log
│   ├── static/               # Static data files
│   ├── ssb-api/              # SSB API data
│   ├── exchange-rates.json   # Exchange rates data
│   └── oil-fund.json         # Oil fund data
│
├── scripts/                   # Python and R scripts
│   ├── fetch/                # Data fetching scripts
│   │   ├── owid/             # Our World in Data R scripts (30+ files)
│   │   ├── exchange-rates/   # Exchange rate R scripts
│   │   ├── *.py              # Python data fetchers
│   │   └── *.R               # Other R data fetchers
│   ├── add-dataset.py        # Add new datasets
│   ├── requirements.txt      # Python dependencies
│   └── README.md             # Scripts documentation
│
├── docs/                      # Documentation
│   ├── README.md             # Documentation index
│   ├── DATA_FORMAT_GUIDE.md  # Comprehensive data guide with templates
│   └── REPOSITORY_ORGANIZATION.md # This file
│
├── tests/                     # Test files
│   ├── test_cache.html       # Cache testing
│   ├── debug.html            # Debug utilities
│   └── test-modules.html     # Module loading test
│
└── .git/                      # Git repository
```

## File Organization

### Core Application Files
- **`index.html`**: Main entry point for GitHub Pages
- **`src/`**: All source code (JavaScript, CSS)
- **`data/cached/`**: Cached API data for reliable loading

### Documentation
- **`docs/`**: All documentation and reports
- **`docs/reports/`**: Generated diagnostic and cleanup reports
- **`README.md`**: Main project documentation

### Scripts and Tools
- **`scripts/`**: All Python scripts
- **`scripts/tools/`**: Diagnostic and cleanup tools
- **`scripts/fetch/`**: Data fetching utilities
- **`scripts/validate/`**: Data validation tools

### Data and Reports
- **`data/reports/`**: Generated data reports
- **`data/logs/`**: Log files
- **`data/static/`**: Static data files

## Key Features

### Clean Structure
- ✅ No clutter in root directory
- ✅ Logical file organization
- ✅ Clear separation of concerns
- ✅ Easy to navigate

### Maintained Functionality
- ✅ All paths updated and working
- ✅ Website functionality preserved
- ✅ Script references updated
- ✅ Documentation organized

### Diagnostic Tools
- ✅ All diagnostic tools preserved in `scripts/tools/`
- ✅ Reports organized in `docs/reports/`
- ✅ Logs stored in `data/logs/`

## Usage

### Running the Website
```bash
python -m http.server 8000
# Open http://localhost:8000
```

### Running Diagnostics
```bash
python scripts/tools/diagnostics.py
```

### Running Cleanup
```bash
python scripts/tools/comprehensive_cleanup.py
```

### Data Management
```bash
python scripts/main.py
```

## Benefits of Organization

1. **Cleaner Repository**: No clutter in root directory
2. **Better Navigation**: Logical file structure
3. **Easier Maintenance**: Tools and reports organized
4. **Preserved Functionality**: All paths and references working
5. **Professional Structure**: Industry-standard organization

## Maintenance

- New diagnostic tools should go in `scripts/tools/`
- New reports should go in `docs/reports/`
- New logs should go in `data/logs/`
- Keep root directory clean with only essential files
