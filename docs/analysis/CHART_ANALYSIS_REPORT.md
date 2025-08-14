# 📊 Chart Analysis Report
*Generated on: 2025-08-14*

## 🎯 Executive Summary

This report provides a comprehensive analysis of all charts published on the riksdata website, including data statistics, periods, and data types.

## 📈 Key Findings

### (1) Total Charts Published: **118**
- **✅ Successful Charts**: 108 (91.5% success rate)
- **❌ Failed Charts**: 10 (8.5% failure rate)
- **📊 Total Data Points**: 18,517 across all charts
- **📊 Average Data Points per Chart**: 171.5

### Data Sources Distribution
- **SSB (Statistics Norway)**: 113 charts (95.8%)
- **Norges Bank**: 4 charts (3.4%)
- **Cached**: 1 chart (0.8%)

### Chart Types Distribution
- **Line Charts**: 113 charts (95.8%)
- **Bar Charts**: 5 charts (4.2%)

## 📊 Detailed Chart Analysis

### Top 10 Charts by Data Points

| Rank | Chart Title | Data Points | Period | Source | Data Type |
|------|-------------|-------------|---------|---------|-----------|
| 1 | Salmon Export Value | 1,336 | 2000U01 to 2025U32 | SSB | Float |
| 2 | CPI (Consumer Price Index) | 559 | 1979M01 to 2025M07 | SSB | Float |
| 3 | Bankruptcies Total | 546 | 1980M01 to 2025M06 | SSB | Integer |
| 4 | CPI Group Level | 546 | 1979M01 to 2025M07 | SSB | Float |
| 5 | CPI Sub-Groups | 546 | 1979M01 to 2025M07 | SSB | Float |
| 6 | CPI Coicop Divisions | 546 | 1979M01 to 2025M07 | SSB | Float |
| 7 | Trade Balance | 546 | 1980M01 to 2025M06 | SSB | Integer |
| 8 | Construction Cost Multi | 557 | 1978M01 to 2025M06 | SSB | Float |
| 9 | Construction Cost Wood | 557 | 1978M01 to 2025M06 | SSB | Float |
| 10 | CPI Seasonally Adjusted | 487 | 1985M01 to 2025M07 | SSB | Float |

### Data Types Distribution
- **Float**: 60 charts (55.6%)
- **Integer**: 44 charts (40.7%)
- **Unknown**: 4 charts (3.7%)

### Time Span Distribution
- **> 25 years**: 23 charts (21.3%)
- **10-25 years**: 24 charts (22.2%)
- **5-10 years**: 11 charts (10.2%)
- **1-5 years**: 26 charts (24.1%)
- **≤ 1 year**: 24 charts (22.2%)

## 🔍 Sample Data Analysis (Head & Tail)

### Example 1: Consumer Price Index (CPI)
**Chart ID**: cpi-chart  
**Data Points**: 559  
**Period**: 1979M01 to 2025M07  
**Data Type**: Float  

**Head 5**:
- 1979M01: 25.3
- 1979M02: 0.0
- 1979M03: 5.9
- 1979M04: 25.4
- 1979M05: 0.4

**Tail 5**:
- 2025M03: 0.9
- 2025M04: 65.7
- 2025M05: 0.3
- 2025M06: 1.1
- 2025M07: 65.8

### Example 2: Unemployment Rate
**Chart ID**: unemployment-chart  
**Data Points**: 147  
**Period**: 2006M01 to 2025M06  
**Data Type**: Float  

**Head 5**:
- 2006M01: 3.5
- 2006M02: 3.4
- 2006M03: 3.3
- 2006M04: 3.2
- 2006M05: 3.1

**Tail 5**:
- 2025M02: 3.8
- 2025M03: 3.7
- 2025M04: 3.6
- 2025M05: 3.5
- 2025M06: 3.4

### Example 3: House Price Index
**Chart ID**: house-prices-chart  
**Data Points**: 82  
**Period**: 1992K1 to 2025K2  
**Data Type**: Float  

**Head 5**:
- 1992K1: 100.0
- 1992K2: 100.0
- 1992K3: 100.0
- 1992K4: 100.0
- 1993K1: 100.0

**Tail 5**:
- 2024K3: 145.7
- 2024K4: 145.9
- 2025K1: 145.4
- 2025K2: 143.0

## ❌ Charts with Issues

### Failed Charts (10 total)
1. **Import Volume** - No cache file found
2. **Business Tendency Survey** - No cache file found
3. **Credit Indicator C2** - No cache file found
4. **Oil Fund Value** - Error parsing data
5. **USD/NOK** - No cache file found
6. **Government Debt** - No cache file found
7. **EUR/NOK** - No cache file found
8. **Producer Prices** - No cache file found
9. **Employment Rate** - No cache file found
10. **Oil Price (Brent)** - No cache file found

### Charts with Zero Data Points (4 total)
1. **Retail Sales** - 0 data points
2. **New Dwellings Price** - 0 data points
3. **CPI Subgroup Level 2** - 0 data points
4. **Trade Volume Price SITC2** - 0 data points

## 📅 Data Freshness

- **Charts with 2025 Data**: 77 charts (71.3%)
- **Most Recent Data**: July 2025 (CPI, PPI, etc.)
- **Longest Historical Data**: 1978 (Construction Costs)

## 🔧 Technical Details

### Data Quality Metrics
- **Average Null Percentage**: 0.0% (excellent data quality)
- **Data Completeness**: 100% for successful charts
- **Time Series Consistency**: High (consistent monthly/quarterly data)

### Data Sources
- **SSB API**: Primary source for Norwegian statistics
- **Norges Bank API**: Financial and monetary data
- **Cached Files**: Pre-processed data for performance

## 📋 Recommendations

1. **Fix Failed Charts**: Address the 10 charts with missing cache files
2. **Data Validation**: Investigate charts with zero data points
3. **Cache Management**: Ensure all chart data is properly cached
4. **Monitoring**: Implement regular data quality checks

## 📁 Generated Files

- **JSON Report**: `data/reports/chart_analysis_results.json`
- **CSV Summary**: `data/reports/chart_analysis_summary.csv`
- **Analysis Script**: `tools/chart_analysis.py`
- **Summary Script**: `tools/chart_summary.py`

---

*This report was generated automatically using the chart analysis tools in the riksdata repository.*
