// ============================================================================
// RIKSDATA MAIN APPLICATION
// ============================================================================

import { loadChartData } from './charts.js';
import { showSkeletonLoading, hideSkeletonLoading, showError, debounce } from './utils.js';

// Global state
let currentLanguage = 'en';
let currentTheme = 'light'; // Changed from 'dark' to 'light'
let isFilterPanelVisible = false;
let currentSourceFilter = 'all';

/**
 * Initialize the application
 */
export async function initializeApp() {
    try {
        // Show loading screen and progress bar
        const loadingScreen = document.getElementById('loading-screen');
        const progressBar = document.getElementById('progress-bar');
        
        // Initialize progress bar
        updateProgressBar(0);
        
        // Show skeleton loading for all charts
        showSkeletonLoading();
        
        // Load all charts in parallel with progress tracking
        const chartPromises = [
            // Original charts
            loadChartData('cpi-chart', 'https://data.ssb.no/api/v0/dataset/1086.json?lang=en', 'Consumer Price Index'),
            loadChartData('unemployment-chart', 'https://data.ssb.no/api/v0/dataset/1052.json?lang=en', 'Unemployment Rate'),
            loadChartData('house-prices-chart', 'https://data.ssb.no/api/v0/dataset/1060.json?lang=en', 'House Price Index'),
            loadChartData('ppi-chart', 'https://data.ssb.no/api/v0/dataset/26426.json?lang=en', 'Producer Price Index'),
            loadChartData('wage-chart', 'https://data.ssb.no/api/v0/dataset/1124.json?lang=en', 'Wage Index'),
            loadChartData('oil-fund-chart', 'data/oil-fund.json', 'Oil Fund Value'),
            loadChartData('exchange-chart', 'https://data.norges-bank.no/api/data/EXR/M.USD+EUR.NOK.SP?format=sdmx-json&startPeriod=2015-08-11&endPeriod=2025-08-01&locale=no', 'USD/NOK'),
            loadChartData('interest-rate-chart', 'https://data.norges-bank.no/api/data/IR/M.KPRA..?format=sdmx-json&startPeriod=2000-01-01&endPeriod=2025-08-01&locale=no', 'Key Policy Rate'),
            loadChartData('govt-debt-chart', 'https://data.norges-bank.no/api/data/GOVT_KEYFIGURES/V_O+N_V+V_I+ATRI+V_IRS..B.GBON?endPeriod=2025-08-01&format=sdmx-json&locale=no&startPeriod=2000-01-01', 'Government Debt'),
            
            // Bar charts
            loadChartData('gdp-growth-chart', 'https://data.ssb.no/api/v0/dataset/59012.json?lang=en', 'GDP Growth', 'bar'),
            loadChartData('trade-balance-chart', 'https://data.ssb.no/api/v0/dataset/58962.json?lang=en', 'Trade Balance', 'bar'),
            loadChartData('bankruptcies-chart', 'https://data.ssb.no/api/v0/dataset/95265.json?lang=en', 'Bankruptcies', 'bar'),
            loadChartData('population-growth-chart', 'https://data.ssb.no/api/v0/dataset/49626.json?lang=en', 'Population Growth'),
            loadChartData('construction-costs-chart', 'https://data.ssb.no/api/v0/dataset/26944.json?lang=en', 'Construction Costs'),
            
            // Fixed charts (replacing failing ones)
            loadChartData('industrial-production-chart', 'https://data.ssb.no/api/v0/dataset/27002.json?lang=en', 'Industrial Production'),
            loadChartData('retail-sales-chart', 'https://data.ssb.no/api/v0/dataset/1064.json?lang=en', 'Retail Sales'),
            loadChartData('export-volume-chart', 'https://data.ssb.no/api/v0/dataset/179421.json?lang=en', 'Export Volume'),
            loadChartData('import-volume-chart', 'https://data.ssb.no/api/v0/dataset/179422.json?lang=en', 'Import Volume'),
            loadChartData('eur-exchange-chart', 'https://data.norges-bank.no/api/data/EXR/M.EUR.NOK.SP?format=sdmx-json&startPeriod=2015-08-11&endPeriod=2025-08-01&locale=no', 'EUR/NOK'),
            loadChartData('employment-rate-chart', 'https://data.ssb.no/api/v0/dataset/1054.json?lang=en', 'Employment Rate'),
            loadChartData('business-confidence-chart', 'https://data.ssb.no/api/v0/dataset/166316.json?lang=en', 'Business Confidence'),
            loadChartData('consumer-confidence-chart', 'https://data.ssb.no/api/v0/dataset/166330.json?lang=en', 'Consumer Confidence'),
            loadChartData('housing-starts-chart', 'https://data.ssb.no/api/v0/dataset/95146.json?lang=en', 'Housing Starts', 'bar'),
            loadChartData('oil-price-chart', 'https://data.ssb.no/api/v0/dataset/26426.json?lang=en', 'Oil Price (Brent)'),
            
            // 9 Additional charts
            loadChartData('monetary-aggregates-chart', 'https://data.ssb.no/api/v0/dataset/172769.json?lang=en', 'Monetary Aggregates'),
            loadChartData('job-vacancies-chart', 'https://data.ssb.no/api/v0/dataset/166328.json?lang=en', 'Job Vacancies', 'bar'),
            loadChartData('household-consumption-chart', 'https://data.ssb.no/api/v0/dataset/166331.json?lang=en', 'Household Consumption'),
            loadChartData('producer-prices-chart', 'https://data.ssb.no/api/v0/dataset/26427.json?lang=en', 'Producer Prices'),
            loadChartData('construction-production-chart', 'https://data.ssb.no/api/v0/dataset/924808.json?lang=en', 'Construction Production'),
            loadChartData('credit-indicator-chart', 'https://data.ssb.no/api/v0/dataset/166326.json?lang=en', 'Credit Indicator'),
            loadChartData('energy-consumption-chart', 'https://data.ssb.no/api/v0/dataset/928196.json?lang=en', 'Energy Consumption'),
            loadChartData('government-revenue-chart', 'https://data.ssb.no/api/v0/dataset/928194.json?lang=en', 'Government Revenue'),
            loadChartData('international-accounts-chart', 'https://data.ssb.no/api/v0/dataset/924820.json?lang=en', 'International Accounts'),
            
            // 15 Additional charts
            loadChartData('labour-cost-index-chart', 'https://data.ssb.no/api/v0/dataset/760065.json?lang=en', 'Labour Cost Index'),
            loadChartData('rd-expenditure-chart', 'https://data.ssb.no/api/v0/dataset/61819.json?lang=en', 'R&D Expenditure'),
            loadChartData('salmon-export-chart', 'https://data.ssb.no/api/v0/dataset/1122.json?lang=en', 'Salmon Export Value'),
            loadChartData('oil-gas-investment-chart', 'https://data.ssb.no/api/v0/dataset/166334.json?lang=en', 'Oil & Gas Investment'),
            loadChartData('immigration-rate-chart', 'https://data.ssb.no/api/v0/dataset/48651.json?lang=en', 'Immigration Rate'),
            loadChartData('household-income-chart', 'https://data.ssb.no/api/v0/dataset/56900.json?lang=en', 'Household Income'),
            loadChartData('life-expectancy-chart', 'https://data.ssb.no/api/v0/dataset/102811.json?lang=en', 'Life Expectancy'),
            loadChartData('crime-rate-chart', 'https://data.ssb.no/api/v0/dataset/97445.json?lang=en', 'Crime Rate'),
            loadChartData('education-level-chart', 'https://data.ssb.no/api/v0/dataset/85454.json?lang=en', 'Education Level'),
            loadChartData('holiday-property-sales-chart', 'https://data.ssb.no/api/v0/dataset/65962.json?lang=en', 'Holiday Property Sales'),
            loadChartData('greenhouse-gas-chart', 'https://data.ssb.no/api/v0/dataset/832678.json?lang=en', 'Greenhouse Gas Emissions'),
            loadChartData('economic-forecasts-chart', 'https://data.ssb.no/api/v0/dataset/934513.json?lang=en', 'Economic Forecasts'),
            loadChartData('new-dwellings-price-chart', 'https://data.ssb.no/api/v0/dataset/26158.json?lang=en', 'New Dwellings Price'),
            loadChartData('lifestyle-habits-chart', 'https://data.ssb.no/api/v0/dataset/832683.json?lang=en', 'Lifestyle Habits'),
            loadChartData('long-term-illness-chart', 'https://data.ssb.no/api/v0/dataset/832685.json?lang=en', 'Long-term Illness'),            loadChartData('population-development-quarterly-chart', 'https://data.ssb.no/api/v0/dataset/1104.json?lang=en', 'Population Development Quarterly'),            loadChartData('population-development-municipalities-chart', 'https://data.ssb.no/api/v0/dataset/1108.json?lang=en', 'Population Development Municipalities'),            loadChartData('cpi-adjusted-indices-chart', 'https://data.ssb.no/api/v0/dataset/1118.json?lang=en', 'CPI Adjusted Indices'),            loadChartData('wage-indices-by-industry-chart', 'https://data.ssb.no/api/v0/dataset/1128.json?lang=en', 'Wage Indices by Industry'),            loadChartData('import-by-country-monthly-chart', 'https://data.ssb.no/api/v0/dataset/1138.json?lang=en', 'Import by Country Monthly'),            loadChartData('house-price-index-recent-chart', 'https://data.ssb.no/api/v0/dataset/1062.json?lang=en', 'House Price Index Recent'),            loadChartData('households-by-type-municipalities-chart', 'https://data.ssb.no/api/v0/dataset/1070.json?lang=en', 'Households by Type Municipalities', 'bar'),            loadChartData('households-by-type-districts-chart', 'https://data.ssb.no/api/v0/dataset/1072.json?lang=en', 'Households by Type Districts', 'bar'),            loadChartData('population-by-age-counties-chart', 'https://data.ssb.no/api/v0/dataset/1076.json?lang=en', 'Population by Age Counties', 'bar'),            loadChartData('population-by-gender-age-municipalities-chart', 'https://data.ssb.no/api/v0/dataset/1078.json?lang=en', 'Population by Gender Age Municipalities', 'bar'),            loadChartData('population-by-age-municipalities-chart', 'https://data.ssb.no/api/v0/dataset/1080.json?lang=en', 'Population by Age Municipalities', 'bar'),            loadChartData('population-by-gender-age-timeline-chart', 'https://data.ssb.no/api/v0/dataset/1082.json?lang=en', 'Population by Gender Age Timeline'),            loadChartData('cpi-group-level-chart', 'https://data.ssb.no/api/v0/dataset/1092.json?lang=en', 'CPI Group Level'),            loadChartData('cpi-subgroup-level2-chart', 'https://data.ssb.no/api/v0/dataset/1094.json?lang=en', 'CPI Subgroup Level 2'),            loadChartData('cpi-weights-subgroup-chart', 'https://data.ssb.no/api/v0/dataset/1098.json?lang=en', 'CPI Weights Subgroup', 'bar'),            loadChartData('population-development-counties-chart', 'https://data.ssb.no/api/v0/dataset/1102.json?lang=en', 'Population Development Counties'),            loadChartData('import-value-volume-sitc-chart', 'https://data.ssb.no/api/v0/dataset/34640.json?lang=en', 'Import Value Volume SITC'),            loadChartData('export-value-volume-sitc-chart', 'https://data.ssb.no/api/v0/dataset/34642.json?lang=en', 'Export Value Volume SITC'),            loadChartData('tax-returns-main-items-chart', 'https://data.ssb.no/api/v0/dataset/49656.json?lang=en', 'Tax Returns Main Items'),            loadChartData('public-administration-expenditures-chart', 'https://data.ssb.no/api/v0/dataset/112175.json?lang=en', 'Public Administration Expenditures'),            loadChartData('money-supply-m0-chart', 'https://data.ssb.no/api/v0/dataset/172771.json?lang=en', 'Money Supply M0'),            loadChartData('money-supply-m3-by-sector-chart', 'https://data.ssb.no/api/v0/dataset/172795.json?lang=en', 'Money Supply M3 by Sector'),            loadChartData('money-supply-by-sector-chart', 'https://data.ssb.no/api/v0/dataset/172798.json?lang=en', 'Money Supply by Sector'),            loadChartData('money-supply-m3-net-claims-chart', 'https://data.ssb.no/api/v0/dataset/172800.json?lang=en', 'Money Supply M3 Net Claims'),            loadChartData('new-detached-house-prices-regions-chart', 'https://data.ssb.no/api/v0/dataset/25138.json?lang=en', 'New Detached House Prices Regions'),            loadChartData('new-detached-house-prices-national-chart', 'https://data.ssb.no/api/v0/dataset/25151.json?lang=en', 'New Detached House Prices National'),            loadChartData('import-value-volume-sitc1-chart', 'https://data.ssb.no/api/v0/dataset/34254.json?lang=en', 'Import Value Volume SITC1'),            loadChartData('export-value-volume-sitc1-chart', 'https://data.ssb.no/api/v0/dataset/34256.json?lang=en', 'Export Value Volume SITC1'),            loadChartData('household-income-municipalities-chart', 'https://data.ssb.no/api/v0/dataset/49678.json?lang=en', 'Household Income Municipalities'),            loadChartData('population-by-gender-age-historical-chart', 'https://data.ssb.no/api/v0/dataset/59322.json?lang=en', 'Population by Gender Age Historical'),            loadChartData('oil-gas-industry-turnover-chart', 'https://data.ssb.no/api/v0/dataset/124341.json?lang=en', 'Oil Gas Industry Turnover'),            loadChartData('employed-by-residence-workplace-chart', 'https://data.ssb.no/api/v0/dataset/44631.json?lang=en', 'Employed by Residence Workplace'),            loadChartData('living-arrangements-national-chart', 'https://data.ssb.no/api/v0/dataset/86813.json?lang=en', 'Living Arrangements National', 'bar'),            loadChartData('employed-by-municipality-chart', 'https://data.ssb.no/api/v0/dataset/44574.json?lang=en', 'Employed by Municipality'),            loadChartData('cpi-seasonally-adjusted-chart', 'https://data.ssb.no/api/v0/dataset/45590.json?lang=en', 'CPI Seasonally Adjusted'),            loadChartData('tax-returns-districts-chart', 'https://data.ssb.no/api/v0/dataset/49619.json?lang=en', 'Tax Returns Districts'),            loadChartData('credit-indicator-k2-detailed-chart', 'https://data.ssb.no/api/v0/dataset/62264.json?lang=en', 'Credit Indicator K2 Detailed'),            loadChartData('first-hand-price-index-chart', 'https://data.ssb.no/api/v0/dataset/82677.json?lang=en', 'First Hand Price Index'),            loadChartData('first-hand-price-index-groups-chart', 'https://data.ssb.no/api/v0/dataset/82679.json?lang=en', 'First Hand Price Index Groups'),            loadChartData('immigrants-by-county-chart', 'https://data.ssb.no/api/v0/dataset/96304.json?lang=en', 'Immigrants by County', 'bar'),            loadChartData('cpi-adjusted-delivery-sector-chart', 'https://data.ssb.no/api/v0/dataset/130297.json?lang=en', 'CPI Adjusted Delivery Sector'),            loadChartData('wage-indices-by-industry-sn88-chart', 'https://data.ssb.no/api/v0/dataset/215588.json?lang=en', 'Wage Indices by Industry SN88'),            loadChartData('population-municipalities-timeline-chart', 'https://data.ssb.no/api/v0/dataset/26975.json?lang=en', 'Population Municipalities Timeline'),            loadChartData('production-index-by-product-chart', 'https://data.ssb.no/api/v0/dataset/26952.json?lang=en', 'Production Index by Product'),            loadChartData('population-changes-municipalities-chart', 'https://data.ssb.no/api/v0/dataset/49577.json?lang=en', 'Population Changes Municipalities'),            loadChartData('population-changes-counties-chart', 'https://data.ssb.no/api/v0/dataset/49623.json?lang=en', 'Population Changes Counties'),            loadChartData('population-by-gender-age-5year-chart', 'https://data.ssb.no/api/v0/dataset/65195.json?lang=en', 'Population by Gender Age 5-Year', 'bar'),            loadChartData('first-hand-price-index-subgroups-chart', 'https://data.ssb.no/api/v0/dataset/82647.json?lang=en', 'First Hand Price Index Subgroups'),            loadChartData('cpi-delivery-sector-annual-chart', 'https://data.ssb.no/api/v0/dataset/95134.json?lang=en', 'CPI Delivery Sector Annual'),            loadChartData('new-detached-house-prices-cities-chart', 'https://data.ssb.no/api/v0/dataset/25156.json?lang=en', 'New Detached House Prices Cities'),            loadChartData('credit-indicator-k3-chart', 'https://data.ssb.no/api/v0/dataset/62266.json?lang=en', 'Credit Indicator K3'),            loadChartData('tax-returns-municipalities-chart', 'https://data.ssb.no/api/v0/dataset/49607.json?lang=en', 'Tax Returns Municipalities'),            loadChartData('bankruptcies-by-industry-chart', 'https://data.ssb.no/api/v0/dataset/62495.json?lang=en', 'Bankruptcies by Industry', 'bar'),            loadChartData('immigrants-with-immigrant-parents-chart', 'https://data.ssb.no/api/v0/dataset/48670.json?lang=en', 'Immigrants with Immigrant Parents'),            loadChartData('tax-returns-counties-chart', 'https://data.ssb.no/api/v0/dataset/49613.json?lang=en', 'Tax Returns Counties'),            loadChartData('bankruptcies-municipalities-chart', 'https://data.ssb.no/api/v0/dataset/66000.json?lang=en', 'Bankruptcies Municipalities', 'bar'),            loadChartData('living-arrangements-districts-chart', 'https://data.ssb.no/api/v0/dataset/85450.json?lang=en', 'Living Arrangements Districts', 'bar'),            loadChartData('education-level-counties-chart', 'https://data.ssb.no/api/v0/dataset/85452.json?lang=en', 'Education Level Counties', 'bar'),            loadChartData('household-income-counties-chart', 'https://data.ssb.no/api/v0/dataset/97611.json?lang=en', 'Household Income Counties'),            loadChartData('oil-gas-industry-turnover-sn2007-chart', 'https://data.ssb.no/api/v0/dataset/124363.json?lang=en', 'Oil Gas Industry Turnover SN2007'),            loadChartData('wages-by-occupation-chart', 'https://data.ssb.no/api/v0/dataset/317687.json?lang=en', 'Wages by Occupation'),            loadChartData('household-income-districts-chart', 'https://data.ssb.no/api/v0/dataset/56928.json?lang=en', 'Household Income Districts'),            loadChartData('household-income-national-chart', 'https://data.ssb.no/api/v0/dataset/97435.json?lang=en', 'Household Income National'),            loadChartData('business-cycle-barometer-chart', 'https://data.ssb.no/api/v0/dataset/166316.json?lang=en', 'Business Cycle Barometer'),            loadChartData('business-cycle-barometer-products-chart', 'https://data.ssb.no/api/v0/dataset/166318.json?lang=en', 'Business Cycle Barometer Products'),            loadChartData('export-by-country-monthly-chart', 'https://data.ssb.no/api/v0/dataset/1136.json?lang=en', 'Export by Country Monthly'),            loadChartData('producer-price-index-products-chart', 'https://data.ssb.no/api/v0/dataset/26433.json?lang=en', 'Producer Price Index Products'),            loadChartData('trade-volume-price-sitc2-chart', 'https://data.ssb.no/api/v0/dataset/179417.json?lang=en', 'Trade Volume Price SITC2'),            loadChartData('trade-volume-price-product-groups-chart', 'https://data.ssb.no/api/v0/dataset/179419.json?lang=en', 'Trade Volume Price Product Groups'),            loadChartData('trade-main-figures-by-country-chart', 'https://data.ssb.no/api/v0/dataset/179423.json?lang=en', 'Trade Main Figures by Country'),            loadChartData('producer-price-index-industries-chart', 'https://data.ssb.no/api/v0/dataset/27263.json?lang=en', 'Producer Price Index Industries'),            loadChartData('production-index-by-industry-chart', 'https://data.ssb.no/api/v0/dataset/29843.json?lang=en', 'Production Index by Industry'),            loadChartData('trade-volume-price-bec-chart', 'https://data.ssb.no/api/v0/dataset/367182.json?lang=en', 'Trade Volume Price BEC'),            loadChartData('export-value-sitc3-chart', 'https://data.ssb.no/api/v0/dataset/367189.json?lang=en', 'Export Value SITC3'),            loadChartData('import-value-sitc3-chart', 'https://data.ssb.no/api/v0/dataset/367187.json?lang=en', 'Import Value SITC3'),            loadChartData('retail-sales-seasonally-adjusted-chart', 'https://data.ssb.no/api/v0/dataset/1066.json?lang=en', 'Retail Sales Seasonally Adjusted'),            loadChartData('population-basic-districts-national-chart', 'https://data.ssb.no/api/v0/dataset/534445.json?lang=en', 'Population Basic Districts National', 'bar'),            loadChartData('population-by-gender-age-districts-chart', 'https://data.ssb.no/api/v0/dataset/559736.json?lang=en', 'Population by Gender Age Districts', 'bar'),            loadChartData('population-by-gender-age-municipalities-detailed-chart', 'https://data.ssb.no/api/v0/dataset/577297.json?lang=en', 'Population by Gender Age Municipalities Detailed', 'bar'),            loadChartData('producer-price-index-subgroups-chart', 'https://data.ssb.no/api/v0/dataset/741154.json?lang=en', 'Producer Price Index Subgroups'),            loadChartData('education-level-municipalities-chart', 'https://data.ssb.no/api/v0/dataset/1172668.json?lang=en', 'Education Level Municipalities', 'bar'),            loadChartData('education-level-municipalities-percent-chart', 'https://data.ssb.no/api/v0/dataset/1172672.json?lang=en', 'Education Level Municipalities Percent', 'bar'),            loadChartData('credit-indicator-k2-seasonally-adjusted-chart', 'https://data.ssb.no/api/v0/dataset/435959.json?lang=en', 'Credit Indicator K2 Seasonally Adjusted'),            loadChartData('cpi-delivery-sector-recent-chart', 'https://data.ssb.no/api/v0/dataset/868304.json?lang=en', 'CPI Delivery Sector Recent'),            loadChartData('cpi-seasonally-adjusted-recent-chart', 'https://data.ssb.no/api/v0/dataset/868306.json?lang=en', 'CPI Seasonally Adjusted Recent'),            loadChartData('producer-price-index-recent-chart', 'https://data.ssb.no/api/v0/dataset/868328.json?lang=en', 'Producer Price Index Recent'),            loadChartData('cpi-adjusted-delivery-sector-recent-chart', 'https://data.ssb.no/api/v0/dataset/868330.json?lang=en', 'CPI Adjusted Delivery Sector Recent'),            loadChartData('deaths-by-week-age-chart', 'https://data.ssb.no/api/v0/dataset/932937.json?lang=en', 'Deaths by Week Age'),            loadChartData('economic-forecasts-selected-chart', 'https://data.ssb.no/api/v0/dataset/934516.json?lang=en', 'Economic Forecasts Selected'),            loadChartData('producer-price-index-totals-recent-chart', 'https://data.ssb.no/api/v0/dataset/372129.json?lang=en', 'Producer Price Index Totals Recent'),            loadChartData('production-index-industry-recent-chart', 'https://data.ssb.no/api/v0/dataset/372131.json?lang=en', 'Production Index Industry Recent'),            loadChartData('trade-main-figures-recent-chart', 'https://data.ssb.no/api/v0/dataset/372133.json?lang=en', 'Trade Main Figures Recent'),            loadChartData('cpi-total-index-recent-chart', 'https://data.ssb.no/api/v0/dataset/1088.json?lang=en', 'CPI Total Index Recent'),            loadChartData('producer-price-index-subgroups-detailed-chart', 'https://data.ssb.no/api/v0/dataset/741154.json?lang=en', 'Producer Price Index Subgroups Detailed'),            loadChartData('national-accounts-recent-chart', 'https://data.ssb.no/api/v0/dataset/372144.json?lang=en', 'National Accounts Recent'),































































































            
            // 27 Additional charts
            // Removed duplicate population-growth-chart
            loadChartData('births-deaths-chart', 'https://data.ssb.no/api/v0/dataset/1106.json?lang=en', 'Births and Deaths'),
            loadChartData('cpi-ate-chart', 'https://data.ssb.no/api/v0/dataset/1118.json?lang=en', 'CPI-ATE Index'),
            loadChartData('salmon-export-volume-chart', 'https://data.ssb.no/api/v0/dataset/1120.json?lang=en', 'Salmon Export Volume'),
            loadChartData('basic-salary-chart', 'https://data.ssb.no/api/v0/dataset/1126.json?lang=en', 'Basic Salary Index'),
            loadChartData('export-country-chart', 'https://data.ssb.no/api/v0/dataset/1130.json?lang=en', 'Export by Country'),
            loadChartData('import-country-chart', 'https://data.ssb.no/api/v0/dataset/1132.json?lang=en', 'Import by Country'),
            loadChartData('export-commodity-chart', 'https://data.ssb.no/api/v0/dataset/1134.json?lang=en', 'Export by Commodity'),
            loadChartData('import-commodity-chart', 'https://data.ssb.no/api/v0/dataset/1140.json?lang=en', 'Import by Commodity'),
            loadChartData('construction-cost-wood-chart', 'https://data.ssb.no/api/v0/dataset/1056.json?lang=en', 'Construction Cost Wood'),
            loadChartData('construction-cost-multi-chart', 'https://data.ssb.no/api/v0/dataset/1058.json?lang=en', 'Construction Cost Multi'),
            loadChartData('wholesale-retail-chart', 'https://data.ssb.no/api/v0/dataset/1065.json?lang=en', 'Wholesale Retail Sales'),
            loadChartData('household-types-chart', 'https://data.ssb.no/api/v0/dataset/1068.json?lang=en', 'Household Types'),
            loadChartData('population-age-chart', 'https://data.ssb.no/api/v0/dataset/1074.json?lang=en', 'Population by Age'),
            loadChartData('cpi-coicop-chart', 'https://data.ssb.no/api/v0/dataset/1084.json?lang=en', 'CPI Coicop Divisions'),
            loadChartData('cpi-subgroups-chart', 'https://data.ssb.no/api/v0/dataset/1090.json?lang=en', 'CPI Sub-groups'),
            loadChartData('cpi-items-chart', 'https://data.ssb.no/api/v0/dataset/1096.json?lang=en', 'CPI Items'),
            loadChartData('cpi-delivery-chart', 'https://data.ssb.no/api/v0/dataset/1100.json?lang=en', 'CPI Delivery Sectors'),
            loadChartData('household-income-size-chart', 'https://data.ssb.no/api/v0/dataset/56957.json?lang=en', 'Household Income Size'),
            loadChartData('cohabiting-arrangements-chart', 'https://data.ssb.no/api/v0/dataset/85440.json?lang=en', 'Cohabiting Arrangements'),
            loadChartData('utility-floor-space-chart', 'https://data.ssb.no/api/v0/dataset/95177.json?lang=en', 'Utility Floor Space'),
            loadChartData('credit-indicator-c2-chart', 'https://data.ssb.no/api/v0/dataset/166327.json?lang=en', 'Credit Indicator C2'),
            loadChartData('job-vacancies-new-chart', 'https://data.ssb.no/api/v0/dataset/166329.json?lang=en', 'Job Vacancies'),
            loadChartData('oil-gas-turnover-chart', 'https://data.ssb.no/api/v0/dataset/124322.json?lang=en', 'Oil Gas Turnover'),
            loadChartData('trade-volume-price-chart', 'https://data.ssb.no/api/v0/dataset/179415.json?lang=en', 'Trade Volume Price'),
            loadChartData('producer-price-industry-chart', 'https://data.ssb.no/api/v0/dataset/741023.json?lang=en', 'Producer Price Industry'),
            loadChartData('deaths-age-chart', 'https://data.ssb.no/api/v0/dataset/567324.json?lang=en', 'Deaths by Age'),
            // Removed duplicate construction-production-chart
            loadChartData('bankruptcies-total-chart', 'https://data.ssb.no/api/v0/dataset/924816.json?lang=en', 'Bankruptcies Total'),
            loadChartData('energy-accounts-chart', 'https://data.ssb.no/api/v0/dataset/928197.json?lang=en', 'Energy Accounts'),
            loadChartData('monetary-m3-chart', 'https://data.ssb.no/api/v0/dataset/172793.json?lang=en', 'Monetary Aggregate M3'),
            // Removed duplicate new-dwellings-price-chart
            loadChartData('business-tendency-chart', 'https://data.ssb.no/api/v0/dataset/166317.json?lang=en', 'Business Tendency Survey'),
            loadChartData('labor-force-monthly-chart', 'https://data.ssb.no/api/v0/dataset/13760.json?lang=en', 'Labor Force Monthly'),
            loadChartData('labor-force-quarterly-chart', 'https://data.ssb.no/api/v0/dataset/14483.json?lang=en', 'Labor Force Quarterly'),
            loadChartData('labor-force-annual-chart', 'https://data.ssb.no/api/v0/dataset/13618.json?lang=en', 'Labor Force Annual'),
            loadChartData('labor-force-quarterly-break-chart', 'https://data.ssb.no/api/v0/dataset/13619.json?lang=en', 'Labor Force Quarterly Break'),
            loadChartData('employment-status-quarterly-chart', 'https://data.ssb.no/api/v0/dataset/05110.json?lang=en', 'Employment Status Quarterly'),
            loadChartData('employment-status-annual-chart', 'https://data.ssb.no/api/v0/dataset/05111.json?lang=en', 'Employment Status Annual'),
            loadChartData('education-labor-quarterly-chart', 'https://data.ssb.no/api/v0/dataset/14077.json?lang=en', 'Education & Labor Quarterly'),
            loadChartData('education-labor-annual-chart', 'https://data.ssb.no/api/v0/dataset/14090.json?lang=en', 'Education & Labor Annual'),
            loadChartData('employment-education-quarterly-chart', 'https://data.ssb.no/api/v0/dataset/13784.json?lang=en', 'Employment by Education Quarterly'),
            loadChartData('employment-education-annual-chart', 'https://data.ssb.no/api/v0/dataset/13785.json?lang=en', 'Employment by Education Annual'),
            loadChartData('labor-force-age-quarterly-chart', 'https://data.ssb.no/api/v0/dataset/03777.json?lang=en', 'Labor Force by Age Quarterly'),
            loadChartData('labor-force-age-annual-chart', 'https://data.ssb.no/api/v0/dataset/03780.json?lang=en', 'Labor Force by Age Annual'),
            loadChartData('labor-force-flows-chart', 'https://data.ssb.no/api/v0/dataset/11433.json?lang=en', 'Labor Force Flows'),
            loadChartData('unemployed-age-quarterly-chart', 'https://data.ssb.no/api/v0/dataset/08518.json?lang=en', 'Unemployed by Age Quarterly'),
            loadChartData('unemployed-age-annual-chart', 'https://data.ssb.no/api/v0/dataset/08517.json?lang=en', 'Unemployed by Age Annual'),
            loadChartData('unemployment-duration-quarterly-chart', 'https://data.ssb.no/api/v0/dataset/04552.json?lang=en', 'Unemployment Duration Quarterly'),
            loadChartData('unemployment-duration-annual-chart', 'https://data.ssb.no/api/v0/dataset/04553.json?lang=en', 'Unemployment Duration Annual'),
            loadChartData('unemployed-industry-quarterly-chart', 'https://data.ssb.no/api/v0/dataset/13891.json?lang=en', 'Unemployed by Industry Quarterly'),
            loadChartData('unemployed-industry-annual-chart', 'https://data.ssb.no/api/v0/dataset/13892.json?lang=en', 'Unemployed by Industry Annual'),
            loadChartData('unemployed-nav-status-chart', 'https://data.ssb.no/api/v0/dataset/14454.json?lang=en', 'Unemployed by NAV Status')
        ];
        
        // Wait for all charts to load with progress tracking
        const totalCharts = chartPromises.length;
        let completedCharts = 0;
        
        const results = await Promise.allSettled(chartPromises.map(promise => 
            promise.then(result => {
                completedCharts++;
                const progress = (completedCharts / totalCharts) * 100;
                updateProgressBar(progress);
                return result;
            }).catch(error => {
                completedCharts++;
                const progress = (completedCharts / totalCharts) * 100;
                updateProgressBar(progress);
                throw error;
            })
        ));
        
        // Log results for debugging
        let successCount = 0;
        let failureCount = 0;
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                successCount++;
            } else {
                failureCount++;
                console.error(`Chart ${index} failed:`, result.reason);
            }
        });
        
        console.log(`Chart loading results: ${successCount} successful, ${failureCount} failed`);
        
        // Update progress bar to 100%
        updateProgressBar(100);
        
        // Hide skeleton loading
        hideSkeletonLoading();
        
        // Hide loading screen with fade out
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            // Enable scrolling after loading screen is hidden
            document.body.classList.add('loaded');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 500);
        
        // Sort charts alphabetically by default
        sortChartsAlphabetically();
        
    } catch (error) {
        console.error('Error initializing charts:', error);
        showError('Failed to load chart data. Please try again later.');
        
        // Hide loading screen even if there's an error
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hidden');
        // Enable scrolling even if there's an error
        document.body.classList.add('loaded');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

/**
 * Initialize UI event listeners
 */
export function initializeUI() {
    // Language toggle
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', toggleLanguage);
    }

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Filter toggle
    const filterToggle = document.getElementById('filterToggle');
    if (filterToggle) {
        filterToggle.addEventListener('click', toggleFilterPanel);
    }

    // Search functionality
    const searchInput = document.getElementById('chartSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // Source filters
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', handleSourceFilter);
    });

    // Sort toggle
    const sortToggle = document.getElementById('sortToggle');
    if (sortToggle) {
        sortToggle.addEventListener('click', toggleSort);
    }

    // Back to top button
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', scrollToTop);
    }

    // Progress bar on scroll
    window.addEventListener('scroll', updateProgressBarOnScroll);
}

