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
│   │   ├── utils.js          # Utility functions
│   │   └── config.js         # Configuration and constants
│   └── css/                  # Stylesheets
│       └── main.css          # Main stylesheet
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
├── scripts/                   # Python scripts
│   ├── tools/                # Diagnostic and cleanup tools
│   │   ├── diagnostics.py    # Chart diagnostics
│   │   ├── repair.py         # Chart repair
│   │   ├── final_fixes.py    # Final fixes
│   │   └── comprehensive_cleanup.py # Comprehensive cleanup
│   ├── fetch/                # Data fetching scripts
│   │   ├── __init__.py
│   │   ├── ssb.py            # SSB data fetcher
│   │   ├── norges_bank.py    # Norges Bank data fetcher
│   │   └── base.py           # Base fetcher class
│   ├── validate/             # Data validation scripts
│   │   ├── __init__.py
│   │   └── validator.py      # Data validator
│   ├── utils/                # Utility scripts
│   ├── main.py               # Main script runner
│   ├── master.py             # Master script
│   ├── expand.py             # Expansion script
│   ├── generate_filtered_charts.py # Chart generation
│   ├── repository_cleanup.py # Repository cleanup
│   └── README.md             # Scripts documentation
│
├── docs/                      # Documentation
│   ├── reports/              # Generated reports
│   │   ├── repository_cleanup_report.json
│   │   ├── diagnostics_report.md
│   │   ├── diagnostics_results.json
│   │   ├── comprehensive_cleanup_report.json
│   │   ├── final_fixes_report.json
│   │   └── chart_quality_report.json
│   ├── CHART_DIAGNOSTICS_SUMMARY.md
│   ├── REORGANIZATION_SUMMARY.md
│   ├── CACHE_STATUS.md
│   └── REPOSITORY_ORGANIZATION.md
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
