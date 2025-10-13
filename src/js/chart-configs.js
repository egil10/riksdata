// ============================================================================
// CHART CONFIGURATIONS - ONLY WORKING CHARTS
// ============================================================================
// Metadata (subtitle, sourceUrl, sourceName) is auto-inferred from URL in main.js

export const chartConfigs = [
    // === SSB CHARTS (WORKING) ===
    { id: 'cpi-chart', url: 'https://data.ssb.no/api/v0/dataset/1086.json?lang=en', title: 'Consumer Price Index' },
    { id: 'unemployment-chart', url: 'https://data.ssb.no/api/v0/dataset/1054.json?lang=en', title: 'Unemployment Rate', subtitle: 'Percentage' },
    { id: 'house-prices-chart', url: 'https://data.ssb.no/api/v0/dataset/1060.json?lang=en', title: 'House Price Index' },
    { id: 'producer-price-index-chart', url: 'https://data.ssb.no/api/v0/dataset/26426.json?lang=en', title: 'Producer Price Index' },
    { id: 'wage-index-chart', url: 'https://data.ssb.no/api/v0/dataset/1124.json?lang=en', title: 'Wage Index' },
    { id: 'population-growth-chart', url: 'https://data.ssb.no/api/v0/dataset/49626.json?lang=en', title: 'Population Growth', subtitle: 'Annual %' },
    { id: 'construction-costs-chart', url: 'https://data.ssb.no/api/v0/dataset/26944.json?lang=en', title: 'Construction Costs' },
    { id: 'construction-cost-multi-chart', url: 'https://data.ssb.no/api/v0/dataset/1058.json?lang=en', title: 'Construction Cost Multi' },
    { id: 'construction-cost-wood-chart', url: 'https://data.ssb.no/api/v0/dataset/1056.json?lang=en', title: 'Construction Cost Wood' },
    { id: 'construction-production-index-chart', url: 'https://data.ssb.no/api/v0/dataset/924808.json?lang=en', title: 'Construction Production Index', subtitle: 'Index' },
    { id: 'industrial-production-chart', url: 'https://data.ssb.no/api/v0/dataset/27002.json?lang=en', title: 'Industrial Production' },
    { id: 'export-volume-chart', url: 'https://data.ssb.no/api/v0/dataset/179421.json?lang=en', title: 'Export Volume', subtitle: 'NOK Million' },
    { id: 'business-confidence-chart', url: 'https://data.ssb.no/api/v0/dataset/166316.json?lang=en', title: 'Business Confidence', subtitle: 'Index' },
    { id: 'business-cycle-barometer-products-chart', url: 'https://data.ssb.no/api/v0/dataset/166317.json?lang=en', title: 'Business Cycle Barometer Products', subtitle: 'Index' },
    { id: 'monetary-aggregates-chart', url: 'https://data.ssb.no/api/v0/dataset/172769.json?lang=en', title: 'Monetary Aggregates', subtitle: 'NOK Million' },
    { id: 'monetary-aggregate-m3-chart', url: 'https://data.ssb.no/api/v0/dataset/172793.json?lang=en', title: 'Monetary Aggregate M3', subtitle: 'Million NOK' },
    { id: 'credit-indicator-chart', url: 'https://data.ssb.no/api/v0/dataset/166326.json?lang=en', title: 'Credit Indicator', subtitle: 'NOK Million' },
    { id: 'credit-indicator-k2-detailed-chart', url: 'https://data.ssb.no/api/v0/dataset/62264.json?lang=en', title: 'Credit Indicator K2 Detailed', subtitle: 'NOK Million' },
    { id: 'credit-indicator-k2-seasonally-adjusted-chart', url: 'https://data.ssb.no/api/v0/dataset/166329.json?lang=en', title: 'Credit Indicator K2 Seasonally Adjusted', subtitle: 'NOK Million' },
    { id: 'credit-indicator-k3-chart', url: 'https://data.ssb.no/api/v0/dataset/166327.json?lang=en', title: 'Credit Indicator K3', subtitle: 'NOK Million' },
    { id: 'energy-consumption-chart', url: 'https://data.ssb.no/api/v0/dataset/928196.json?lang=en', title: 'Energy Consumption', subtitle: 'Terajoules' },
    { id: 'government-revenue-chart', url: 'https://data.ssb.no/api/v0/dataset/928194.json?lang=en', title: 'Government Revenue', subtitle: 'NOK Million' },
    { id: 'international-accounts-chart', url: 'https://data.ssb.no/api/v0/dataset/924820.json?lang=en', title: 'International Accounts', subtitle: 'NOK Million' },
    { id: 'labour-cost-index-chart', url: 'https://data.ssb.no/api/v0/dataset/760065.json?lang=en', title: 'Labour Cost Index' },
    { id: 'basic-salary-index-chart', url: 'https://data.ssb.no/api/v0/dataset/1126.json?lang=en', title: 'Basic Salary Index' },
    { id: 'r-d-expenditure-chart', url: 'https://data.ssb.no/api/v0/dataset/61819.json?lang=en', title: 'R&D Expenditure', subtitle: 'NOK Million' },
    { id: 'salmon-export-value-chart', url: 'https://data.ssb.no/api/v0/dataset/1122.json?lang=en', title: 'Salmon Export Value', subtitle: 'NOK Million' },
    { id: 'oil-gas-investment-chart', url: 'https://data.ssb.no/api/v0/dataset/166334.json?lang=en', title: 'Oil & Gas Investment', subtitle: 'NOK Million' },
    { id: 'oil-gas-industry-turnover-chart', url: 'https://data.ssb.no/api/v0/dataset/124341.json?lang=en', title: 'Oil & Gas Industry Turnover', subtitle: 'NOK Million' },
    { id: 'oil-gas-industry-turnover-sn2007-chart', url: 'https://data.ssb.no/api/v0/dataset/124322.json?lang=en', title: 'Oil & Gas Industry Turnover SN2007', subtitle: 'NOK Million' },
    { id: 'immigration-rate-chart', url: 'https://data.ssb.no/api/v0/dataset/48651.json?lang=en', title: 'Immigration Rate', subtitle: 'Annual Count' },
    { id: 'household-income-chart', url: 'https://data.ssb.no/api/v0/dataset/56900.json?lang=en', title: 'Household Income', subtitle: 'Median NOK' },
    { id: 'household-income-national-chart', url: 'https://data.ssb.no/api/v0/dataset/56957.json?lang=en', title: 'Household Income National', subtitle: 'Median NOK' },
    { id: 'household-consumption-chart', url: 'https://data.ssb.no/api/v0/dataset/166330.json?lang=en', title: 'Household Consumption' },
    { id: 'household-types-chart', url: 'https://data.ssb.no/api/v0/dataset/1068.json?lang=en', title: 'Household Types', subtitle: 'Number' },
    { id: 'crime-rate-chart', url: 'https://data.ssb.no/api/v0/dataset/97445.json?lang=en', title: 'Crime Rate', subtitle: 'Annual Count' },
    { id: 'education-level-chart', url: 'https://data.ssb.no/api/v0/dataset/85454.json?lang=en', title: 'Education Level', subtitle: 'Percentage' },
    { id: 'greenhouse-gas-emissions-chart', url: 'https://data.ssb.no/api/v0/dataset/832678.json?lang=en', title: 'Greenhouse Gas Emissions', subtitle: 'CO2 Equivalent' },
    { id: 'economic-forecasts-chart', url: 'https://data.ssb.no/api/v0/dataset/934513.json?lang=en', title: 'Economic Forecasts', subtitle: 'GDP Growth %' },
    { id: 'bankruptcies-total-chart', url: 'https://data.ssb.no/api/v0/dataset/924816.json?lang=en', title: 'Bankruptcies Total', subtitle: 'Number' },
    { id: 'immigrants-with-immigrant-parents-chart', url: 'https://data.ssb.no/api/v0/dataset/96304.json?lang=en', title: 'Immigrants with Immigrant Parents', subtitle: 'Number' },
    { id: 'tax-returns-main-items-chart', url: 'https://data.ssb.no/api/v0/dataset/49656.json?lang=en', title: 'Tax Returns Main Items', subtitle: 'NOK Million' },
    { id: 'public-administration-expenditures-chart', url: 'https://data.ssb.no/api/v0/dataset/112175.json?lang=en', title: 'Public Administration Expenditures', subtitle: 'NOK Million' },
    { id: 'utility-floor-space-chart', url: 'https://data.ssb.no/api/v0/dataset/95177.json?lang=en', title: 'Utility Floor Space', subtitle: 'Square meters' },
    { id: 'producer-price-industry-chart', url: 'https://data.ssb.no/api/v0/dataset/741023.json?lang=en', title: 'Producer Price Industry' },
    
    // CPI Charts
    { id: 'cpi-adjusted-indices-chart', url: 'https://data.ssb.no/api/v0/dataset/1118.json?lang=en', title: 'CPI Adjusted Indices' },
    { id: 'cpi-group-level-chart', url: 'https://data.ssb.no/api/v0/dataset/1092.json?lang=en', title: 'CPI Group Level' },
    { id: 'cpi-coicop-divisions-chart', url: 'https://data.ssb.no/api/v0/dataset/1084.json?lang=en', title: 'CPI Coicop Divisions' },
    { id: 'cpi-delivery-sectors-chart', url: 'https://data.ssb.no/api/v0/dataset/1100.json?lang=en', title: 'CPI Delivery Sectors' },
    { id: 'cpi-sub-groups-chart', url: 'https://data.ssb.no/api/v0/dataset/1090.json?lang=en', title: 'CPI Sub-groups' },
    { id: 'cpi-items-chart', url: 'https://data.ssb.no/api/v0/dataset/1096.json?lang=en', title: 'CPI Items' },
    { id: 'cpi-seasonally-adjusted-chart', url: 'https://data.ssb.no/api/v0/dataset/45590.json?lang=en', title: 'CPI Seasonally Adjusted' },
    { id: 'cpi-adjusted-delivery-sector-chart', url: 'https://data.ssb.no/api/v0/dataset/130297.json?lang=en', title: 'CPI Adjusted Delivery Sector' },
    
    // Trade Charts
    { id: 'import-value-volume-sitc-chart', url: 'https://data.ssb.no/api/v0/dataset/34640.json?lang=en', title: 'Import Value Volume SITC', subtitle: 'NOK Million' },
    { id: 'export-value-volume-sitc-chart', url: 'https://data.ssb.no/api/v0/dataset/34642.json?lang=en', title: 'Export Value Volume SITC', subtitle: 'NOK Million' },
    { id: 'import-value-volume-sitc1-chart', url: 'https://data.ssb.no/api/v0/dataset/34254.json?lang=en', title: 'Import Value Volume SITC1', subtitle: 'NOK Million' },
    { id: 'export-value-volume-sitc1-chart', url: 'https://data.ssb.no/api/v0/dataset/34256.json?lang=en', title: 'Export Value Volume SITC1', subtitle: 'NOK Million' },
    { id: 'import-value-sitc3-chart', url: 'https://data.ssb.no/api/v0/dataset/34641.json?lang=en', title: 'Import Value SITC3', subtitle: 'NOK Million' },
    { id: 'export-value-sitc3-chart', url: 'https://data.ssb.no/api/v0/dataset/34643.json?lang=en', title: 'Export Value SITC3', subtitle: 'NOK Million' },
    { id: 'trade-volume-price-bec-chart', url: 'https://data.ssb.no/api/v0/dataset/179415.json?lang=en', title: 'Trade Volume Price BEC', subtitle: 'NOK Million' },
    { id: 'trade-volume-price-product-groups-chart', url: 'https://data.ssb.no/api/v0/dataset/179417.json?lang=en', title: 'Trade Volume Price Product Groups', subtitle: 'NOK Million' },
    
    // Producer Price Index Charts
    { id: 'producer-price-index-industries-chart', url: 'https://data.ssb.no/api/v0/dataset/26430.json?lang=en', title: 'Producer Price Index Industries' },
    { id: 'producer-price-index-products-chart', url: 'https://data.ssb.no/api/v0/dataset/26431.json?lang=en', title: 'Producer Price Index Products' },
    { id: 'producer-price-index-subgroups-detailed-chart', url: 'https://data.ssb.no/api/v0/dataset/26432.json?lang=en', title: 'Producer Price Index Subgroups Detailed' },
    
    // First Hand Price Index
    { id: 'first-hand-price-index-chart', url: 'https://data.ssb.no/api/v0/dataset/82677.json?lang=en', title: 'First Hand Price Index' },
    { id: 'first-hand-price-index-groups-chart', url: 'https://data.ssb.no/api/v0/dataset/82679.json?lang=en', title: 'First Hand Price Index Groups' },
    { id: 'first-hand-price-index-subgroups-chart', url: 'https://data.ssb.no/api/v0/dataset/82681.json?lang=en', title: 'First Hand Price Index Subgroups' },
    
    // Money Supply
    { id: 'money-supply-m0-chart', url: 'https://data.ssb.no/api/v0/dataset/172771.json?lang=en', title: 'Money Supply M0', subtitle: 'NOK Million' },
    { id: 'money-supply-m3-net-claims-chart', url: 'https://data.ssb.no/api/v0/dataset/172800.json?lang=en', title: 'Money Supply M3 Net Claims', subtitle: 'NOK Million' },
    
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
    
    // === NVE RESERVOIR STATISTICS ===
    { id: 'nve-all-series-chart', url: './data/cached/nve/all-series.json', title: 'NVE Reservoir Statistics - All Series', subtitle: 'Magasinfyllingsgrad etter område', type: 'nve-reservoir' },
    { id: 'nve-areas-chart', url: './data/cached/nve/areas.json', title: 'NVE Reservoir Statistics - Areas', subtitle: 'Magasinstatistikk etter område', type: 'nve-reservoir' },
    { id: 'nve-min-max-median-chart', url: './data/cached/nve/min-max-median.json', title: 'NVE Reservoir Statistics - Min/Max/Median', subtitle: 'Magasinstatistikk sammendrag', type: 'nve-reservoir' },
    { id: 'nve-reservoir-fill-chart', url: './data/static/nve-reservoir-fill.json', title: 'Norway Annual Reservoir Fill', subtitle: 'Percent', type: 'line' },
    
    // === STATNETT ELECTRICITY DATA ===
    { id: 'statnett-latest-detailed-overview-chart', url: './data/cached/statnett/latest-detailed-overview.json', title: 'Statnett Latest Detailed Overview', subtitle: 'Nåværende elektrisitetsproduksjon og forbruk', type: 'statnett-production-consumption' },
    { id: 'statnett-production-consumption-complete-chart', url: './data/cached/statnett/production-consumption-complete.json', title: 'Statnett Production & Consumption Complete', subtitle: 'Fullstendige elektrisitetsdata', type: 'statnett-production-consumption' },
    
    // === OUR WORLD IN DATA (OWID) CHARTS ===
    { id: 'norway-oda-per-capita-chart', url: './data/cached/oda_per_capita.json', title: 'Norway ODA per Capita', subtitle: 'USD per capita', type: 'line' },
    { id: 'norway-internet-usage-chart', url: './data/cached/internet_use.json', title: 'Norway Internet Usage', subtitle: '% of population', type: 'line' },
    { id: 'norway-homicide-rate-chart', url: './data/cached/homicide_rate.json', title: 'Norway Homicide Rate', subtitle: 'per 100,000 population', type: 'line' },
    { id: 'norway-maternal-mortality-chart', url: './data/cached/maternal_mortality.json', title: 'Norway Maternal Mortality', subtitle: 'deaths per 100,000 live births', type: 'line' },
    { id: 'norway-military-spending-chart', url: './data/cached/military_spending.json', title: 'Norway Military Spending', subtitle: '% of GDP', type: 'line' },
    { id: 'norway-women-parliament-chart', url: './data/cached/women_in_parliament.json', title: 'Norway Women in Parliament', subtitle: '% of parliament', type: 'line' },
    { id: 'norway-co2-per-capita-chart', url: './data/cached/co2_per_capita.json', title: 'Norway CO₂ Emissions per Capita', subtitle: 'tonnes per person', type: 'line' },
    { id: 'norway-vaccination-coverage-chart', url: './data/cached/vaccination_coverage.json', title: 'Norway Vaccination Coverage', subtitle: '% coverage', type: 'line' },
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
// TOTAL: ~120 working charts (70 SSB + 30 DFO + 26 OWID + others)
// ============================================================================