/**
 * Toggle language between English and Norwegian
 */
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'no' : 'en';
    document.body.className = `lang-${currentLanguage}`;
    
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.textContent = currentLanguage === 'en' ? 'NO' : 'EN';
    }
    
    updateLanguageTexts();
}

/**
 * Toggle theme between light and dark
 */
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Apply dark mode class to body
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    // Swap the icon
    const themeIcon = document.querySelector('#themeToggle .theme-icon');
    if (!themeIcon) return;

    if (currentTheme === 'dark') {
        // MOON icon for dark mode
        themeIcon.innerHTML = '<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/>';
    } else {
        // SUN icon for light mode
        themeIcon.innerHTML = '<path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>';
    }
    
    // Store preference
    localStorage.setItem('theme', currentTheme);
}

/**
 * Toggle filter panel visibility
 */
function toggleFilterPanel() {
    const filterPanel = document.getElementById('filterPanel');
    if (filterPanel) {
        isFilterPanelVisible = !isFilterPanelVisible;
        filterPanel.style.display = isFilterPanelVisible ? 'block' : 'none';
    }
}

/**
 * Handle search functionality
 * @param {Event} event - Search input event
 */
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const chartCards = document.querySelectorAll('.chart-card');
    
    chartCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const source = card.querySelector('.source-link').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || source.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * Handle source filter
 * @param {Event} event - Filter button click event
 */
