// Comprehensive Chart Diagnostics Script
async function debugAllCharts() {
    console.log('🔍 Starting comprehensive chart diagnostics...\n');
    
    // All chart configurations from scripts.js
    const chartConfigs = [
        { id: 'cpi-chart', url: 'https://data.ssb.no/api/v0/dataset/1086.json?lang=en', title: 'Consumer Price Index' },
        { id: 'unemployment-chart', url: 'https://data.ssb.no/api/v0/dataset/1052.json?lang=en', title: 'Unemployment Rate' },
        { id: 'house-prices-chart', url: 'https://data.ssb.no/api/v0/dataset/1060.json?lang=en', title: 'House Price Index' },
        { id: 'ppi-chart', url: 'https://data.ssb.no/api/v0/dataset/26426.json?lang=en', title: 'Producer Price Index' },
        { id: 'wage-chart', url: 'https://data.ssb.no/api/v0/dataset/1124.json?lang=en', title: 'Wage Index' },
        { id: 'exchange-rate-chart', url: 'https://data.norges-bank.no/api/data/EXR/M.USD+EUR.NOK.SP?format=sdmx-json&startPeriod=2015-08-11&endPeriod=2025-08-01&locale=no', title: 'Exchange Rate' },
        { id: 'interest-rate-chart', url: 'https://data.norges-bank.no/api/data/IR/M.KPRA..?format=sdmx-json&startPeriod=2000-01-01&endPeriod=2025-08-01&locale=no', title: 'Interest Rate' },
        { id: 'government-debt-chart', url: 'https://data.norges-bank.no/api/data/GOVT_KEYFIGURES/V_O+N_V+V_I+ATRI+V_IRS..B.GBON?endPeriod=2025-08-01&format=sdmx-json&locale=no&startPeriod=2000-01-01', title: 'Government Debt' },
        { id: 'oil-fund-chart', url: 'data/oil-fund.json', title: 'Oil Fund' },
        { id: 'gdp-growth-chart', url: 'https://data.ssb.no/api/v0/dataset/59012.json?lang=en', title: 'GDP Growth' },
        { id: 'trade-balance-chart', url: 'https://data.ssb.no/api/v0/dataset/58962.json?lang=en', title: 'Trade Balance' },
        { id: 'bankruptcies-chart', url: 'https://data.ssb.no/api/v0/dataset/95265.json?lang=en', title: 'Bankruptcies' },
        { id: 'population-growth-chart', url: 'https://data.ssb.no/api/v0/dataset/49626.json?lang=en', title: 'Population Growth' },
        { id: 'construction-costs-chart', url: 'https://data.ssb.no/api/v0/dataset/26944.json?lang=en', title: 'Construction Costs' },
        { id: 'industrial-production-chart', url: 'https://data.ssb.no/api/v0/dataset/27002.json?lang=en', title: 'Industrial Production' },
        { id: 'retail-sales-chart', url: 'https://data.ssb.no/api/v0/dataset/1064.json?lang=en', title: 'Retail Sales' },
        { id: 'export-volume-chart', url: 'https://data.ssb.no/api/v0/dataset/179421.json?lang=en', title: 'Export Volume' },
        { id: 'import-volume-chart', url: 'https://data.ssb.no/api/v0/dataset/179421.json?lang=en', title: 'Import Volume' },
        { id: 'employment-rate-chart', url: 'https://data.ssb.no/api/v0/dataset/1054.json?lang=en', title: 'Employment Rate' },
        { id: 'business-confidence-chart', url: 'https://data.ssb.no/api/v0/dataset/166316.json?lang=en', title: 'Business Confidence' },
        { id: 'consumer-confidence-chart', url: 'https://data.ssb.no/api/v0/dataset/166330.json?lang=en', title: 'Consumer Confidence' },
        { id: 'housing-starts-chart', url: 'https://data.ssb.no/api/v0/dataset/95146.json?lang=en', title: 'Housing Starts' },
        { id: 'oil-price-chart', url: 'https://data.ssb.no/api/v0/dataset/26426.json?lang=en', title: 'Oil Price (Brent)' },
        { id: 'monetary-aggregates-chart', url: 'https://data.ssb.no/api/v0/dataset/172769.json?lang=en', title: 'Monetary Aggregates' },
        { id: 'job-vacancies-chart', url: 'https://data.ssb.no/api/v0/dataset/166328.json?lang=en', title: 'Job Vacancies' },
        { id: 'household-consumption-chart', url: 'https://data.ssb.no/api/v0/dataset/166330.json?lang=en', title: 'Household Consumption' },
        { id: 'producer-prices-chart', url: 'https://data.ssb.no/api/v0/dataset/26426.json?lang=en', title: 'Producer Prices' },
        { id: 'construction-production-chart', url: 'https://data.ssb.no/api/v0/dataset/924808.json?lang=en', title: 'Construction Production' },
        { id: 'credit-indicator-chart', url: 'https://data.ssb.no/api/v0/dataset/166326.json?lang=en', title: 'Credit Indicator' },
        { id: 'energy-consumption-chart', url: 'https://data.ssb.no/api/v0/dataset/928196.json?lang=en', title: 'Energy Consumption' },
        { id: 'government-revenue-chart', url: 'https://data.ssb.no/api/v0/dataset/928194.json?lang=en', title: 'Government Revenue' },
        { id: 'international-accounts-chart', url: 'https://data.ssb.no/api/v0/dataset/924820.json?lang=en', title: 'International Accounts' },
        { id: 'labour-cost-index-chart', url: 'https://data.ssb.no/api/v0/dataset/760065.json?lang=en', title: 'Labour Cost Index' },
        { id: 'rd-expenditure-chart', url: 'https://data.ssb.no/api/v0/dataset/61819.json?lang=en', title: 'R&D Expenditure' },
        { id: 'salmon-export-chart', url: 'https://data.ssb.no/api/v0/dataset/1122.json?lang=en', title: 'Salmon Export Value' },
        { id: 'oil-gas-investment-chart', url: 'https://data.ssb.no/api/v0/dataset/166334.json?lang=en', title: 'Oil & Gas Investment' },
        { id: 'immigration-rate-chart', url: 'https://data.ssb.no/api/v0/dataset/48651.json?lang=en', title: 'Immigration Rate' },
        { id: 'household-income-chart', url: 'https://data.ssb.no/api/v0/dataset/56900.json?lang=en', title: 'Household Income' },
        { id: 'life-expectancy-chart', url: 'https://data.ssb.no/api/v0/dataset/102811.json?lang=en', title: 'Life Expectancy' },
        { id: 'crime-rate-chart', url: 'https://data.ssb.no/api/v0/dataset/97445.json?lang=en', title: 'Crime Rate' },
        { id: 'education-level-chart', url: 'https://data.ssb.no/api/v0/dataset/85454.json?lang=en', title: 'Education Level' },
        { id: 'holiday-property-sales-chart', url: 'https://data.ssb.no/api/v0/dataset/65962.json?lang=en', title: 'Holiday Property Sales' },
        { id: 'greenhouse-gas-chart', url: 'https://data.ssb.no/api/v0/dataset/832678.json?lang=en', title: 'Greenhouse Gas Emissions' },
        { id: 'economic-forecasts-chart', url: 'https://data.ssb.no/api/v0/dataset/934513.json?lang=en', title: 'Economic Forecasts' },
        { id: 'new-dwellings-price-chart', url: 'https://data.ssb.no/api/v0/dataset/26158.json?lang=en', title: 'New Dwellings Price' },
        { id: 'lifestyle-habits-chart', url: 'https://data.ssb.no/api/v0/dataset/832683.json?lang=en', title: 'Lifestyle Habits' },
        { id: 'long-term-illness-chart', url: 'https://data.ssb.no/api/v0/dataset/832685.json?lang=en', title: 'Long-term Illness' },
        { id: 'population-growth-chart', url: 'https://data.ssb.no/api/v0/dataset/1104.json?lang=en', title: 'Population Growth' },
        { id: 'births-deaths-chart', url: 'https://data.ssb.no/api/v0/dataset/1106.json?lang=en', title: 'Births and Deaths' },
        { id: 'cpi-ate-chart', url: 'https://data.ssb.no/api/v0/dataset/1118.json?lang=en', title: 'CPI-ATE Index' },
        { id: 'salmon-export-volume-chart', url: 'https://data.ssb.no/api/v0/dataset/1120.json?lang=en', title: 'Salmon Export Volume' },
        { id: 'basic-salary-chart', url: 'https://data.ssb.no/api/v0/dataset/1126.json?lang=en', title: 'Basic Salary Index' },
        { id: 'export-country-chart', url: 'https://data.ssb.no/api/v0/dataset/1130.json?lang=en', title: 'Export by Country' },
        { id: 'import-country-chart', url: 'https://data.ssb.no/api/v0/dataset/1132.json?lang=en', title: 'Import by Country' },
        { id: 'export-commodity-chart', url: 'https://data.ssb.no/api/v0/dataset/1134.json?lang=en', title: 'Export by Commodity' },
        { id: 'import-commodity-chart', url: 'https://data.ssb.no/api/v0/dataset/1140.json?lang=en', title: 'Import by Commodity' },
        { id: 'construction-cost-wood-chart', url: 'https://data.ssb.no/api/v0/dataset/1056.json?lang=en', title: 'Construction Cost Wood' },
        { id: 'construction-cost-multi-chart', url: 'https://data.ssb.no/api/v0/dataset/1058.json?lang=en', title: 'Construction Cost Multi' },
        { id: 'wholesale-retail-chart', url: 'https://data.ssb.no/api/v0/dataset/1064.json?lang=en', title: 'Wholesale Retail Sales' },
        { id: 'household-types-chart', url: 'https://data.ssb.no/api/v0/dataset/1068.json?lang=en', title: 'Household Types' },
        { id: 'population-age-chart', url: 'https://data.ssb.no/api/v0/dataset/1074.json?lang=en', title: 'Population by Age' },
        { id: 'cpi-coicop-chart', url: 'https://data.ssb.no/api/v0/dataset/1084.json?lang=en', title: 'CPI Coicop Divisions' },
        { id: 'cpi-subgroups-chart', url: 'https://data.ssb.no/api/v0/dataset/1090.json?lang=en', title: 'CPI Sub-groups' },
        { id: 'cpi-items-chart', url: 'https://data.ssb.no/api/v0/dataset/1096.json?lang=en', title: 'CPI Items' },
        { id: 'cpi-delivery-chart', url: 'https://data.ssb.no/api/v0/dataset/1100.json?lang=en', title: 'CPI Delivery Sectors' },
        { id: 'household-income-size-chart', url: 'https://data.ssb.no/api/v0/dataset/56957.json?lang=en', title: 'Household Income Size' },
        { id: 'cohabiting-arrangements-chart', url: 'https://data.ssb.no/api/v0/dataset/85440.json?lang=en', title: 'Cohabiting Arrangements' },
        { id: 'utility-floor-space-chart', url: 'https://data.ssb.no/api/v0/dataset/95177.json?lang=en', title: 'Utility Floor Space' },
        { id: 'credit-indicator-c2-chart', url: 'https://data.ssb.no/api/v0/dataset/166326.json?lang=en', title: 'Credit Indicator C2' },
        { id: 'job-vacancies-new-chart', url: 'https://data.ssb.no/api/v0/dataset/166328.json?lang=en', title: 'Job Vacancies' },
        { id: 'oil-gas-turnover-chart', url: 'https://data.ssb.no/api/v0/dataset/124322.json?lang=en', title: 'Oil Gas Turnover' },
        { id: 'trade-volume-price-chart', url: 'https://data.ssb.no/api/v0/dataset/179415.json?lang=en', title: 'Trade Volume Price' },
        { id: 'producer-price-industry-chart', url: 'https://data.ssb.no/api/v0/dataset/179415.json?lang=en', title: 'Producer Price Industry' },
        { id: 'deaths-age-chart', url: 'https://data.ssb.no/api/v0/dataset/567324.json?lang=en', title: 'Deaths by Age' },
        { id: 'construction-production-chart', url: 'https://data.ssb.no/api/v0/dataset/924808.json?lang=en', title: 'Construction Production' },
        { id: 'bankruptcies-total-chart', url: 'https://data.ssb.no/api/v0/dataset/924816.json?lang=en', title: 'Bankruptcies Total' },
        { id: 'energy-accounts-chart', url: 'https://data.ssb.no/api/v0/dataset/928196.json?lang=en', title: 'Energy Accounts' },
        { id: 'monetary-m3-chart', url: 'https://data.ssb.no/api/v0/dataset/172793.json?lang=en', title: 'Monetary Aggregate M3' },
        { id: 'new-dwellings-price-chart', url: 'https://data.ssb.no/api/v0/dataset/25138.json?lang=en', title: 'New Dwellings Price' },
        { id: 'business-tendency-chart', url: 'https://data.ssb.no/api/v0/dataset/166316.json?lang=en', title: 'Business Tendency Survey' }
    ];

    let passedTests = 0;
    let failedTests = 0;
    const failedCharts = [];

    console.log(`📊 Testing ${chartConfigs.length} charts...\n`);

    for (const config of chartConfigs) {
        try {
            console.log(`🔍 Testing ${config.title} (${config.id})...`);
            
            // Test API connection
            const response = await fetch(config.url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Test data parsing
            let parsedData;
            if (config.url.includes('ssb.no')) {
                parsedData = parseSSBData(data, config.title);
            } else if (config.url.includes('norges-bank.no')) {
                if (config.title === 'Exchange Rate') {
                    parsedData = parseExchangeRateData(data);
                } else if (config.title === 'Interest Rate') {
                    parsedData = parseInterestRateData(data);
                } else if (config.title === 'Government Debt') {
                    parsedData = parseGovernmentDebtData(data);
                }
            } else if (config.url.includes('oil-fund.json')) {
                parsedData = parseOilFundData(data);
            }
            
            if (!parsedData || parsedData.length === 0) {
                throw new Error('No data points after parsing');
            }
            
            // Filter data from 2000 onwards
            const filteredData = parsedData.filter(item => {
                const year = new Date(item.date).getFullYear();
                return year >= 2000;
            });
            
            if (filteredData.length === 0) {
                throw new Error('No data available from 2000 onwards');
            }
            
            console.log(`   ✅ ${config.title} - PASSED (${filteredData.length} data points)`);
            passedTests++;
            
        } catch (error) {
            console.log(`   ❌ ${config.title} - FAILED: ${error.message}`);
            failedTests++;
            failedCharts.push({
                id: config.id,
                title: config.title,
                url: config.url,
                error: error.message
            });
        }
    }

    // Summary
    console.log(`\n📋 DIAGNOSTIC SUMMARY:`);
    console.log(`   ✅ Passed: ${passedTests}/${chartConfigs.length}`);
    console.log(`   ❌ Failed: ${failedTests}/${chartConfigs.length}`);
    console.log(`   📊 Success Rate: ${((passedTests / chartConfigs.length) * 100).toFixed(1)}%`);
    
    if (failedCharts.length > 0) {
        console.log(`\n❌ FAILED CHARTS:`);
        failedCharts.forEach(chart => {
            console.log(`   - ${chart.title} (${chart.id}): ${chart.error}`);
        });
    }
    
    if (passedTests === chartConfigs.length) {
        console.log(`\n🎉 All charts are working correctly!`);
    } else {
        console.log(`\n⚠️  Some charts have issues. Check the failed tests above.`);
    }
    
    return { passedTests, failedTests, failedCharts };
}

// Copy the parsing functions from scripts.js
function parseSSBData(ssbData, chartTitle) {
    try {
        const dataset = ssbData.dataset;
        const dimension = dataset.dimension;
        const value = dataset.value;

        const timeDimension = dimension.Tid;
        if (!timeDimension) {
            throw new Error('Time dimension not found in SSB data');
        }

        const timeLabels = timeDimension.category.label;
        const timeIndex = timeDimension.category.index;

        let targetSeriesIndex = 0;
        let numSeries = 1;
        
        if (dimension.ContentsCode) {
            const contentLabels = dimension.ContentsCode.category.label;
            const contentIndices = dimension.ContentsCode.category.index;
            
            for (const [key, label] of Object.entries(contentLabels)) {
                if (label.includes('Consumer Price Index (2015=100)') || 
                    label.includes('Unemployment rate (LFS)') ||
                    label.includes('Producer Price Index') ||
                    label.includes('House Price Index') ||
                    label.includes('Wage Index') ||
                    label.includes('GDP') ||
                    label.includes('Trade balance') ||
                    label.includes('Bankruptcies') ||
                    label.includes('Population') ||
                    label.includes('Construction cost')) {
                    targetSeriesIndex = contentIndices[key];
                    break;
                }
            }
            numSeries = Object.keys(contentIndices).length;
        }

        const dataPoints = [];
        
        Object.keys(timeLabels).forEach(timeKey => {
            const timeLabel = timeLabels[timeKey];
            const timeIndexValue = timeIndex[timeKey];
            
            const date = parseTimeLabel(timeLabel);
            
            if (date) {
                const valueIndex = timeIndexValue * numSeries + targetSeriesIndex;
                
                if (valueIndex < value.length) {
                    const dataValue = value[valueIndex];
                    
                    if (dataValue !== undefined && dataValue !== null && dataValue !== 0) {
                        dataPoints.push({
                            date: date,
                            value: parseFloat(dataValue)
                        });
                    }
                }
            }
        });

        dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
        return dataPoints;

    } catch (error) {
        console.error('Error parsing SSB data:', error);
        throw new Error('Invalid SSB data format');
    }
}

function parseTimeLabel(timeLabel) {
    try {
        if (timeLabel.includes('M')) {
            const [year, month] = timeLabel.split('M');
            return new Date(parseInt(year), parseInt(month) - 1, 1);
        }
        
        if (timeLabel.includes('K')) {
            const [year, quarter] = timeLabel.split('K');
            const quarterNum = parseInt(quarter);
            const month = (quarterNum - 1) * 3;
            return new Date(parseInt(year), month, 1);
        }
        
        if (/^\d{4}$/.test(timeLabel)) {
            return new Date(parseInt(timeLabel), 0, 1);
        }
        
        return new Date(timeLabel);
        
    } catch (error) {
        console.error('Error parsing time label:', timeLabel, error);
        return null;
    }
}

function parseExchangeRateData(data) {
    try {
        const dataSets = data.data.dataSets[0];
        const series = dataSets.series;
        const dataPoints = [];
        
        Object.keys(series).forEach(seriesKey => {
            const seriesData = series[seriesKey];
            const observations = seriesData.observations;
            
            Object.keys(observations).forEach(obsKey => {
                const obs = observations[obsKey][0];
                if (obs && obs.value !== undefined) {
                    const date = new Date(obsKey);
                    dataPoints.push({
                        date: date,
                        value: parseFloat(obs.value)
                    });
                }
            });
        });
        
        return dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (error) {
        throw new Error('Invalid exchange rate data format');
    }
}

function parseInterestRateData(data) {
    try {
        const dataSets = data.data.dataSets[0];
        const series = dataSets.series;
        const dataPoints = [];
        
        Object.keys(series).forEach(seriesKey => {
            const seriesData = series[seriesKey];
            const observations = seriesData.observations;
            
            Object.keys(observations).forEach(obsKey => {
                const obs = observations[obsKey][0];
                if (obs && obs.value !== undefined) {
                    const date = new Date(obsKey);
                    dataPoints.push({
                        date: date,
                        value: parseFloat(obs.value)
                    });
                }
            });
        });
        
        return dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (error) {
        throw new Error('Invalid interest rate data format');
    }
}

function parseGovernmentDebtData(data) {
    try {
        const dataSets = data.data.dataSets[0];
        const series = dataSets.series;
        const dataPoints = [];
        
        Object.keys(series).forEach(seriesKey => {
            const seriesData = series[seriesKey];
            const observations = seriesData.observations;
            
            Object.keys(observations).forEach(obsKey => {
                const obs = observations[obsKey][0];
                if (obs && obs.value !== undefined) {
                    const date = new Date(obsKey);
                    dataPoints.push({
                        date: date,
                        value: parseFloat(obs.value)
                    });
                }
            });
        });
        
        return dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (error) {
        throw new Error('Invalid government debt data format');
    }
}

function parseOilFundData(data) {
    try {
        if (!data.data || !Array.isArray(data.data)) {
            throw new Error('Invalid oil fund data structure');
        }
        
        return data.data.map(item => ({
            date: new Date(item.date),
            value: parseFloat(item.value)
        })).sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (error) {
        throw new Error('Invalid oil fund data format');
    }
}

// Make function available globally
if (typeof window !== 'undefined') {
    window.debugAllCharts = debugAllCharts;
    console.log('🔍 Chart diagnostics script loaded. Run debugAllCharts() to test all charts.');
}
