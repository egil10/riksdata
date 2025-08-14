# Duplicate Charts Analysis Report

## Executive Summary

Analysis of the cached data files revealed **7 pairs of duplicate datasets** with identical or nearly identical data. Of these, **2 pairs have both charts displayed on the website**, **4 pairs have only one chart displayed**, and **1 pair has neither chart displayed**.

## Detailed Findings

### 1. Business Confidence vs Business Cycle Barometer
- **Status**: ✅ BOTH DISPLAYED
- **Similarity**: 100.0% identical
- **Charts**: `business-confidence-chart` and `business-cycle-barometer-chart`
- **Data Source**: SSB
- **Recommendation**: Consider removing one of these charts as they show identical data with different titles.

### 2. Producer Price Index Subgroups Detailed vs Producer Price Index Subgroups
- **Status**: ✅ BOTH DISPLAYED
- **Similarity**: 96.4% identical
- **Charts**: `producer-price-index-subgroups-detailed-chart` and `producer-price-index-subgroups-chart`
- **Data Source**: SSB
- **Recommendation**: These are very similar but not identical. Consider keeping the "detailed" version and removing the basic one.

### 3. Export Commodity vs Export Value SITC3
- **Status**: ⚠️ PARTIALLY DISPLAYED (only export-value-sitc3-chart is shown)
- **Similarity**: 100.0% identical
- **Charts**: N/A and `export-value-sitc3-chart`
- **Data Source**: SSB
- **Recommendation**: No action needed - only one chart is displayed.

### 4. Trade Volume Price Product Groups vs Trade Volume Price
- **Status**: ⚠️ PARTIALLY DISPLAYED (only trade-volume-price-product-groups-chart is shown)
- **Similarity**: 100.0% identical
- **Charts**: `trade-volume-price-product-groups-chart` and N/A
- **Data Source**: SSB
- **Recommendation**: No action needed - only one chart is displayed.

### 5. Import by Country Monthly vs Import Value SITC3
- **Status**: ⚠️ PARTIALLY DISPLAYED (only import-value-sitc3-chart is shown)
- **Similarity**: 99.7% identical
- **Charts**: N/A and `import-value-sitc3-chart`
- **Data Source**: SSB
- **Recommendation**: No action needed - only one chart is displayed.

### 6. Consumer Confidence vs Household Consumption
- **Status**: ⚠️ PARTIALLY DISPLAYED (only household-consumption-chart is shown)
- **Similarity**: 99.7% identical
- **Charts**: N/A and `household-consumption-chart`
- **Data Source**: SSB
- **Recommendation**: No action needed - only one chart is displayed.

### 7. Population Development Quarterly vs Population Growth Alt
- **Status**: ❌ NEITHER DISPLAYED
- **Similarity**: 100.0% identical
- **Charts**: N/A and N/A
- **Data Source**: SSB
- **Recommendation**: No action needed - neither chart is displayed on the website.

## Recommendations

### High Priority
1. **Remove one of the Business Confidence/Business Cycle Barometer charts** - These are 100% identical and serve no purpose having both displayed.

### Medium Priority
2. **Review the Producer Price Index Subgroups charts** - These are 96.4% identical. Consider keeping only the "detailed" version.

### Low Priority
3. **Monitor the partially displayed duplicates** - These currently don't cause issues since only one chart is shown, but be aware of the data overlap.

## Technical Details

### Analysis Methodology
- Analyzed 129 cached data files (SSB and Norges Bank)
- Compared data points using exact value matching and percentage similarity
- Cross-referenced with `main.js` to identify which charts are actually displayed
- Used tolerance of 0.0001 for floating-point comparisons
- Considered datasets "identical" if >95% match, "similar" if >90% match

### Data Sources
- **SSB (Statistics Norway)**: 126 datasets analyzed
- **Norges Bank**: 3 datasets analyzed (excluding placeholder files)

### Chart Display Status
- **Total charts loaded in main.js**: 93
- **Duplicate pairs with both charts displayed**: 2
- **Duplicate pairs with one chart displayed**: 4
- **Duplicate pairs with no charts displayed**: 1

## Conclusion

The analysis reveals that while there are several duplicate datasets in the cached files, most do not impact the user experience since only one chart is displayed. However, there are **2 critical cases** where identical data is being shown with different titles, which should be addressed to improve the website's clarity and avoid user confusion.

## Files Analyzed
- `data/cached/ssb/*.json` (126 files)
- `data/cached/norges-bank/*.json` (3 files)
- `src/js/main.js` (chart loading logic)
- `src/js/config.js` (data source mappings)

---
*Report generated on: 2025-01-14*
*Analysis scripts: `tools/analyze_duplicates.js`, `tools/analyze_duplicate_charts.js`*