function handleSourceFilter(event) {
    const source = event.target.dataset.source;
    currentSourceFilter = source;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter charts
    const chartCards = document.querySelectorAll('.chart-card');
    chartCards.forEach(card => {
        const sourceLink = card.querySelector('.source-link');
        const cardSource = sourceLink.textContent.includes('SSB') ? 'ssb' : 
                          sourceLink.textContent.includes('Norges Bank') ? 'norges-bank' : 'static';
        
        if (source === 'all' || cardSource === source) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * Sort charts alphabetically by default
 */
function sortChartsAlphabetically() {
    const chartGrid = document.querySelector('.chart-grid');
    const chartCards = Array.from(document.querySelectorAll('.chart-card'));
    
    // Sort alphabetically
    chartCards.sort((a, b) => {
        const titleA = a.querySelector('h3').textContent;
        const titleB = b.querySelector('h3').textContent;
        return titleA.localeCompare(titleB);
    });
    
    // Re-append cards in new order
    chartCards.forEach(card => {
        chartGrid.appendChild(card);
    });
}

/**
 * Toggle alphabetical sorting
 */
function toggleSort() {
    const sortToggle = document.getElementById('sortToggle');
    const chartGrid = document.querySelector('.chart-grid');
    const chartCards = Array.from(document.querySelectorAll('.chart-card'));
    
    if (sortToggle.textContent === 'A-Z') {
        // Sort reverse alphabetically
        chartCards.sort((a, b) => {
            const titleA = a.querySelector('h3').textContent;
            const titleB = b.querySelector('h3').textContent;
            return titleB.localeCompare(titleA);
        });
        sortToggle.textContent = 'Z-A';
        sortToggle.classList.add('active');
    } else {
        // Sort alphabetically
        chartCards.sort((a, b) => {
            const titleA = a.querySelector('h3').textContent;
            const titleB = b.querySelector('h3').textContent;
            return titleA.localeCompare(titleB);
        });
        sortToggle.textContent = 'A-Z';
        sortToggle.classList.remove('active');
    }
    
    // Re-append cards in new order
    chartCards.forEach(card => {
        chartGrid.appendChild(card);
    });
}

/**
 * Update language-specific texts
 */
function updateLanguageTexts() {
    const lang = currentLanguage;
    
    // Update filter button texts
    const allSourcesBtn = document.querySelector('[data-source="all"]');
    if (allSourcesBtn) {
        allSourcesBtn.textContent = lang === 'no' ? 'Alle kilder' : 'All Sources';
    }
    
    // Update search placeholder
    const searchInput = document.getElementById('chartSearch');
    if (searchInput) {
        searchInput.placeholder = lang === 'no' ? 'Søk i diagrammer...' : 'Search charts...';
    }
}



/**
 * Update progress bar
 * @param {number} percentage - Progress percentage (0-100)
 */
function updateProgressBar(percentage) {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
}

/**
 * Update progress bar based on scroll position
 */
function updateProgressBarOnScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercentage = (scrollTop / scrollHeight) * 100;
    
    updateProgressBar(scrollPercentage);
    
    // Show/hide back to top button
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        if (scrollTop > 300) {
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    }
}

/**
 * Scroll to top of page
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        currentTheme = 'dark';
        document.body.classList.add('dark-mode');
        // Set moon icon for dark mode
        const themeIcon = document.querySelector('#themeToggle .theme-icon');
        if (themeIcon) {
            themeIcon.innerHTML = '<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/>';
        }
    } else {
        // Default to light theme
        currentTheme = 'light';
        document.body.classList.remove('dark-mode');
        // Moon icon is already set in HTML for light mode
    }
    
    initializeUI();
    initializeApp();
});
