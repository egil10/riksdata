# 🔍 Data Quality Analysis Report
*Generated on: 2025-08-14*

## 🎯 Executive Summary

This report provides a comprehensive analysis of chart data quality issues and recommendations for fixing them to ensure optimal data for political period analysis.

## 📊 Key Findings

### (1) Charts with Missing or No Data

**❌ Failed Charts (10 total):**
- **Import Volume** - No cache file found
- **Business Tendency Survey** - No cache file found  
- **Credit Indicator C2** - No cache file found
- **Oil Fund Value** - Error parsing data
- **USD/NOK** - No cache file found
- **Government Debt** - No cache file found
- **EUR/NOK** - No cache file found
- **Producer Prices** - No cache file found
- **Employment Rate** - No cache file found
- **Oil Price (Brent)** - No cache file found

**⚠️ Zero Data Charts (4 total):**
- **Retail Sales** - 0 data points
- **New Dwellings Price** - 0 data points
- **CPI Subgroup Level 2** - 0 data points
- **Trade Volume Price SITC2** - 0 data points

**📊 Limited Data Charts (24 total):**
Charts with less than 1 year of data, including:
- Population Development Quarterly (0.1 years)
- CPI Seasonally Adjusted Recent (0.2 years)
- Economic Forecasts Selected (0.3 years)
- Births and Deaths (0.8 years)

### (2) Duplicate Charts or Data

**🔄 Duplicate Dataset IDs (9 total):**

| Dataset ID | Charts | Recommended Action |
|------------|--------|-------------------|
| 26426 | Producer Price Index, Producer Prices, Oil Price (Brent) | Keep Producer Price Index |
| 166316 | Business Confidence, Business Tendency Survey | Keep Business Confidence |
| 166326 | Credit Indicator, Credit Indicator C2 | Keep Credit Indicator |
| 1118 | CPI Adjusted Indices, CPI Seasonally Adjusted Recent, CPI-ATE Index | Keep CPI Adjusted Indices |
| 1100 | CPI Delivery Sectors, CPI Delivery Sector Annual | Keep CPI Delivery Sectors |
| 179415 | Trade Volume Price BEC, Trade Volume Price | Keep Trade Volume Price BEC |
| 56957 | Household Income National, Household Income Size | Keep Household Income National |
| 124322 | Oil Gas Industry Turnover SN2007, Oil Gas Turnover | Keep Oil Gas Industry Turnover SN2007 |

### (3) Nonsensical Data Analysis

**⚠️ Potentially Nonsensical Data (34 charts):**

**All Zero Values (1 chart):**
- **Births and Deaths** - All values are zero (likely data parsing issue)

**Negative Values in Price/Index Data (15 charts):**
- Consumer Price Index (-0.40 to 65.80)
- Producer Price Index (-18.60 to 1000.00)
- Labour Cost Index (-3.80 to 57.80)
- First Hand Price Index (-6.50 to 1000.00)
- And 11 more charts...

**Extremely Large Values (18 charts):**
- Population Growth (5,967 to 3,708,609)
- Monetary Aggregates (710,245 to 2,966,654)
- Credit Indicator (-40,844 to 1,206,730)
- Energy Consumption (9,823.90 to 2,933,861)
- And 14 more charts...

### (4) Data Period Analysis

**📅 Time Span Distribution:**
- **Very Short Term (< 1 year):** 24 charts (20.3%)
- **Short Term (1-5 years):** 26 charts (22.0%)
- **Medium Term (5-15 years):** 20 charts (16.9%)
- **Long Term (> 15 years):** 38 charts (32.2%)

**📊 Charts Spanning Multiple Political Periods:**
- **84 charts** span multiple political periods (1970s-2020s)
- **47 charts** have 10+ years of data (good for political analysis)

### (5) Political Period Coverage

**🏛️ Excellent Charts for Political Analysis (Top 10):**

