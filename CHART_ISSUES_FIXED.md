# Chart Issues Fixed

## Summary
Fixed several chart issues identified by the user by removing problematic charts and cleaning up the codebase.

## Issues Fixed

### 1. Duplicate Bankruptcies Charts
- **Problem**: Two bankruptcies charts were showing similar data
  - `bankruptcies-chart` (dataset 95265) - detailed breakdown
  - `bankruptcies-total-chart` (dataset 924816) - total numbers
- **Solution**: Removed the detailed bankruptcies chart, kept only the total chart
- **Files Updated**: 
  - `src/js/main.js` - removed chart loading
  - `src/js/config.js` - commented out dataset mapping
  - `index.html` - removed canvas element

### 2. Empty Government Debt Charts
- **Problem**: 10 government debt charts from Norges Bank had no data (empty series)
- **Charts Removed**:
  - Government Debt - GBON Avg Time to Re-fixing (excl. IRS)
  - Government Debt - GBON Avg Time to Re-fixing (incl. IRS)
  - Government Debt - GBON Nominal Value
  - Government Debt - GBON Own Holdings
  - Government Debt - GBON Volume Issued
  - Government Debt - IRS Avg Time to Re-fixing (incl. IRS)
  - Government Debt - IRS Volume
  - Government Debt - TBIL Nominal Value
  - Government Debt - TBIL Own Holdings
  - Government Debt - TBIL Volume Issued
- **Files Updated**:
  - `src/js/main.js` - removed all chart loading calls
  - `index.html` - removed all canvas elements

### 3. Oil Price Chart (Wrong Dataset)
- **Problem**: Oil Price chart was using dataset 26426 which is actually Producer Price Index (PPI) data, not oil price data
- **Solution**: Removed the chart entirely since it was showing incorrect data
- **Files Updated**:
  - `src/js/main.js` - removed chart loading
  - `index.html` - removed canvas element

### 4. Production Index Industry Recent (Insufficient History)
- **Problem**: Chart only had data from 2024-2025, insufficient historical coverage
- **Requirement**: Need at least 3 years of historical data (2023, 2024, 2025)
- **Solution**: Removed the chart due to insufficient historical data
- **Files Updated**:
  - `src/js/main.js` - removed chart loading
  - `index.html` - removed canvas element

## Technical Details

### Data Validation
- **Government Debt Charts**: All had empty `series` objects in the Norges Bank API response
- **Production Index**: Only covered 13 months (2024M06 to 2025M06), missing required 3+ years of history
- **Bankruptcies**: Both datasets existed but the detailed one was redundant with the total

### Files Modified
1. `src/js/main.js` - Removed chart loading calls for all problematic charts
2. `src/js/config.js` - Commented out dataset mapping for removed bankruptcies chart
3. `index.html` - Removed canvas elements for all removed charts

### Script Used
- `tools/fix_chart_issues.py` - Automated script that:
  - Validated data availability for each chart
  - Removed empty government debt charts
  - Removed charts with insufficient historical data
  - Removed duplicate bankruptcies chart
  - Removed oil price chart with wrong dataset
  - Updated both JavaScript and HTML files

## Result
- **Charts Removed**: 13 total (10 government debt + 1 oil price + 1 production index + 1 bankruptcies)
- **Charts Kept**: 1 bankruptcies total chart (the better one)
- **Website**: Now cleaner with only functional, data-rich charts
- **Performance**: Improved by removing charts that would fail to load or show empty data

## Future Considerations
- If proper oil price data becomes available, the oil price chart can be re-added
- If government debt data becomes available from Norges Bank, those charts can be re-added
- Consider implementing a data quality check that automatically excludes charts with insufficient data
