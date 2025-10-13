// ============================================================================
// CHART CONFIGURATIONS - ONLY WORKING CHARTS
// ============================================================================
// Metadata (subtitle, sourceUrl, sourceName) is auto-inferred from URL in main.js

export const chartConfigs = [
    // === SSB CHARTS (ALL 125 FILES) ===
    // Core Economic Indicators
    { id: 'cpi-chart', url: 'https://data.ssb.no/api/v0/dataset/1086.json?lang=en', title: 'Consumer Price Index' },
    { id: 'unemployment-chart', url: 'https://data.ssb.no/api/v0/dataset/1054.json?lang=en', title: 'Unemployment Rate', subtitle: 'Percentage' },
    { id: 'house-prices-chart', url: 'https://data.ssb.no/api/v0/dataset/1060.json?lang=en', title: 'House Price Index' },
    { id: 'producer-price-index-chart', url: 'https://data.ssb.no/api/v0/dataset/26426.json?lang=en', title: 'Producer Price Index' },
    { id: 'wage-index-chart', url: 'https://data.ssb.no/api/v0/dataset/1124.json?lang=en', title: 'Wage Index' },
    { id: 'population-growth-chart', url: 'https://data.ssb.no/api/v0/dataset/49626.json?lang=en', title: 'Population Growth', subtitle: 'Annual %' },
    
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
    { id: 'monetary-aggregates-chart', url: 'https://data.ssb.no/api/v0/dataset/172769.json?lang=en', title: 'Monetary Aggregates', subtitle: 'NOK Million' },
    { id: 'monetary-m3-chart', url: 'https://data.ssb.no/api/v0/dataset/172793.json?lang=en', title: 'Monetary Aggregate M3', subtitle: 'Million NOK' },
    { id: 'money-supply-m0-chart', url: 'https://data.ssb.no/api/v0/dataset/172771.json?lang=en', title: 'Money Supply M0', subtitle: 'NOK Million' },
    { id: 'money-supply-m3-net-claims-chart', url: 'https://data.ssb.no/api/v0/dataset/172800.json?lang=en', title: 'Money Supply M3 Net Claims', subtitle: 'NOK Million' },
    { id: 'money-supply-by-sector-chart', url: 'https://data.ssb.no/api/v0/dataset/172769.json?lang=en', title: 'Money Supply by Sector', subtitle: 'NOK Million' },
    { id: 'money-supply-m3-by-sector-chart', url: 'https://data.ssb.no/api/v0/dataset/172793.json?lang=en', title: 'Money Supply M3 by Sector', subtitle: 'NOK Million' },
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
    { id: 'population-age-chart', url: 'https://data.ssb.no/api/v0/dataset/1074.json?lang=en', title: 'Population by Age', subtitle: 'Number' },
    { id: 'population-by-gender-age-5year-chart', url: 'https://data.ssb.no/api/v0/dataset/1074.json?lang=en', title: 'Population by Gender & Age (5-year groups)', subtitle: 'Number' },
    { id: 'population-by-gender-age-historical-chart', url: 'https://data.ssb.no/api/v0/dataset/1074.json?lang=en', title: 'Population by Gender & Age Historical', subtitle: 'Number' },
    { id: 'population-by-gender-age-timeline-chart', url: 'https://data.ssb.no/api/v0/dataset/1074.json?lang=en', title: 'Population by Gender & Age Timeline', subtitle: 'Number' },
    { id: 'population-development-quarterly-chart', url: 'https://data.ssb.no/api/v0/dataset/1104.json?lang=en', title: 'Population Development Quarterly', subtitle: 'Number' },
    { id: 'population-growth-alt-chart', url: 'https://data.ssb.no/api/v0/dataset/49626.json?lang=en', title: 'Population Growth Alternative', subtitle: 'Annual %' },
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
    
    // === CPI CHARTS (Detailed) ===
    { id: 'cpi-adjusted-indices-chart', url: 'https://data.ssb.no/api/v0/dataset/1118.json?lang=en', title: 'CPI Adjusted Indices' },
    { id: 'cpi-ate-chart', url: 'https://data.ssb.no/api/v0/dataset/1118.json?lang=en', title: 'CPI-ATE (Adjusted for Tax & Energy)' },
    { id: 'cpi-group-level-chart', url: 'https://data.ssb.no/api/v0/dataset/1092.json?lang=en', title: 'CPI Group Level' },
    { id: 'cpi-coicop-chart', url: 'https://data.ssb.no/api/v0/dataset/1084.json?lang=en', title: 'CPI COICOP Divisions' },
    { id: 'cpi-delivery-chart', url: 'https://data.ssb.no/api/v0/dataset/1100.json?lang=en', title: 'CPI Delivery Sectors' },
    { id: 'cpi-delivery-sector-annual-chart', url: 'https://data.ssb.no/api/v0/dataset/1100.json?lang=en', title: 'CPI Delivery Sector Annual' },
    { id: 'cpi-delivery-sector-recent-chart', url: 'https://data.ssb.no/api/v0/dataset/1101.json?lang=en', title: 'CPI Delivery Sector Recent' },
    { id: 'cpi-sub-groups-chart', url: 'https://data.ssb.no/api/v0/dataset/1090.json?lang=en', title: 'CPI Sub-groups' },
    { id: 'cpi-subgroups-chart', url: 'https://data.ssb.no/api/v0/dataset/1090.json?lang=en', title: 'CPI Subgroups' },
    { id: 'cpi-subgroup-level2-chart', url: 'https://data.ssb.no/api/v0/dataset/1094.json?lang=en', title: 'CPI Subgroup Level 2' },
    { id: 'cpi-items-chart', url: 'https://data.ssb.no/api/v0/dataset/1096.json?lang=en', title: 'CPI Items' },
    { id: 'cpi-seasonally-adjusted-chart', url: 'https://data.ssb.no/api/v0/dataset/45590.json?lang=en', title: 'CPI Seasonally Adjusted' },
    { id: 'cpi-seasonally-adjusted-recent-chart', url: 'https://data.ssb.no/api/v0/dataset/45590.json?lang=en', title: 'CPI Seasonally Adjusted Recent' },
    { id: 'cpi-adjusted-delivery-sector-chart', url: 'https://data.ssb.no/api/v0/dataset/130297.json?lang=en', title: 'CPI Adjusted Delivery Sector' },
    { id: 'cpi-adjusted-delivery-sector-recent-chart', url: 'https://data.ssb.no/api/v0/dataset/130299.json?lang=en', title: 'CPI Adjusted Delivery Sector Recent' },
    { id: 'cpi-total-index-recent-chart', url: 'https://data.ssb.no/api/v0/dataset/1087.json?lang=en', title: 'CPI Total Index Recent' },
    { id: 'cpi-weights-subgroup-chart', url: 'https://data.ssb.no/api/v0/dataset/1090.json?lang=en', title: 'CPI Weights Subgroup' },
    
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
    { id: 'usd-nok-chart', url: './data/cached/norges-bank/exchange-rates/usd.json', title: 'USD/NOK Exchange Rate', subtitle: 'Norwegian Krone per US Dollar', type: 'line' },
    { id: 'eur-nok-chart', url: './data/cached/norges-bank/exchange-rates/eur.json', title: 'EUR/NOK Exchange Rate', subtitle: 'Norwegian Krone per Euro', type: 'line' },
    { id: 'gbp-nok-chart', url: './data/cached/norges-bank/exchange-rates/gbp.json', title: 'GBP/NOK Exchange Rate', subtitle: 'Norwegian Krone per British Pound', type: 'line' },
    { id: 'chf-nok-chart', url: './data/cached/norges-bank/exchange-rates/chf.json', title: 'CHF/NOK Exchange Rate', subtitle: 'Norwegian Krone per Swiss Franc', type: 'line' },
    { id: 'sek-nok-chart', url: './data/cached/norges-bank/exchange-rates/sek.json', title: 'SEK/NOK Exchange Rate', subtitle: 'Norwegian Krone per Swedish Krona', type: 'line' },
    { id: 'cny-nok-chart', url: './data/cached/norges-bank/exchange-rates/cny.json', title: 'CNY/NOK Exchange Rate', subtitle: 'Norwegian Krone per Chinese Yuan', type: 'line' },
    { id: 'i44-nok-chart', url: './data/cached/norges-bank/exchange-rates/i44.json', title: 'I44/NOK Exchange Rate', subtitle: 'Norwegian Krone per I44 Index', type: 'line' },
    
    // === OSLO STOCK EXCHANGE INDICES ===
    { id: 'oseax-chart', url: './data/cached/oslo-indices/oseax.json', title: 'OSEAX - Oslo Stock Exchange All Share Index', subtitle: 'Index Value', type: 'line' },
    { id: 'osebx-chart', url: './data/cached/oslo-indices/osebx.json', title: 'OSEBX - Oslo Stock Exchange Benchmark Index', subtitle: 'Index Value', type: 'line' },
    { id: 'obx-chart', url: './data/cached/oslo-indices/obx.json', title: 'OBX - Oslo Børs Total Return Index', subtitle: 'Index Value', type: 'line' },
    
    // === OIL FUND ===
    { id: 'oil-fund-chart', url: './data/cached/oil-fund.json', title: 'Oil Fund Total Market Value', subtitle: 'Billion NOK', type: 'line' },
    { id: 'oil-fund-fixed-income-chart', url: './data/cached/oil-fund-fixed-income.json', title: 'Oil Fund Fixed Income', subtitle: 'Billion NOK', type: 'line' },
    { id: 'oil-fund-equities-chart', url: './data/cached/oil-fund-equities.json', title: 'Oil Fund Equities', subtitle: 'Billion NOK', type: 'line' },
    { id: 'oil-fund-real-estate-chart', url: './data/cached/oil-fund-real-estate.json', title: 'Oil Fund Real Estate', subtitle: 'Billion NOK', type: 'line' },
    { id: 'oil-fund-renewable-infrastructure-chart', url: './data/cached/oil-fund-renewable-infrastructure.json', title: 'Oil Fund Renewable Infrastructure', subtitle: 'Billion NOK', type: 'line' },
    
    // === NVE RESERVOIR STATISTICS (Split by Area) ===
    { id: 'nve-norge-reservoir-chart', url: './data/cached/nve/norge-reservoir.json', title: 'NVE Reservoir Fill - Norge (Total)', subtitle: 'Magasinfylling %', type: 'line' },
    { id: 'nve-no1-reservoir-chart', url: './data/cached/nve/no1-reservoir.json', title: 'NVE Reservoir Fill - NO1 (Østlandet)', subtitle: 'Magasinfylling %', type: 'line' },
    { id: 'nve-no2-reservoir-chart', url: './data/cached/nve/no2-reservoir.json', title: 'NVE Reservoir Fill - NO2 (Sørlandet)', subtitle: 'Magasinfylling %', type: 'line' },
    { id: 'nve-no3-reservoir-chart', url: './data/cached/nve/no3-reservoir.json', title: 'NVE Reservoir Fill - NO3 (Vestlandet)', subtitle: 'Magasinfylling %', type: 'line' },
    { id: 'nve-no4-reservoir-chart', url: './data/cached/nve/no4-reservoir.json', title: 'NVE Reservoir Fill - NO4 (Trøndelag)', subtitle: 'Magasinfylling %', type: 'line' },
    { id: 'nve-no5-reservoir-chart', url: './data/cached/nve/no5-reservoir.json', title: 'NVE Reservoir Fill - NO5 (Nord-Norge)', subtitle: 'Magasinfylling %', type: 'line' },
    { id: 'nve-reservoir-fill-chart', url: './data/static/nve-reservoir-fill.json', title: 'Norway Annual Reservoir Fill', subtitle: 'Percent', type: 'line' },
    
    // === SSB EXPORT BY COUNTRY (Top Trading Partners) ===
    { id: 'export-gb-chart', url: './data/cached/ssb/export-by-country/export-gb.json', title: 'Norwegian Exports to United Kingdom', subtitle: 'NOK', type: 'line' },
    { id: 'export-de-chart', url: './data/cached/ssb/export-by-country/export-de.json', title: 'Norwegian Exports to Germany', subtitle: 'NOK', type: 'line' },
    { id: 'export-us-chart', url: './data/cached/ssb/export-by-country/export-us.json', title: 'Norwegian Exports to USA', subtitle: 'NOK', type: 'line' },
    { id: 'export-nl-chart', url: './data/cached/ssb/export-by-country/export-nl.json', title: 'Norwegian Exports to Netherlands', subtitle: 'NOK', type: 'line' },
    { id: 'export-fr-chart', url: './data/cached/ssb/export-by-country/export-fr.json', title: 'Norwegian Exports to France', subtitle: 'NOK', type: 'line' },
    { id: 'export-se-chart', url: './data/cached/ssb/export-by-country/export-se.json', title: 'Norwegian Exports to Sweden', subtitle: 'NOK', type: 'line' },
    { id: 'export-dk-chart', url: './data/cached/ssb/export-by-country/export-dk.json', title: 'Norwegian Exports to Denmark', subtitle: 'NOK', type: 'line' },
    { id: 'export-cn-chart', url: './data/cached/ssb/export-by-country/export-cn.json', title: 'Norwegian Exports to China', subtitle: 'NOK', type: 'line' },
    { id: 'export-pl-chart', url: './data/cached/ssb/export-by-country/export-pl.json', title: 'Norwegian Exports to Poland', subtitle: 'NOK', type: 'line' },
    { id: 'export-be-chart', url: './data/cached/ssb/export-by-country/export-be.json', title: 'Norwegian Exports to Belgium', subtitle: 'NOK', type: 'line' },
    { id: 'export-es-chart', url: './data/cached/ssb/export-by-country/export-es.json', title: 'Norwegian Exports to Spain', subtitle: 'NOK', type: 'line' },
    { id: 'export-it-chart', url: './data/cached/ssb/export-by-country/export-it.json', title: 'Norwegian Exports to Italy', subtitle: 'NOK', type: 'line' },
    { id: 'export-fi-chart', url: './data/cached/ssb/export-by-country/export-fi.json', title: 'Norwegian Exports to Finland', subtitle: 'NOK', type: 'line' },
    { id: 'export-jp-chart', url: './data/cached/ssb/export-by-country/export-jp.json', title: 'Norwegian Exports to Japan', subtitle: 'NOK', type: 'line' },
    { id: 'export-kr-chart', url: './data/cached/ssb/export-by-country/export-kr.json', title: 'Norwegian Exports to South Korea', subtitle: 'NOK', type: 'line' },
    { id: 'export-br-chart', url: './data/cached/ssb/export-by-country/export-br.json', title: 'Norwegian Exports to Brazil', subtitle: 'NOK', type: 'line' },
    { id: 'export-ca-chart', url: './data/cached/ssb/export-by-country/export-ca.json', title: 'Norwegian Exports to Canada', subtitle: 'NOK', type: 'line' },
    { id: 'export-au-chart', url: './data/cached/ssb/export-by-country/export-au.json', title: 'Norwegian Exports to Australia', subtitle: 'NOK', type: 'line' },
    { id: 'export-in-chart', url: './data/cached/ssb/export-by-country/export-in.json', title: 'Norwegian Exports to India', subtitle: 'NOK', type: 'line' },
    { id: 'export-ru-chart', url: './data/cached/ssb/export-by-country/export-ru.json', title: 'Norwegian Exports to Russia', subtitle: 'NOK', type: 'line' },
    { id: 'export-tr-chart', url: './data/cached/ssb/export-by-country/export-tr.json', title: 'Norwegian Exports to Türkiye', subtitle: 'NOK', type: 'line' },
    { id: 'export-ch-chart', url: './data/cached/ssb/export-by-country/export-ch.json', title: 'Norwegian Exports to Switzerland', subtitle: 'NOK', type: 'line' },
    { id: 'export-at-chart', url: './data/cached/ssb/export-by-country/export-at.json', title: 'Norwegian Exports to Austria', subtitle: 'NOK', type: 'line' },
    { id: 'export-pt-chart', url: './data/cached/ssb/export-by-country/export-pt.json', title: 'Norwegian Exports to Portugal', subtitle: 'NOK', type: 'line' },
    { id: 'export-gr-chart', url: './data/cached/ssb/export-by-country/export-gr.json', title: 'Norwegian Exports to Greece', subtitle: 'NOK', type: 'line' },
    { id: 'export-ie-chart', url: './data/cached/ssb/export-by-country/export-ie.json', title: 'Norwegian Exports to Ireland', subtitle: 'NOK', type: 'line' },
    { id: 'export-cz-chart', url: './data/cached/ssb/export-by-country/export-cz.json', title: 'Norwegian Exports to Czechia', subtitle: 'NOK', type: 'line' },
    { id: 'export-ro-chart', url: './data/cached/ssb/export-by-country/export-ro.json', title: 'Norwegian Exports to Romania', subtitle: 'NOK', type: 'line' },
    { id: 'export-hu-chart', url: './data/cached/ssb/export-by-country/export-hu.json', title: 'Norwegian Exports to Hungary', subtitle: 'NOK', type: 'line' },
    { id: 'export-no-chart', url: './data/cached/ssb/export-by-country/export-bg.json', title: 'Norwegian Exports to Bulgaria', subtitle: 'NOK', type: 'line' },
    { id: 'export-sk-chart', url: './data/cached/ssb/export-by-country/export-sk.json', title: 'Norwegian Exports to Slovakia', subtitle: 'NOK', type: 'line' },
    { id: 'export-hr-chart', url: './data/cached/ssb/export-by-country/export-hr.json', title: 'Norwegian Exports to Croatia', subtitle: 'NOK', type: 'line' },
    { id: 'export-lt-chart', url: './data/cached/ssb/export-by-country/export-lt.json', title: 'Norwegian Exports to Lithuania', subtitle: 'NOK', type: 'line' },
    { id: 'export-lv-chart', url: './data/cached/ssb/export-by-country/export-lv.json', title: 'Norwegian Exports to Latvia', subtitle: 'NOK', type: 'line' },
    { id: 'export-ee-chart', url: './data/cached/ssb/export-by-country/export-ee.json', title: 'Norwegian Exports to Estonia', subtitle: 'NOK', type: 'line' },
    { id: 'export-si-chart', url: './data/cached/ssb/export-by-country/export-si.json', title: 'Norwegian Exports to Slovenia', subtitle: 'NOK', type: 'line' },
    { id: 'export-is-chart', url: './data/cached/ssb/export-by-country/export-is.json', title: 'Norwegian Exports to Iceland', subtitle: 'NOK', type: 'line' },
    { id: 'export-gl-chart', url: './data/cached/ssb/export-by-country/export-gl.json', title: 'Norwegian Exports to Greenland', subtitle: 'NOK', type: 'line' },
    { id: 'export-fo-chart', url: './data/cached/ssb/export-by-country/export-fo.json', title: 'Norwegian Exports to Faroe Islands', subtitle: 'NOK', type: 'line' },
    { id: 'export-sg-chart', url: './data/cached/ssb/export-by-country/export-sg.json', title: 'Norwegian Exports to Singapore', subtitle: 'NOK', type: 'line' },
    { id: 'export-th-chart', url: './data/cached/ssb/export-by-country/export-th.json', title: 'Norwegian Exports to Thailand', subtitle: 'NOK', type: 'line' },
    { id: 'export-vn-chart', url: './data/cached/ssb/export-by-country/export-vn.json', title: 'Norwegian Exports to Vietnam', subtitle: 'NOK', type: 'line' },
    { id: 'export-id-chart', url: './data/cached/ssb/export-by-country/export-id.json', title: 'Norwegian Exports to Indonesia', subtitle: 'NOK', type: 'line' },
    { id: 'export-my-chart', url: './data/cached/ssb/export-by-country/export-my.json', title: 'Norwegian Exports to Malaysia', subtitle: 'NOK', type: 'line' },
    { id: 'export-ph-chart', url: './data/cached/ssb/export-by-country/export-ph.json', title: 'Norwegian Exports to Philippines', subtitle: 'NOK', type: 'line' },
    { id: 'export-tw-chart', url: './data/cached/ssb/export-by-country/export-tw.json', title: 'Norwegian Exports to Taiwan', subtitle: 'NOK', type: 'line' },
    { id: 'export-hk-chart', url: './data/cached/ssb/export-by-country/export-hk.json', title: 'Norwegian Exports to Hong Kong', subtitle: 'NOK', type: 'line' },
    { id: 'export-nz-chart', url: './data/cached/ssb/export-by-country/export-nz.json', title: 'Norwegian Exports to New Zealand', subtitle: 'NOK', type: 'line' },
    { id: 'export-za-chart', url: './data/cached/ssb/export-by-country/export-za.json', title: 'Norwegian Exports to South Africa', subtitle: 'NOK', type: 'line' },
    { id: 'export-eg-chart', url: './data/cached/ssb/export-by-country/export-eg.json', title: 'Norwegian Exports to Egypt', subtitle: 'NOK', type: 'line' },
    { id: 'export-ng-chart', url: './data/cached/ssb/export-by-country/export-ng.json', title: 'Norwegian Exports to Nigeria', subtitle: 'NOK', type: 'line' },
    { id: 'export-ae-chart', url: './data/cached/ssb/export-by-country/export-ae.json', title: 'Norwegian Exports to UAE', subtitle: 'NOK', type: 'line' },
    { id: 'export-sa-chart', url: './data/cached/ssb/export-by-country/export-sa.json', title: 'Norwegian Exports to Saudi Arabia', subtitle: 'NOK', type: 'line' },
    { id: 'export-il-chart', url: './data/cached/ssb/export-by-country/export-il.json', title: 'Norwegian Exports to Israel', subtitle: 'NOK', type: 'line' },
    { id: 'export-ar-chart', url: './data/cached/ssb/export-by-country/export-ar.json', title: 'Norwegian Exports to Argentina', subtitle: 'NOK', type: 'line' },
    { id: 'export-cl-chart', url: './data/cached/ssb/export-by-country/export-cl.json', title: 'Norwegian Exports to Chile', subtitle: 'NOK', type: 'line' },
    { id: 'export-mx-chart', url: './data/cached/ssb/export-by-country/export-mx.json', title: 'Norwegian Exports to Mexico', subtitle: 'NOK', type: 'line' },
    { id: 'export-co-chart', url: './data/cached/ssb/export-by-country/export-co.json', title: 'Norwegian Exports to Colombia', subtitle: 'NOK', type: 'line' },
    { id: 'export-pe-chart', url: './data/cached/ssb/export-by-country/export-pe.json', title: 'Norwegian Exports to Peru', subtitle: 'NOK', type: 'line' },
    { id: 'export-ua-chart', url: './data/cached/ssb/export-by-country/export-ua.json', title: 'Norwegian Exports to Ukraine', subtitle: 'NOK', type: 'line' },
    
    // === SSB BANKRUPTCIES BY INDUSTRY (Quarterly Data) ===
    { id: 'bankruptcies-total-chart', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-total.json', title: 'Bankruptcies - Total (All Industries)', subtitle: 'Number per quarter', type: 'line' },
    
    // === STATNETT ELECTRICITY DATA ===
    { id: 'statnett-latest-detailed-overview-chart', url: './data/cached/statnett/latest-detailed-overview.json', title: 'Statnett Latest Detailed Overview', subtitle: 'Nåværende elektrisitetsproduksjon og forbruk', type: 'statnett-production-consumption' },
    
    // === OUR WORLD IN DATA (OWID) CHARTS ===
    { id: 'norway-oda-per-capita-chart', url: './data/cached/oda_per_capita.json', title: 'Norway ODA per Capita', subtitle: 'USD per capita', type: 'line' },
    { id: 'norway-internet-usage-chart', url: './data/cached/internet_use.json', title: 'Norway Internet Usage', subtitle: '% of population', type: 'line' },
    { id: 'norway-homicide-rate-chart', url: './data/cached/homicide_rate.json', title: 'Norway Homicide Rate', subtitle: 'per 100,000 population', type: 'line' },
    { id: 'norway-maternal-mortality-chart', url: './data/cached/maternal_mortality.json', title: 'Norway Maternal Mortality', subtitle: 'deaths per 100,000 live births', type: 'line' },
    { id: 'norway-military-spending-chart', url: './data/cached/military_spending.json', title: 'Norway Military Spending', subtitle: '% of GDP', type: 'line' },
    { id: 'norway-women-parliament-chart', url: './data/cached/women_in_parliament.json', title: 'Norway Women in Parliament', subtitle: '% of parliament', type: 'line' },
    { id: 'norway-co2-per-capita-chart', url: './data/cached/co2_per_capita.json', title: 'Norway CO₂ Emissions per Capita', subtitle: 'tonnes per person', type: 'line' },
    
    // Vaccination Coverage - Split by antigen type
    { id: 'norway-vaccination-dtpcv3-chart', url: './data/cached/vaccination_dtpcv3.json', title: 'Norway Vaccination - DTP-CV3 (Diphtheria, Tetanus, Pertussis)', subtitle: '% coverage', type: 'line' },
    { id: 'norway-vaccination-hepb3-chart', url: './data/cached/vaccination_hepb3.json', title: 'Norway Vaccination - HepB3 (Hepatitis B)', subtitle: '% coverage', type: 'line' },
    { id: 'norway-vaccination-hib3-chart', url: './data/cached/vaccination_hib3.json', title: 'Norway Vaccination - Hib3 (Haemophilus influenzae type b)', subtitle: '% coverage', type: 'line' },
    { id: 'norway-vaccination-ipv1-chart', url: './data/cached/vaccination_ipv1.json', title: 'Norway Vaccination - IPV1 (Inactivated Polio Vaccine)', subtitle: '% coverage', type: 'line' },
    { id: 'norway-vaccination-mcv1-chart', url: './data/cached/vaccination_mcv1.json', title: 'Norway Vaccination - MCV1 (Measles)', subtitle: '% coverage', type: 'line' },
    { id: 'norway-vaccination-pcv3-chart', url: './data/cached/vaccination_pcv3.json', title: 'Norway Vaccination - PCV3 (Pneumococcal)', subtitle: '% coverage', type: 'line' },
    { id: 'norway-vaccination-pol3-chart', url: './data/cached/vaccination_pol3.json', title: 'Norway Vaccination - Pol3 (Polio)', subtitle: '% coverage', type: 'line' },
    { id: 'norway-vaccination-rcv1-chart', url: './data/cached/vaccination_rcv1.json', title: 'Norway Vaccination - RCV1 (Rubella)', subtitle: '% coverage', type: 'line' },
    { id: 'norway-vaccination-rotac-chart', url: './data/cached/vaccination_rotac.json', title: 'Norway Vaccination - RotaC (Rotavirus)', subtitle: '% coverage', type: 'line' },
    
    { id: 'norway-child-mortality-chart', url: './data/cached/child_mortality.json', title: 'Norway Child Mortality', subtitle: 'deaths per 100 live births', type: 'line' },
    { id: 'norway-life-expectancy-chart', url: './data/cached/life_expectancy.json', title: 'Norway Life Expectancy', subtitle: 'years', type: 'line' },
    { id: 'norway-employment-agriculture-chart', url: './data/cached/employment_in_agriculture_share.json', title: 'Norway Employment in Agriculture Share', subtitle: '% of labor force', type: 'line' },
    { id: 'norway-daily-calories-chart', url: './data/cached/daily_calories.json', title: 'Norway Daily Calories', subtitle: 'kilocalories per day', type: 'line' },
    { id: 'norway-median-age-chart', url: './data/cached/median_age.json', title: 'Norway Median Age', subtitle: 'years', type: 'line' },
    { id: 'norway-fertility-rate-chart', url: './data/cached/fertility_rate_period.json', title: 'Norway Fertility Rate', subtitle: 'live births per woman', type: 'line' },
    { id: 'norway-mean-income-per-day-chart', url: './data/cached/mean_income_per_day.json', title: 'Norway Mean Income per Day', subtitle: 'international-$ (2021 prices) per day', type: 'line' },
    { id: 'norway-armed-forces-personnel-chart', url: './data/cached/armed_forces_personnel.json', title: 'Norway Armed Forces Personnel', subtitle: 'persons', type: 'line' },
    { id: 'norway-alcohol-consumption-chart', url: './data/cached/alcohol_consumption_per_capita.json', title: 'Norway Alcohol Consumption per Capita', subtitle: 'liters of pure alcohol per person (15+) per year', type: 'line' },
    { id: 'norway-trade-share-gdp-chart', url: './data/cached/trade_share_gdp.json', title: 'Norway Trade Share of GDP', subtitle: '% of GDP', type: 'line' },
    { id: 'norway-energy-use-per-capita-chart', url: './data/cached/energy_use_per_capita.json', title: 'Norway Energy Use per Capita', subtitle: 'kilowatt-hours per person', type: 'line' },
    { id: 'norway-marriage-rate-chart', url: './data/cached/marriage_rate.json', title: 'Norway Marriage Rate', subtitle: 'per 1,000 people', type: 'line' },
    { id: 'norway-electric-car-sales-share-chart', url: './data/cached/electric_car_sales_share.json', title: 'Norway Electric Car Sales Share', subtitle: '% of new car sales', type: 'line' },
    { id: 'norway-weekly-covid-cases-chart', url: './data/cached/weekly_covid_cases.json', title: 'Norway Weekly COVID Cases', subtitle: 'weekly confirmed cases', type: 'line' },
    { id: 'norway-no-education-share-chart', url: './data/cached/no_education_share.json', title: 'Norway No Education Share', subtitle: '% of population (ages 15-64)', type: 'line' },
    { id: 'norway-avg-years-schooling-chart', url: './data/cached/avg_years_schooling.json', title: 'Norway Average Years Schooling', subtitle: 'years (ages 25+)', type: 'line' },
    { id: 'norway-pisa-science-chart', url: './data/cached/pisa_science.json', title: 'Norway PISA Science', subtitle: 'PISA score (mean=500, SD=100)', type: 'line' },
    { id: 'norway-pisa-reading-chart', url: './data/cached/pisa_reading.json', title: 'Norway PISA Reading', subtitle: 'PISA score (mean=500, SD=100)', type: 'line' },
    { id: 'norway-rnd-researchers-chart', url: './data/cached/rnd_researchers.json', title: 'Norway R&D Researchers', subtitle: 'per million people', type: 'line' },
    { id: 'norway-tourist-trips-chart', url: './data/cached/tourist_trips.json', title: 'Norway Tourist Trips', subtitle: 'international tourist arrivals', type: 'line' },
    
    // DFO Budget Data - Norwegian Government Department Budgets (2014-2024)
    { id: 'dfo-arbeids-inkludering-expenditure-chart', url: './data/cached/dfo/arbeids-og-inkluderingsdepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Arbeids- og inkluderingsdepartementet - Utgifter', type: 'dfo-budget' },
    { id: 'dfo-arbeids-inkludering-revenue-chart', url: './data/cached/dfo/arbeids-og-inkluderingsdepartementet-revenue-20142015201620172018201920202021202220232024.json', title: 'Arbeids- og inkluderingsdepartementet - Inntekter', type: 'dfo-budget' },
    { id: 'dfo-barne-familie-expenditure-chart', url: './data/cached/dfo/barne-og-familiedepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Barne- og familiedepartementet - Utgifter', type: 'dfo-budget' },
    { id: 'dfo-barne-familie-revenue-chart', url: './data/cached/dfo/barne-og-familiedepartementet-revenue-20142015201620172018201920202021202220232024.json', title: 'Barne- og familiedepartementet - Inntekter', type: 'dfo-budget' },
    { id: 'dfo-energi-expenditure-chart', url: './data/cached/dfo/energidepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Energidepartementet - Utgifter', type: 'dfo-budget' },
    { id: 'dfo-energi-revenue-chart', url: './data/cached/dfo/energidepartementet-revenue-20142015201620172018201920202021202220232024.json', title: 'Energidepartementet - Inntekter', type: 'dfo-budget' },
    { id: 'dfo-finans-expenditure-chart', url: './data/cached/dfo/finansdepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Finansdepartementet - Utgifter', type: 'dfo-budget' },
    { id: 'dfo-finans-revenue-chart', url: './data/cached/dfo/finansdepartementet-revenue-20142015201620172018201920202021202220232024.json', title: 'Finansdepartementet - Inntekter', type: 'dfo-budget' },
    { id: 'dfo-forsvar-expenditure-chart', url: './data/cached/dfo/forsvarsdepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Forsvarsdepartementet - Utgifter', type: 'dfo-budget' },
    { id: 'dfo-forsvar-revenue-chart', url: './data/cached/dfo/forsvarsdepartementet-revenue-20142015201620172018201920202021202220232024.json', title: 'Forsvarsdepartementet - Inntekter', type: 'dfo-budget' },
    { id: 'dfo-helse-expenditure-chart', url: './data/cached/dfo/helse-og-omsorgsdepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Helse- og omsorgsdepartementet - Utgifter', type: 'dfo-budget' },
    { id: 'dfo-helse-revenue-chart', url: './data/cached/dfo/helse-og-omsorgsdepartementet-revenue-20142015201620172018201920202021202220232024.json', title: 'Helse- og omsorgsdepartementet - Inntekter', type: 'dfo-budget' },
    { id: 'dfo-justis-expenditure-chart', url: './data/cached/dfo/justis-og-beredskapsdepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Justis- og beredskapsdepartementet - Utgifter', type: 'dfo-budget' },
    { id: 'dfo-justis-revenue-chart', url: './data/cached/dfo/justis-og-beredskapsdepartementet-revenue-20142015201620172018201920202021202220232024.json', title: 'Justis- og beredskapsdepartementet - Inntekter', type: 'dfo-budget' },
    { id: 'dfo-klima-expenditure-chart', url: './data/cached/dfo/klima-og-milj-departementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Klima- og miljødepartementet - Utgifter', type: 'dfo-budget' },
    { id: 'dfo-klima-revenue-chart', url: './data/cached/dfo/klima-og-milj-departementet-revenue-20142015201620172018201920202021202220232024.json', title: 'Klima- og miljødepartementet - Inntekter', type: 'dfo-budget' },
    { id: 'dfo-kommunal-expenditure-chart', url: './data/cached/dfo/kommunal-og-distriktsdepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Kommunal- og distriktsdepartementet - Utgifter', type: 'dfo-budget' },
    { id: 'dfo-kommunal-revenue-chart', url: './data/cached/dfo/kommunal-og-distriktsdepartementet-revenue-20142015201620172018201920202021202220232024.json', title: 'Kommunal- og distriktsdepartementet - Inntekter', type: 'dfo-budget' },
    { id: 'dfo-kultur-expenditure-chart', url: './data/cached/dfo/kultur-og-likestillingsdepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Kultur- og likestillingsdepartementet - Utgifter', type: 'dfo-budget' },
    { id: 'dfo-kultur-revenue-chart', url: './data/cached/dfo/kultur-og-likestillingsdepartementet-revenue-20142015201620172018201920202021202220232024.json', title: 'Kultur- og likestillingsdepartementet - Inntekter', type: 'dfo-budget' },
    { id: 'dfo-kunnskap-expenditure-chart', url: './data/cached/dfo/kunnskapsdepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Kunnskapsdepartementet - Utgifter', type: 'dfo-budget' },
    { id: 'dfo-kunnskap-revenue-chart', url: './data/cached/dfo/kunnskapsdepartementet-revenue-20142015201620172018201920202021202220232024.json', title: 'Kunnskapsdepartementet - Inntekter', type: 'dfo-budget' },
    { id: 'dfo-landbruk-expenditure-chart', url: './data/cached/dfo/landbruks-og-matdepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Landbruks- og matdepartementet - Utgifter', type: 'dfo-budget' },
    { id: 'dfo-landbruk-revenue-chart', url: './data/cached/dfo/landbruks-og-matdepartementet-revenue-20142015201620172018201920202021202220232024.json', title: 'Landbruks- og matdepartementet - Inntekter', type: 'dfo-budget' },
    { id: 'dfo-naring-expenditure-chart', url: './data/cached/dfo/n-rings-og-fiskeridepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Nærings- og fiskeridepartementet - Utgifter', type: 'dfo-budget' },
    { id: 'dfo-naring-revenue-chart', url: './data/cached/dfo/n-rings-og-fiskeridepartementet-revenue-20142015201620172018201920202021202220232024.json', title: 'Nærings- og fiskeridepartementet - Inntekter', type: 'dfo-budget' },
    { id: 'dfo-samferdsel-expenditure-chart', url: './data/cached/dfo/samferdselsdepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Samferdselsdepartementet - Utgifter', type: 'dfo-budget' },
    { id: 'dfo-samferdsel-revenue-chart', url: './data/cached/dfo/samferdselsdepartementet-revenue-20142015201620172018201920202021202220232024.json', title: 'Samferdselsdepartementet - Inntekter', type: 'dfo-budget' },
    { id: 'dfo-utenriks-expenditure-chart', url: './data/cached/dfo/utenriksdepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Utenriksdepartementet - Utgifter', type: 'dfo-budget' },
    { id: 'dfo-utenriks-revenue-chart', url: './data/cached/dfo/utenriksdepartementet-revenue-20142015201620172018201920202021202220232024.json', title: 'Utenriksdepartementet - Inntekter', type: 'dfo-budget' }
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

