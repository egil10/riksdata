# Riksdata Scripts

This directory contains comprehensive Python scripts for managing Riksdata's data health, diagnostics, repair, and expansion.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Full Workflow
```bash
python scripts/master.py
```

This will run diagnostics, repair any issues, and provide a comprehensive report.

## 📋 Available Scripts

### 1. Master Script (`master.py`)
The main orchestrator that runs diagnostics, repair, and expansion in sequence.

**Usage:**
```bash
# Run full workflow
python scripts/master.py

# Run diagnostics only
python scripts/master.py --mode diagnostics

# Run repair only
python scripts/master.py --mode repair

# Run expansion only
python scripts/master.py --mode expansion --expansion-file config.json

# Create sample expansion config
python scripts/master.py --create-sample-config
```

### 2. Diagnostics Script (`diagnostics.py`)
Comprehensive data health check and API connectivity testing.

**Features:**
- API connectivity testing
- Cache status analysis
- Missing data identification
- Data quality validation
- Corrupted file detection

**Usage:**
```bash
python scripts/diagnostics.py
```

**Output:**
- Console report with health status
- `diagnostics_results.json` - Detailed results
- `diagnostics.log` - Log file

### 3. Repair Script (`repair.py`)
Automatically fix missing or corrupted data by re-fetching from APIs.

**Features:**
- Automatic data re-fetching
- Missing file restoration
- Corrupted file repair
- Rate limiting and error handling

**Usage:**
```bash
python scripts/repair.py
```

**Output:**
- Console report with repair status
- `repair_results.json` - Detailed results
- `repair.log` - Log file

### 4. Expansion Script (`expand.py`)
Easy addition of new APIs, data sources, and datasets.

**Features:**
- New data source integration
- Automatic code generation
- Configuration updates
- API endpoint testing

**Usage:**
```bash
python scripts/expand.py --config-file expansion_config.json
```

**Output:**
- Console report with expansion status
- `expansion_results.json` - Detailed results
- `expand.log` - Log file

## 📊 Understanding Reports

### Diagnostic Report
```
============================================================
RIKSDATA DIAGNOSTIC REPORT
============================================================
Generated: 2024-01-01T12:00:00

🔌 API CONNECTIVITY
------------------------------
APIs tested: 5
Successful: 4
Failed: 1

📁 CACHE STATUS
------------------------------
Total files: 67
Valid files: 65
Corrupted files: 2
Total size: 15.23 MB

🔍 MISSING DATA
------------------------------
Missing files: 3
  - ssb/cpi.json
  - norges-bank/exchange-rates.json
  - static/oil-fund.json

✅ DATA QUALITY
------------------------------
Overall quality score: 92.5%

💡 RECOMMENDATIONS
------------------------------
• Fetch 3 missing datasets
• Re-fetch 2 corrupted files
• Fix 1 API connectivity issues
```

### Repair Report
```
============================================================
RIKSDATA REPAIR REPORT
============================================================
Generated: 2024-01-01T12:30:00

📊 REPAIR SUMMARY
------------------------------
Total attempted: 5
Successful: 4
Failed: 1
Skipped: 0

✅ SUCCESSFULLY REPAIRED
------------------------------
  • ssb/cpi.json
  • norges-bank/exchange-rates.json
  • static/oil-fund.json
  • ssb/unemployment.json

❌ FAILED REPAIRS
------------------------------
  • ssb/gdp-growth.json: API endpoint not found
```

### Master Workflow Report
```
================================================================================
RIKSDATA MASTER WORKFLOW REPORT
================================================================================
Generated: 2024-01-01T13:00:00

📊 OVERALL SUMMARY
----------------------------------------
API Connectivity: 4/5 successful
Cache Files: 65/67 valid
Cache Size: 15.23 MB
Missing Data: 3 files
Corrupted Data: 2 files
Repair Attempted: 5
Repair Successful: 4
Repair Failed: 1
New Sources: 0
New Datasets: 0
Expansion Failed: 0

💡 RECOMMENDATIONS
----------------------------------------
• Fix 1 API connectivity issues
• Fetch 3 missing datasets
• Re-fetch 2 corrupted files
• Investigate failed repairs

🔄 NEXT STEPS
----------------------------------------
• Run repair to fix data issues
• Run regular diagnostics to monitor data health
• Consider adding more data sources for comprehensive coverage
```

## 🔧 Adding New Data Sources

### 1. Create Expansion Configuration
```json
{
  "sources": [
    {
      "name": "new-api",
      "base_url": "https://api.new-source.com",
      "description": "New data source for additional metrics"
    }
  ],
  "datasets": [
    {
      "type": "ssb",
      "dataset_id": "12345",
      "cache_name": "new-metric",
      "title": "New Economic Metric",
      "description": "A new economic indicator",
      "chart_type": "line"
    }
  ]
}
```

### 2. Run Expansion
```bash
python scripts/expand.py --config-file new_data_config.json
```

### 3. Verify Integration
```bash
python scripts/master.py --mode diagnostics
```

## 📈 Data Quality Metrics

The system evaluates data quality based on:

- **Structure Validation**: Ensures data follows expected format
- **Metadata Validation**: Checks for required metadata fields
- **Freshness Check**: Warns about stale data
- **Source-specific Validation**: Validates SSB and Norges Bank formats

### Quality Score Calculation
- **100%**: All datasets valid and up-to-date
- **90-99%**: Minor issues, mostly operational
- **80-89%**: Some issues, needs attention
- **<80%**: Significant problems, immediate action required

## 🛠️ Troubleshooting

### Common Issues

1. **API Connectivity Failures**
   - Check internet connection
   - Verify API endpoints are accessible
   - Check rate limiting

2. **Missing Data Files**
   - Run repair script to re-fetch
   - Check dataset IDs are correct
   - Verify API responses

3. **Corrupted Data**
   - Run repair script to re-fetch
   - Check JSON syntax
   - Verify data structure

4. **Expansion Failures**
   - Check expansion configuration syntax
   - Verify API endpoints
   - Check file permissions

### Debug Mode
Add `--verbose` flag for detailed logging:
```bash
python scripts/master.py --verbose
```

### Log Files
- `master.log` - Master workflow logs
- `diagnostics.log` - Diagnostics logs
- `repair.log` - Repair logs
- `expand.log` - Expansion logs

## 🔄 Automation

### Scheduled Diagnostics
Add to crontab for daily health checks:
```bash
0 2 * * * cd /path/to/riksdata && python scripts/master.py --mode diagnostics
```

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Data Health Check
  run: |
    python scripts/master.py --mode diagnostics
    python scripts/master.py --mode repair
```

## 📚 API Reference

### SSB Datasets
- Format: `https://data.ssb.no/api/v0/dataset/{ID}.json?lang=en`
- Structure: PXWeb JSON format
- Rate Limit: Respectful usage recommended

### Norges Bank Datasets
- Format: `https://data.norges-bank.no/api/data/{PATH}`
- Structure: SDMX-JSON format
- Rate Limit: Respectful usage recommended

### Static Data
- Format: Custom JSON structure
- Location: `data/` directory
- Validation: Custom schema validation

## 🤝 Contributing

1. **Adding New Scripts**
   - Follow existing patterns
   - Include comprehensive logging
   - Add proper error handling
   - Update this README

2. **Improving Diagnostics**
   - Add new validation rules
   - Enhance quality metrics
   - Improve error reporting

3. **Expanding Data Sources**
   - Create new fetcher classes
   - Update configuration mappings
   - Test thoroughly

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
