// ============================================================================
// CHART CONFIGURATIONS - ONLY WORKING CHARTS
// ============================================================================
// Metadata (subtitle, sourceUrl, sourceName) is auto-inferred from URL in main.js

export const chartConfigs = [
    // === SSB CHARTS (ALL 125 FILES) ===
    // Core Economic Indicators
    // REMOVED: Duplicate - using cached version below with drill-down support
    { id: 'unemployment-chart', url: 'https://data.ssb.no/api/v0/dataset/1054.json?lang=en', title: 'Unemployment Rate', subtitle: 'Percentage' },
    { id: 'house-prices-chart', url: 'https://data.ssb.no/api/v0/dataset/1060.json?lang=en', title: 'House Price Index' },
    { id: 'producer-price-index-chart', url: 'https://data.ssb.no/api/v0/dataset/26426.json?lang=en', title: 'Producer Price Index' },
    { id: 'wage-index-chart', url: 'https://data.ssb.no/api/v0/dataset/1124.json?lang=en', title: 'Wage Index' },
    
    // Construction & Housing
    { id: 'construction-costs-chart', url: 'https://data.ssb.no/api/v0/dataset/26944.json?lang=en', title: 'Construction Costs' },
    { id: 'construction-cost-multi-chart', url: 'https://data.ssb.no/api/v0/dataset/1058.json?lang=en', title: 'Construction Cost Multi' },
    { id: 'construction-cost-wood-chart', url: 'https://data.ssb.no/api/v0/dataset/1056.json?lang=en', title: 'Construction Cost Wood' },
    { id: 'construction-production-index-chart', url: 'https://data.ssb.no/api/v0/dataset/924808.json?lang=en', title: 'Construction Production Index', subtitle: 'Index' },
    { id: 'house-price-index-recent-chart', url: 'https://data.ssb.no/api/v0/dataset/1061.json?lang=en', title: 'House Price Index Recent' },
    { id: 'new-detached-house-prices-national-chart', url: 'https://data.ssb.no/api/v0/dataset/25151.json?lang=en', title: 'New Detached House Prices National', subtitle: 'NOK per m²' },
    { id: 'new-dwellings-price-chart', url: 'https://data.ssb.no/api/v0/dataset/26158.json?lang=en', title: 'New Dwellings Price', subtitle: 'NOK per m²' },
    { id: 'holiday-property-sales-chart', url: 'https://data.ssb.no/api/v0/dataset/65962.json?lang=en', title: 'Holiday Property Sales', subtitle: 'Number' },
    
    // Industrial & Production
    { id: 'industrial-production-chart', url: 'https://data.ssb.no/api/v0/dataset/27002.json?lang=en', title: 'Industrial Production' },
    { id: 'producer-price-industry-chart', url: 'https://data.ssb.no/api/v0/dataset/741023.json?lang=en', title: 'Producer Price Industry' },
    { id: 'production-index-by-industry-chart', url: 'https://data.ssb.no/api/v0/dataset/27002.json?lang=en', title: 'Production Index by Industry' },
    { id: 'production-index-by-product-chart', url: 'https://data.ssb.no/api/v0/dataset/27002.json?lang=en', title: 'Production Index by Product' },
    { id: 'production-index-industry-recent-chart', url: 'https://data.ssb.no/api/v0/dataset/26953.json?lang=en', title: 'Production Index Industry Recent' },
    
    // Trade & Export/Import
    { id: 'export-volume-chart', url: 'https://data.ssb.no/api/v0/dataset/179421.json?lang=en', title: 'Export Volume', subtitle: 'NOK Million' },
    { id: 'import-value-volume-sitc-chart', url: 'https://data.ssb.no/api/v0/dataset/34640.json?lang=en', title: 'Import Value Volume SITC', subtitle: 'NOK Million' },
    { id: 'export-value-volume-sitc-chart', url: 'https://data.ssb.no/api/v0/dataset/34642.json?lang=en', title: 'Export Value Volume SITC', subtitle: 'NOK Million' },
    { id: 'import-value-volume-sitc1-chart', url: 'https://data.ssb.no/api/v0/dataset/34254.json?lang=en', title: 'Import Value Volume SITC1', subtitle: 'NOK Million' },
    { id: 'export-value-volume-sitc1-chart', url: 'https://data.ssb.no/api/v0/dataset/34256.json?lang=en', title: 'Export Value Volume SITC1', subtitle: 'NOK Million' },
    { id: 'import-value-sitc3-chart', url: 'https://data.ssb.no/api/v0/dataset/34641.json?lang=en', title: 'Import Value SITC3', subtitle: 'NOK Million' },
    { id: 'export-value-sitc3-chart', url: 'https://data.ssb.no/api/v0/dataset/34643.json?lang=en', title: 'Export Value SITC3', subtitle: 'NOK Million' },
    { id: 'trade-volume-price-bec-chart', url: 'https://data.ssb.no/api/v0/dataset/179415.json?lang=en', title: 'Trade Volume Price BEC', subtitle: 'NOK Million' },
    { id: 'trade-volume-price-product-groups-chart', url: 'https://data.ssb.no/api/v0/dataset/179417.json?lang=en', title: 'Trade Volume Price Product Groups', subtitle: 'NOK Million' },
    { id: 'trade-volume-price-sitc2-chart', url: 'https://data.ssb.no/api/v0/dataset/179418.json?lang=en', title: 'Trade Volume Price SITC2', subtitle: 'NOK Million' },
    { id: 'trade-main-figures-recent-chart', url: 'https://data.ssb.no/api/v0/dataset/179419.json?lang=en', title: 'Trade Main Figures Recent', subtitle: 'NOK Million' },
    { id: 'trade-main-figures-by-country-chart', url: 'https://data.ssb.no/api/v0/dataset/179419.json?lang=en', title: 'Trade Main Figures by Country', subtitle: 'NOK Million' },
    { id: 'export-country-chart', url: 'https://data.ssb.no/api/v0/dataset/1130.json?lang=en', title: 'Export by Country' },
    { id: 'import-country-chart', url: 'https://data.ssb.no/api/v0/dataset/1132.json?lang=en', title: 'Import by Country' },
    { id: 'export-commodity-chart', url: 'https://data.ssb.no/api/v0/dataset/1134.json?lang=en', title: 'Export by Commodity' },
    { id: 'import-commodity-chart', url: 'https://data.ssb.no/api/v0/dataset/1140.json?lang=en', title: 'Import by Commodity' },
    { id: 'export-by-country-monthly-chart', url: 'https://data.ssb.no/api/v0/dataset/1130.json?lang=en', title: 'Export by Country Monthly' },
    { id: 'import-by-country-monthly-chart', url: 'https://data.ssb.no/api/v0/dataset/1132.json?lang=en', title: 'Import by Country Monthly' },
    
    // Business & Confidence
    { id: 'business-confidence-chart', url: 'https://data.ssb.no/api/v0/dataset/166316.json?lang=en', title: 'Business Confidence', subtitle: 'Index' },
    { id: 'business-cycle-barometer-products-chart', url: 'https://data.ssb.no/api/v0/dataset/166317.json?lang=en', title: 'Business Cycle Barometer Products', subtitle: 'Index' },
    { id: 'business-cycle-barometer-chart', url: 'https://data.ssb.no/api/v0/dataset/166318.json?lang=en', title: 'Business Cycle Barometer', subtitle: 'Index' },
    { id: 'consumer-confidence-chart', url: 'https://data.ssb.no/api/v0/dataset/166316.json?lang=en', title: 'Consumer Confidence', subtitle: 'Index' },
    // REMOVED: Duplicate - using cached version below with drill-down support
    { id: 'bankruptcies-chart', url: 'https://data.ssb.no/api/v0/dataset/924816.json?lang=en', title: 'Bankruptcies', subtitle: 'Number' },
    { id: 'bankruptcies-by-industry-chart', url: 'https://data.ssb.no/api/v0/dataset/924816.json?lang=en', title: 'Bankruptcies by Industry', subtitle: 'Number' },
    
    // Monetary & Credit
    // Money Supply - Main chart (others moved to drilldown)
    { id: 'money-supply-m0-chart', url: 'https://data.ssb.no/api/v0/dataset/172771.json?lang=en', title: 'Money Supply M0', subtitle: 'NOK Million' },
    { id: 'credit-indicator-chart', url: 'https://data.ssb.no/api/v0/dataset/166326.json?lang=en', title: 'Credit Indicator', subtitle: 'NOK Million' },
    { id: 'credit-indicator-k2-detailed-chart', url: 'https://data.ssb.no/api/v0/dataset/62264.json?lang=en', title: 'Credit Indicator K2 Detailed', subtitle: 'NOK Million' },
    { id: 'credit-indicator-k2-seasonally-adjusted-chart', url: 'https://data.ssb.no/api/v0/dataset/166329.json?lang=en', title: 'Credit Indicator K2 Seasonally Adjusted', subtitle: 'NOK Million' },
    { id: 'credit-indicator-k3-chart', url: 'https://data.ssb.no/api/v0/dataset/166327.json?lang=en', title: 'Credit Indicator K3', subtitle: 'NOK Million' },
    
    // Energy & Environment
    { id: 'energy-consumption-chart', url: 'https://data.ssb.no/api/v0/dataset/928196.json?lang=en', title: 'Energy Consumption', subtitle: 'Terajoules' },
    { id: 'greenhouse-gas-emissions-chart', url: 'https://data.ssb.no/api/v0/dataset/832678.json?lang=en', title: 'Greenhouse Gas Emissions', subtitle: 'CO2 Equivalent' },
    { id: 'greenhouse-gas-chart', url: 'https://data.ssb.no/api/v0/dataset/832678.json?lang=en', title: 'Greenhouse Gas', subtitle: 'CO2 Equivalent' },
    
    // Government & Public
    { id: 'government-revenue-chart', url: 'https://data.ssb.no/api/v0/dataset/928194.json?lang=en', title: 'Government Revenue', subtitle: 'NOK Million' },
    { id: 'public-administration-expenditures-chart', url: 'https://data.ssb.no/api/v0/dataset/112175.json?lang=en', title: 'Public Administration Expenditures', subtitle: 'NOK Million' },
    { id: 'tax-returns-main-items-chart', url: 'https://data.ssb.no/api/v0/dataset/49656.json?lang=en', title: 'Tax Returns Main Items', subtitle: 'NOK Million' },
    { id: 'economic-forecasts-chart', url: 'https://data.ssb.no/api/v0/dataset/934513.json?lang=en', title: 'Economic Forecasts', subtitle: 'GDP Growth %' },
    { id: 'economic-forecasts-selected-chart', url: 'https://data.ssb.no/api/v0/dataset/934514.json?lang=en', title: 'Economic Forecasts Selected', subtitle: 'GDP Growth %' },
    { id: 'national-accounts-recent-chart', url: 'https://data.ssb.no/api/v0/dataset/59013.json?lang=en', title: 'National Accounts Recent', subtitle: 'NOK Million' },
    { id: 'international-accounts-chart', url: 'https://data.ssb.no/api/v0/dataset/924820.json?lang=en', title: 'International Accounts', subtitle: 'NOK Million' },
    
    // Labor & Wages
    { id: 'labour-cost-index-chart', url: 'https://data.ssb.no/api/v0/dataset/760065.json?lang=en', title: 'Labour Cost Index' },
    { id: 'basic-salary-chart', url: 'https://data.ssb.no/api/v0/dataset/1126.json?lang=en', title: 'Basic Salary Index' },
    { id: 'wage-chart', url: 'https://data.ssb.no/api/v0/dataset/1124.json?lang=en', title: 'Wage Index' },
    { id: 'wage-indices-by-industry-chart', url: 'https://data.ssb.no/api/v0/dataset/1124.json?lang=en', title: 'Wage Indices by Industry' },
    { id: 'wage-indices-by-industry-sn88-chart', url: 'https://data.ssb.no/api/v0/dataset/1124.json?lang=en', title: 'Wage Indices by Industry SN88' },
    { id: 'wages-by-occupation-chart', url: 'https://data.ssb.no/api/v0/dataset/1124.json?lang=en', title: 'Wages by Occupation' },
    { id: 'employed-by-residence-workplace-chart', url: 'https://data.ssb.no/api/v0/dataset/1054.json?lang=en', title: 'Employed by Residence & Workplace' },
    
    // Oil & Gas
    { id: 'oil-gas-investment-chart', url: 'https://data.ssb.no/api/v0/dataset/166334.json?lang=en', title: 'Oil & Gas Investment', subtitle: 'NOK Million' },
    { id: 'oil-gas-industry-turnover-chart', url: 'https://data.ssb.no/api/v0/dataset/124341.json?lang=en', title: 'Oil & Gas Industry Turnover', subtitle: 'NOK Million' },
    { id: 'oil-gas-industry-turnover-sn2007-chart', url: 'https://data.ssb.no/api/v0/dataset/124322.json?lang=en', title: 'Oil & Gas Industry Turnover SN2007', subtitle: 'NOK Million' },
    { id: 'oil-gas-turnover-chart', url: 'https://data.ssb.no/api/v0/dataset/124341.json?lang=en', title: 'Oil & Gas Turnover', subtitle: 'NOK Million' },
    
    // Research & Development
    { id: 'r-d-expenditure-chart', url: 'https://data.ssb.no/api/v0/dataset/61819.json?lang=en', title: 'R&D Expenditure', subtitle: 'NOK Million' },
    { id: 'rd-expenditure-chart', url: 'https://data.ssb.no/api/v0/dataset/61819.json?lang=en', title: 'Research & Development Expenditure', subtitle: 'NOK Million' },
    
    // Retail & Sales
    { id: 'retail-sales-chart', url: 'https://data.ssb.no/api/v0/dataset/1064.json?lang=en', title: 'Retail Sales', subtitle: 'Index' },
    { id: 'retail-sales-seasonally-adjusted-chart', url: 'https://data.ssb.no/api/v0/dataset/1064.json?lang=en', title: 'Retail Sales Seasonally Adjusted', subtitle: 'Index' },
    { id: 'salmon-export-value-chart', url: 'https://data.ssb.no/api/v0/dataset/1122.json?lang=en', title: 'Salmon Export Value', subtitle: 'NOK Million' },
    { id: 'salmon-export-chart', url: 'https://data.ssb.no/api/v0/dataset/1122.json?lang=en', title: 'Salmon Export', subtitle: 'NOK Million' },
    { id: 'salmon-export-volume-chart', url: 'https://data.ssb.no/api/v0/dataset/1120.json?lang=en', title: 'Salmon Export Volume', subtitle: 'Tonnes' },
    
    // Population & Demographics
    { id: 'immigration-rate-chart', url: 'https://data.ssb.no/api/v0/dataset/48651.json?lang=en', title: 'Immigration Rate', subtitle: 'Annual Count' },
    { id: 'immigrants-with-immigrant-parents-chart', url: 'https://data.ssb.no/api/v0/dataset/96304.json?lang=en', title: 'Immigrants with Immigrant Parents', subtitle: 'Number' },
    // Population charts - Main chart (others moved to drilldown)
    { id: 'population-basic-districts-national-chart', url: 'https://data.ssb.no/api/v0/dataset/49626.json?lang=en', title: 'Population Basic Districts National', subtitle: 'Number' },
    { id: 'births-deaths-chart', url: 'https://data.ssb.no/api/v0/dataset/1106.json?lang=en', title: 'Births & Deaths', subtitle: 'Number' },
    { id: 'deaths-age-chart', url: 'https://data.ssb.no/api/v0/dataset/567324.json?lang=en', title: 'Deaths by Age', subtitle: 'Number' },
    { id: 'deaths-by-week-age-chart', url: 'https://data.ssb.no/api/v0/dataset/567324.json?lang=en', title: 'Deaths by Week & Age', subtitle: 'Number' },
    
    // Household & Living
    { id: 'household-income-chart', url: 'https://data.ssb.no/api/v0/dataset/56900.json?lang=en', title: 'Household Income', subtitle: 'Median NOK' },
    { id: 'household-income-national-chart', url: 'https://data.ssb.no/api/v0/dataset/56957.json?lang=en', title: 'Household Income National', subtitle: 'Median NOK' },
    { id: 'household-income-size-chart', url: 'https://data.ssb.no/api/v0/dataset/56957.json?lang=en', title: 'Household Income by Size', subtitle: 'Median NOK' },
    { id: 'household-consumption-chart', url: 'https://data.ssb.no/api/v0/dataset/166330.json?lang=en', title: 'Household Consumption' },
    { id: 'household-types-chart', url: 'https://data.ssb.no/api/v0/dataset/1068.json?lang=en', title: 'Household Types', subtitle: 'Number' },
    { id: 'cohabiting-arrangements-chart', url: 'https://data.ssb.no/api/v0/dataset/85440.json?lang=en', title: 'Cohabiting Arrangements', subtitle: 'Number' },
    { id: 'living-arrangements-national-chart', url: 'https://data.ssb.no/api/v0/dataset/86813.json?lang=en', title: 'Living Arrangements National', subtitle: 'Number' },
    { id: 'utility-floor-space-chart', url: 'https://data.ssb.no/api/v0/dataset/95177.json?lang=en', title: 'Utility Floor Space', subtitle: 'Square meters' },
    
    // Social & Health
    { id: 'crime-rate-chart', url: 'https://data.ssb.no/api/v0/dataset/97445.json?lang=en', title: 'Crime Rate', subtitle: 'Annual Count' },
    { id: 'education-level-chart', url: 'https://data.ssb.no/api/v0/dataset/85454.json?lang=en', title: 'Education Level', subtitle: 'Percentage' },
    { id: 'lifestyle-habits-chart', url: 'https://data.ssb.no/api/v0/dataset/832683.json?lang=en', title: 'Lifestyle Habits', subtitle: 'Percentage' },
    { id: 'long-term-illness-chart', url: 'https://data.ssb.no/api/v0/dataset/832685.json?lang=en', title: 'Long-term Illness', subtitle: 'Percentage' },
    
    // === CPI CHARTS (MOVED TO DRILLDOWN) ===
    // All CPI charts except the main one have been moved to drilldown-configs.js
    
    // === PRODUCER PRICE INDEX CHARTS (Detailed) ===
    { id: 'ppi-chart', url: 'https://data.ssb.no/api/v0/dataset/26426.json?lang=en', title: 'Producer Price Index (PPI)' },
    { id: 'producer-price-index-industries-chart', url: 'https://data.ssb.no/api/v0/dataset/26430.json?lang=en', title: 'Producer Price Index Industries' },
    { id: 'producer-price-index-products-chart', url: 'https://data.ssb.no/api/v0/dataset/26431.json?lang=en', title: 'Producer Price Index Products' },
    { id: 'producer-price-index-subgroups-chart', url: 'https://data.ssb.no/api/v0/dataset/26429.json?lang=en', title: 'Producer Price Index Subgroups' },
    { id: 'producer-price-index-subgroups-detailed-chart', url: 'https://data.ssb.no/api/v0/dataset/26432.json?lang=en', title: 'Producer Price Index Subgroups Detailed' },
    { id: 'producer-price-index-recent-chart', url: 'https://data.ssb.no/api/v0/dataset/26428.json?lang=en', title: 'Producer Price Index Recent' },
    { id: 'producer-price-index-totals-recent-chart', url: 'https://data.ssb.no/api/v0/dataset/26433.json?lang=en', title: 'Producer Price Index Totals Recent' },
    
    // === FIRST HAND PRICE INDEX ===
    { id: 'first-hand-price-index-chart', url: 'https://data.ssb.no/api/v0/dataset/82677.json?lang=en', title: 'First Hand Price Index' },
    { id: 'first-hand-price-index-groups-chart', url: 'https://data.ssb.no/api/v0/dataset/82679.json?lang=en', title: 'First Hand Price Index Groups' },
    { id: 'first-hand-price-index-subgroups-chart', url: 'https://data.ssb.no/api/v0/dataset/82681.json?lang=en', title: 'First Hand Price Index Subgroups' },
    
    // === NORGES BANK - EXCHANGE RATES & INTEREST RATE ===
    { id: 'key-policy-rate-chart', url: './data/cached/norges-bank/interest-rate.json', title: 'Key Policy Rate', subtitle: 'Percentage', type: 'line' },
    // Exchange Rates - Main chart (others moved to drilldown)
    { id: 'i44-nok-chart', url: './data/cached/norges-bank/exchange-rates/i44.json', title: 'I44/NOK Exchange Rate', subtitle: 'Norwegian Krone per I44 Index', type: 'line' },
    
    // === OSLO STOCK EXCHANGE INDICES ===
    // Oslo Indices - Main chart (others moved to drilldown)
    { id: 'oseax-chart', url: './data/cached/oslo-indices/oseax.json', title: 'OSEAX - Oslo Stock Exchange All Share Index', subtitle: 'Index Value', type: 'line' },
    
    // === OIL FUND ===
    // REMOVED: Individual charts moved to drill-down (see below)
    
    // === NVE RESERVOIR STATISTICS (Split by Area) ===
    { id: 'nve-norge-reservoir-chart', url: './data/cached/nve/norge-reservoir.json', title: 'NVE Reservoir Fill - Norge (Total)', subtitle: 'Magasinfylling %', type: 'line' },
    { id: 'nve-no1-reservoir-chart', url: './data/cached/nve/no1-reservoir.json', title: 'NVE Reservoir Fill - NO1 (Østlandet)', subtitle: 'Magasinfylling %', type: 'line' },
    { id: 'nve-no2-reservoir-chart', url: './data/cached/nve/no2-reservoir.json', title: 'NVE Reservoir Fill - NO2 (Sørlandet)', subtitle: 'Magasinfylling %', type: 'line' },
    { id: 'nve-no3-reservoir-chart', url: './data/cached/nve/no3-reservoir.json', title: 'NVE Reservoir Fill - NO3 (Vestlandet)', subtitle: 'Magasinfylling %', type: 'line' },
    { id: 'nve-no4-reservoir-chart', url: './data/cached/nve/no4-reservoir.json', title: 'NVE Reservoir Fill - NO4 (Trøndelag)', subtitle: 'Magasinfylling %', type: 'line' },
    { id: 'nve-no5-reservoir-chart', url: './data/cached/nve/no5-reservoir.json', title: 'NVE Reservoir Fill - NO5 (Nord-Norge)', subtitle: 'Magasinfylling %', type: 'line' },
    { id: 'nve-reservoir-fill-chart', url: './data/static/nve-reservoir-fill.json', title: 'Annual Reservoir Fill', subtitle: 'Percent', type: 'line' },
    
    // === SSB EXPORT BY COUNTRY (Aggregate - drill-down available) ===
    // Individual countries moved to drilldown-configs.js
    
    // === SSB BANKRUPTCIES BY INDUSTRY (Quarterly Data) ===
    { id: 'bankruptcies-total-chart', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-total.json', title: 'Bankruptcies - Total (All Industries)', subtitle: 'Number per quarter', type: 'line' },
    
    // === SSB CPI (with drill-down) ===
    { id: 'cpi-chart', url: './data/cached/ssb/cpi.json', title: 'Consumer Price Index (CPI)', subtitle: 'Index (2015=100)', type: 'line' },
    
    // === SSB IMPORT BY COUNTRY (with drill-down) ===
    { id: 'import-country-chart', url: './data/cached/ssb/import-country.json', title: 'Import by Country', subtitle: 'NOK', type: 'line' },
    
    // === VACCINATION COVERAGE (with drill-down) ===
    
    // === DFO GOVERNMENT SPENDING (with drill-down) ===
    { id: 'dfo-total-chart', url: './data/cached/dfo/total-government-expenditure.json', title: 'Total Government Expenditure', subtitle: 'NOK', type: 'line' },
    
    // === OIL FUND (with drill-down) ===
    { id: 'oil-fund-total-chart', url: './data/cached/oil-fund.json', title: 'Norwegian Oil Fund - Total Value', subtitle: 'Billion NOK', type: 'line' },
    
    // === STATNETT ELECTRICITY DATA ===
    { id: 'statnett-latest-detailed-overview-chart', url: './data/cached/statnett/latest-detailed-overview.json', title: 'Statnett Latest Detailed Overview', subtitle: 'Nåværende elektrisitetsproduksjon og forbruk', type: 'statnett-production-consumption' },
    
    // === OUR WORLD IN DATA (OWID) CHARTS ===
    { id: 'norway-oda-per-capita-chart', url: './data/cached/oda_per_capita.json', title: 'ODA per Capita', subtitle: 'USD per capita', type: 'line' },
    { id: 'norway-internet-usage-chart', url: './data/cached/internet_use.json', title: 'Internet Usage', subtitle: '% of population', type: 'line' },
    { id: 'norway-homicide-rate-chart', url: './data/cached/homicide_rate.json', title: 'Homicide Rate', subtitle: 'per 100,000 population', type: 'line' },
    { id: 'norway-maternal-mortality-chart', url: './data/cached/maternal_mortality.json', title: 'Maternal Mortality', subtitle: 'deaths per 100,000 live births', type: 'line' },
    { id: 'norway-military-spending-chart', url: './data/cached/military_spending.json', title: 'Military Spending', subtitle: '% of GDP', type: 'line' },
    { id: 'norway-women-parliament-chart', url: './data/cached/women_in_parliament.json', title: 'Women in Parliament', subtitle: '% of parliament', type: 'line' },
    { id: 'norway-co2-per-capita-chart', url: './data/cached/co2_per_capita.json', title: 'CO₂ Emissions per Capita', subtitle: 'tonnes per person', type: 'line' },
    
    // Vaccination Coverage - Main chart (others moved to drilldown)
    { id: 'norway-vaccination-pol3-chart', url: './data/cached/vaccination_pol3.json', title: 'Vaccination - Pol3 (Polio)', subtitle: '% coverage', type: 'line' },
    
    { id: 'norway-child-mortality-chart', url: './data/cached/child_mortality.json', title: 'Child Mortality', subtitle: 'deaths per 100 live births', type: 'line' },
    { id: 'norway-life-expectancy-chart', url: './data/cached/life_expectancy.json', title: 'Life Expectancy', subtitle: 'years', type: 'line' },
    { id: 'norway-employment-agriculture-chart', url: './data/cached/employment_in_agriculture_share.json', title: 'Employment in Agriculture Share', subtitle: '% of labor force', type: 'line' },
    { id: 'norway-daily-calories-chart', url: './data/cached/daily_calories.json', title: 'Daily Calories', subtitle: 'kilocalories per day', type: 'line' },
    { id: 'norway-median-age-chart', url: './data/cached/median_age.json', title: 'Median Age', subtitle: 'years', type: 'line' },
    { id: 'norway-fertility-rate-chart', url: './data/cached/fertility_rate_period.json', title: 'Fertility Rate', subtitle: 'live births per woman', type: 'line' },
    { id: 'norway-mean-income-per-day-chart', url: './data/cached/mean_income_per_day.json', title: 'Mean Income per Day', subtitle: 'international-$ (2021 prices) per day', type: 'line' },
    { id: 'norway-armed-forces-personnel-chart', url: './data/cached/armed_forces_personnel.json', title: 'Armed Forces Personnel', subtitle: 'persons', type: 'line' },
    { id: 'norway-alcohol-consumption-chart', url: './data/cached/alcohol_consumption_per_capita.json', title: 'Alcohol Consumption per Capita', subtitle: 'liters of pure alcohol per person (15+) per year', type: 'line' },
    { id: 'norway-trade-share-gdp-chart', url: './data/cached/trade_share_gdp.json', title: 'Trade Share of GDP', subtitle: '% of GDP', type: 'line' },
    { id: 'norway-energy-use-per-capita-chart', url: './data/cached/energy_use_per_capita.json', title: 'Energy Use per Capita', subtitle: 'kilowatt-hours per person', type: 'line' },
    { id: 'norway-marriage-rate-chart', url: './data/cached/marriage_rate.json', title: 'Marriage Rate', subtitle: 'per 1,000 people', type: 'line' },
    { id: 'norway-electric-car-sales-share-chart', url: './data/cached/electric_car_sales_share.json', title: 'Electric Car Sales Share', subtitle: '% of new car sales', type: 'line' },
    { id: 'norway-weekly-covid-cases-chart', url: './data/cached/weekly_covid_cases.json', title: 'Weekly COVID Cases', subtitle: 'weekly confirmed cases', type: 'line' },
    { id: 'norway-no-education-share-chart', url: './data/cached/no_education_share.json', title: 'No Education Share', subtitle: '% of population (ages 15-64)', type: 'line' },
    { id: 'norway-avg-years-schooling-chart', url: './data/cached/avg_years_schooling.json', title: 'Average Years Schooling', subtitle: 'years (ages 25+)', type: 'line' },
    { id: 'norway-pisa-science-chart', url: './data/cached/pisa_science.json', title: 'PISA Science', subtitle: 'PISA score (mean=500, SD=100)', type: 'line' },
    { id: 'norway-pisa-reading-chart', url: './data/cached/pisa_reading.json', title: 'PISA Reading', subtitle: 'PISA score (mean=500, SD=100)', type: 'line' },
    { id: 'norway-rnd-researchers-chart', url: './data/cached/rnd_researchers.json', title: 'R&D Researchers', subtitle: 'per million people', type: 'line' },
    { id: 'norway-tourist-trips-chart', url: './data/cached/tourist_trips.json', title: 'Tourist Trips', subtitle: 'international tourist arrivals', type: 'line' },
    
];

// ============================================================================
// TOTAL: 263 WORKING CHARTS ✅
// - 176 SSB (cached data from 125 unique files)
// - 30 DFO (Norwegian Government Department Budgets 2014-2024)
// - 34 OWID (including 9 vaccination antigens)
// - 8 Norges Bank (SDMX format - interest rate + 7 exchange rates)
// - 7 NVE (6 reservoir areas + 1 annual fill)
// - 5 Oil Fund (Total, Fixed Income, Equities, Real Estate, Renewable)
// - 3 Oslo Børs (OSEAX, OSEBX, OBX)
// - 1 Statnett (Electricity Production & Consumption)
// ============================================================================