| Chart | Years | Data Points | Political Periods |
|-------|-------|-------------|-------------------|
| Salmon Export Value | 111.3 | 1,336 | 1970s-2020s |
| Consumer Price Index | 46.6 | 559 | 1970s-2020s |
| Construction Costs | 46.4 | 557 | 1970s-2020s |
| Construction Cost Multi | 46.4 | 557 | 1970s-2020s |
| Construction Cost Wood | 46.4 | 557 | 1970s-2020s |
| Trade Balance | 45.5 | 546 | 1980s-2020s |
| CPI Group Level | 45.5 | 546 | 1970s-2020s |
| Bankruptcies Total | 45.5 | 546 | 1980s-2020s |
| CPI Coicop Divisions | 45.5 | 546 | 1970s-2020s |
| CPI Sub-Groups | 45.5 | 546 | 1970s-2020s |

## 🔧 Fix Recommendations

### 🚨 Immediate Actions (Priority 1)

1. **Fix Failed Charts (10 charts)**
   - Fetch missing cache files for SSB datasets
   - Fix data parsing for Oil Fund Value
   - Fetch Norges Bank data for exchange rates and government debt

2. **Resolve Duplicate Issues (9 datasets)**
   - Remove duplicate charts, keeping the best one from each group
   - Update main.js to remove duplicate loadChartData calls

3. **Investigate Zero Data Charts (4 charts)**
   - Check data parsing logic for these specific datasets
   - Verify API endpoints are still valid

### 📊 Optimization Actions (Priority 2)

1. **Remove Short-Term Charts (24 charts)**
   - Charts with < 1 year of data are insufficient for political analysis
   - Focus on charts with 10+ years of data

2. **Review Data Quality (34 charts)**
   - Verify negative values in price/index data are correct
   - Investigate extremely large values for data accuracy
   - Fix Births and Deaths data parsing

## 📈 Cleaned Chart List Results

After applying fixes:
- **Original charts:** 118
- **Charts to keep:** 90 (76.3%)
- **Charts to remove:** 37 (31.4%)

**Removal reasons:**
- Duplicates: 8 charts
- Failed: 10 charts  
- Zero data: 4 charts
- Short term: 15 charts

## ✅ Recommended Charts for Political Analysis

**Top 50 charts with 10+ years of data:**

1. **Salmon Export Value** (111.3 years) - 1,336 data points
2. **Consumer Price Index** (46.6 years) - 559 data points
3. **Construction Costs** (46.4 years) - 557 data points
4. **Construction Cost Multi** (46.4 years) - 557 data points
5. **Construction Cost Wood** (46.4 years) - 557 data points
6. **Trade Balance** (45.5 years) - 546 data points
7. **CPI Group Level** (45.5 years) - 546 data points
8. **Bankruptcies Total** (45.5 years) - 546 data points
9. **CPI Coicop Divisions** (45.5 years) - 546 data points
10. **CPI Sub-Groups** (45.5 years) - 546 data points

## 🎯 Political Period Analysis

**Norwegian Political Periods Covered:**
- **1970s:** 23 charts
- **1980s:** 38 charts  
- **1990s:** 47 charts
- **2000s:** 50 charts
- **2010s:** 50 charts
- **2020s:** 47 charts

**Best Charts for Political Comparison:**
- **Economic Indicators:** CPI, PPI, Trade Balance, Construction Costs
- **Social Indicators:** Population Growth, Life Expectancy, Immigration Rate
- **Financial Indicators:** Credit Indicator, Monetary Aggregates
- **Employment:** Unemployment Rate, Labour Cost Index

## 📋 Implementation Plan

### Phase 1: Critical Fixes (Week 1)
1. Fix 10 failed charts by fetching missing data
2. Remove 8 duplicate charts from main.js
3. Investigate 4 zero data charts

### Phase 2: Data Quality (Week 2)
1. Review and fix 34 charts with data quality issues
2. Verify negative values in price/index data
3. Fix Births and Deaths data parsing

### Phase 3: Optimization (Week 3)
1. Remove 24 short-term charts
2. Update website to focus on 90 high-quality charts
3. Implement data quality monitoring

## 📁 Generated Files

- **`tools/data_quality_analysis.py`**: Data quality analysis script
- **`tools/fix_chart_issues.py`**: Fix recommendations script
- **`data/reports/cleaned_chart_list.json`**: Cleaned chart list
- **`data/reports/chart_analysis_results.json`**: Original analysis results

---

*This report provides a roadmap for optimizing the riksdata website for political period analysis by focusing on high-quality, long-term data series.*
