// Political party periods for chart coloring (post-2000) with correct Norwegian colors
const POLITICAL_PERIODS = [
    {
        name: "Kjell Magne Bondevik I (KrF, Sp, V)",
        start: "1997-10-17",
        end: "2000-03-17",
        color: "#FDED34", // Kristelig Folkeparti yellow
        backgroundColor: "rgba(253, 237, 52, 0.7)"
    },
    {
        name: "Jens Stoltenberg I (Ap)",
        start: "2000-03-17",
        end: "2001-10-19",
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)"
    },
    {
        name: "Kjell Magne Bondevik II (KrF, H, V)",
        start: "2001-10-19",
        end: "2005-10-17",
        color: "#FDED34", // Kristelig Folkeparti yellow
        backgroundColor: "rgba(253, 237, 52, 0.7)"
    },
    {
        name: "Jens Stoltenberg II (Ap, SV, Sp)",
        start: "2005-10-17",
        end: "2013-10-16",
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)"
    },
    {
        name: "Erna Solberg (H, FrP; later V, KrF)",
        start: "2013-10-16",
        end: "2021-10-14",
        color: "#87add7", // Høyre light blue
        backgroundColor: "rgba(135, 173, 215, 0.7)"
    },
    {
        name: "Jonas Gahr Støre (Ap, Sp)",
        start: "2021-10-14",
        end: "2025-09-08", // Extended until next election
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)"
    }
];

// Get political period for a given date
function getPoliticalPeriod(date) {
    const targetDate = new Date(date);
    for (const period of POLITICAL_PERIODS) {
        const startDate = new Date(period.start);
        const endDate = new Date(period.end);
        if (targetDate >= startDate && targetDate <= endDate) {
            return period;
        }
    }
    return null;
}

// Chart configuration with compressed x-axis format
const CHART_CONFIG = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        tooltip: {
            enabled: false // Disable default tooltips
        },
        legend: {
            display: false
        }
    },
    scales: {
        x: {
            type: 'time',
            time: {
                unit: 'month',
                displayFormats: {
                    year: 'yyyy',
                    month: 'MMM yyyy'
                }
            },
            ticks: {
                maxTicksLimit: 8,
                callback: function(value, index, values) {
                    const date = new Date(value);
                    const year = date.getFullYear();
                    
                    // Show full year for the very first tick, then compressed format for all subsequent year ticks
                    if (index === 0) {
                        return year.toString();
                    } else {
                        // Show compressed format for all other ticks
                        return "'" + year.toString().slice(-2);
                    }
                }
            },
            grid: {
                display: false
            }
        },
        y: {
            beginAtZero: false,
            grid: {
                color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
                maxTicksLimit: 5
            }
        }
    },
    elements: {
        point: {
            radius: 0,
            hoverRadius: 4,
            hoverBackgroundColor: function(context) {
                const period = getPoliticalPeriod(context.parsed.x);
                return period ? period.color : '#666';
            }
        },
        line: {
            borderWidth: 2
        }
    },
    animation: {
        duration: 1000,
        easing: 'easeOutQuart'
    },
    interaction: {
        intersect: false,
        mode: 'index'
    }
};

// Function to create static tooltip content
function createStaticTooltipContent(context) {
    const value = context.parsed.y;
    const date = new Date(context.parsed.x);
    const period = getPoliticalPeriod(context.parsed.x);
    const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
    
    // Format date
    const formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
    
    // Get prime minister name and party
    let primeMinisterName = '';
    let partyShortname = '';
    let partyColor = '#000000';
    
    if (period) {
        // Extract prime minister name from period name (before the parentheses)
        const nameMatch = period.name.match(/^([^(]+)/);
        if (nameMatch) {
            primeMinisterName = nameMatch[1].trim();
        }
        
        // Extract party abbreviations from period name
        const partyMatch = period.name.match(/\((.*?)\)/);
        if (partyMatch) {
            const parties = partyMatch[1].split(', ');
            // Use the first party as the main party
            partyShortname = parties[0];
            
            // Define party colors
            const partyColors = {
                'Ap': '#E11926',
                'KrF': '#FDED34', 
                'H': '#87add7',
                'V': '#006666',
                'Sp': '#00843D',
                'SV': '#B5317C',
                'FrP': '#004F80',
                'MDG': '#6A9325'
            };
            
            partyColor = partyColors[partyShortname] || '#000000';
        }
    }
    
    // Create tooltip content with the requested format
    let tooltipContent = `
        <div style="font-weight: bold; margin-bottom: 4px;">${formattedDate}, ${formattedValue}</div>
    `;
    
    if (primeMinisterName && partyShortname) {
        tooltipContent += `
            <div style="font-size: 0.9em; color: #666;">
                <span style="color: ${partyColor}; font-weight: bold;">${partyShortname}</span> • ${primeMinisterName}
            </div>
        `;
    }
    
    return tooltipContent;
}

// Function to update static tooltip
function updateStaticTooltip(chart, tooltipId, context) {
    const tooltipElement = document.getElementById(tooltipId);
    if (tooltipElement && context) {
        const content = createStaticTooltipContent(context);
        tooltipElement.innerHTML = content;
        tooltipElement.classList.add('visible');
    }
}

// Function to hide static tooltip
function hideStaticTooltip(tooltipId) {
    const tooltipElement = document.getElementById(tooltipId);
    if (tooltipElement) {
        tooltipElement.classList.remove('visible');
    }
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    setupLanguageToggle();
    setupThemeToggle();
});

// Setup language toggle
function setupLanguageToggle() {
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', toggleLanguage);
    }
}

// Setup theme toggle
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// Toggle theme
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    
    // Update theme toggle icon
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const themeIcon = themeToggle.querySelector('.theme-icon');
        if (themeIcon) {
            if (body.classList.contains('dark-mode')) {
                // Show sun icon for dark mode
                themeIcon.innerHTML = '<path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>';
            } else {
                // Show moon icon for light mode
                themeIcon.innerHTML = '<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/>';
            }
        }
    }
}

// Update language text
function updateLanguageText(lang) {
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.textContent = lang === 'no' ? 'EN' : 'NO';
    }
}

// Toggle language
function toggleLanguage() {
    const body = document.body;
    const isEnglish = body.classList.contains('lang-en');
    
    if (isEnglish) {
        body.classList.remove('lang-en');
        body.classList.add('lang-no');
        updateLanguageText('no');
        updatePageLanguage('no');
    } else {
        body.classList.remove('lang-no');
        body.classList.add('lang-en');
        updateLanguageText('en');
        updatePageLanguage('en');
    }
}

// Update page language
function updatePageLanguage(lang) {
    const searchInput = document.getElementById('chartSearch');
    if (searchInput) {
        searchInput.placeholder = lang === 'no' ? 'Søk i diagrammer...' : 'Search charts...';
    }
    
    // Update filter button texts
    const allSourcesBtn = document.querySelector('[data-source="all"]');
    const ssbBtn = document.querySelector('[data-source="ssb"]');
    const norgesBankBtn = document.querySelector('[data-source="norges-bank"]');
    
    if (allSourcesBtn) {
        allSourcesBtn.textContent = lang === 'no' ? 'Alle kilder' : 'All Sources';
    }
    if (ssbBtn) {
        ssbBtn.textContent = 'SSB'; // Same in both languages
    }
    if (norgesBankBtn) {
        norgesBankBtn.textContent = lang === 'no' ? 'Norges Bank' : 'Norges Bank';
    }
}



// Initialize all charts
async function initializeCharts() {
    try {
        // Show loading screen
        const loadingScreen = document.getElementById('loading-screen');
        
        // Show skeleton loading for all charts
        showSkeletonLoading();
        
        // Load all charts in parallel
        const chartPromises = [
            // Original charts
            loadChartData('cpi-chart', 'https://data.ssb.no/api/v0/dataset/1086.json?lang=en', 'Consumer Price Index'),
            loadChartData('unemployment-chart', 'https://data.ssb.no/api/v0/dataset/1052.json?lang=en', 'Unemployment Rate'),
            loadChartData('house-prices-chart', 'https://data.ssb.no/api/v0/dataset/1060.json?lang=en', 'House Price Index'),
            loadChartData('ppi-chart', 'https://data.ssb.no/api/v0/dataset/26426.json?lang=en', 'Producer Price Index'),
            loadChartData('wage-chart', 'https://data.ssb.no/api/v0/dataset/1124.json?lang=en', 'Wage Index'),
            loadOilFundData('oil-fund-chart', 'data/oil-fund.json', 'Oil Fund Value'),
            loadExchangeRateData('exchange-chart', 'https://data.norges-bank.no/api/data/EXR/M.USD+EUR.NOK.SP?format=sdmx-json&startPeriod=2015-08-11&endPeriod=2025-08-01&locale=no', 'USD/NOK'),
            loadInterestRateData('interest-rate-chart', 'https://data.norges-bank.no/api/data/IR/M.KPRA..?format=sdmx-json&startPeriod=2000-01-01&endPeriod=2025-08-01&locale=no', 'Key Policy Rate'),
            loadGovernmentDebtData('govt-debt-chart', 'https://data.norges-bank.no/api/data/GOVT_KEYFIGURES/V_O+N_V+V_I+ATRI+V_IRS..B.GBON?endPeriod=2025-08-01&format=sdmx-json&locale=no&startPeriod=2000-01-01', 'Government Debt'),
            
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
            loadExchangeRateData('eur-exchange-chart', 'https://data.norges-bank.no/api/data/EXR/M.EUR.NOK.SP?format=sdmx-json&startPeriod=2015-08-11&endPeriod=2025-08-01&locale=no', 'EUR/NOK'),
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
            loadChartData('long-term-illness-chart', 'https://data.ssb.no/api/v0/dataset/832685.json?lang=en', 'Long-term Illness'),
            
            // 27 Additional charts
            loadChartData('population-growth-chart', 'https://data.ssb.no/api/v0/dataset/1104.json?lang=en', 'Population Growth'),
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
            loadChartData('construction-production-chart', 'https://data.ssb.no/api/v0/dataset/924809.json?lang=en', 'Construction Production'),
            loadChartData('bankruptcies-total-chart', 'https://data.ssb.no/api/v0/dataset/924816.json?lang=en', 'Bankruptcies Total'),
            loadChartData('energy-accounts-chart', 'https://data.ssb.no/api/v0/dataset/928197.json?lang=en', 'Energy Accounts'),
            loadChartData('monetary-m3-chart', 'https://data.ssb.no/api/v0/dataset/172793.json?lang=en', 'Monetary Aggregate M3'),
            loadChartData('new-dwellings-price-chart', 'https://data.ssb.no/api/v0/dataset/25139.json?lang=en', 'New Dwellings Price'),
            loadChartData('business-tendency-chart', 'https://data.ssb.no/api/v0/dataset/166317.json?lang=en', 'Business Tendency Survey')
        ];
        
        // Wait for all charts to load
        await Promise.allSettled(chartPromises);
        
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

// Show skeleton loading for all charts
function showSkeletonLoading() {
    const skeletonIds = [
        'cpi-skeleton', 'unemployment-skeleton', 'house-prices-skeleton', 'ppi-skeleton',
        'wage-skeleton', 'oil-fund-skeleton', 'exchange-skeleton', 'interest-rate-skeleton',
        'govt-debt-skeleton', 'gdp-growth-skeleton', 'trade-balance-skeleton', 'bankruptcies-skeleton',
        'population-growth-skeleton', 'construction-costs-skeleton',
        'industrial-production-skeleton', 'retail-sales-skeleton', 'export-volume-skeleton', 'import-volume-skeleton',
        'eur-exchange-skeleton', 'employment-rate-skeleton', 'business-confidence-skeleton', 'consumer-confidence-skeleton',
        'housing-starts-skeleton', 'oil-price-skeleton',
        'monetary-aggregates-skeleton', 'job-vacancies-skeleton', 'household-consumption-skeleton', 'producer-prices-skeleton',
        'construction-production-skeleton', 'credit-indicator-skeleton', 'energy-consumption-skeleton', 'government-revenue-skeleton',
        'international-accounts-skeleton',
        'labour-cost-index-skeleton', 'rd-expenditure-skeleton', 'salmon-export-skeleton', 'oil-gas-investment-skeleton',
        'immigration-rate-skeleton', 'household-income-skeleton', 'life-expectancy-skeleton', 'crime-rate-skeleton',
        'education-level-skeleton', 'holiday-property-sales-skeleton', 'greenhouse-gas-skeleton', 'economic-forecasts-skeleton',
        'new-dwellings-price-skeleton', 'lifestyle-habits-skeleton', 'long-term-illness-skeleton',
        'population-growth-skeleton', 'births-deaths-skeleton', 'cpi-ate-skeleton', 'salmon-export-volume-skeleton',
        'basic-salary-skeleton', 'export-country-skeleton', 'import-country-skeleton', 'export-commodity-skeleton',
        'import-commodity-skeleton', 'construction-cost-wood-skeleton', 'construction-cost-multi-skeleton', 'wholesale-retail-skeleton',
        'household-types-skeleton', 'population-age-skeleton', 'cpi-coicop-skeleton', 'cpi-subgroups-skeleton',
        'cpi-items-skeleton', 'cpi-delivery-skeleton', 'household-income-size-skeleton', 'cohabiting-arrangements-skeleton',
        'utility-floor-space-skeleton', 'credit-indicator-c2-skeleton', 'job-vacancies-new-skeleton', 'oil-gas-turnover-skeleton',
        'trade-volume-price-skeleton', 'producer-price-industry-skeleton', 'deaths-age-skeleton', 'construction-production-skeleton',
        'bankruptcies-total-skeleton', 'energy-accounts-skeleton', 'monetary-m3-skeleton', 'new-dwellings-price-skeleton',
        'business-tendency-skeleton'
    ];
    
    skeletonIds.forEach(id => {
        const skeleton = document.getElementById(id);
        if (skeleton) {
            skeleton.style.display = 'block';
        }
    });
}

// Hide skeleton loading
function hideSkeletonLoading() {
    const skeletonIds = [
        'cpi-skeleton', 'unemployment-skeleton', 'house-prices-skeleton', 'ppi-skeleton',
        'wage-skeleton', 'oil-fund-skeleton', 'exchange-skeleton', 'interest-rate-skeleton',
        'govt-debt-skeleton', 'gdp-growth-skeleton', 'trade-balance-skeleton', 'bankruptcies-skeleton',
        'population-growth-skeleton', 'construction-costs-skeleton',
        'industrial-production-skeleton', 'retail-sales-skeleton', 'export-volume-skeleton', 'import-volume-skeleton',
        'eur-exchange-skeleton', 'employment-rate-skeleton', 'business-confidence-skeleton', 'consumer-confidence-skeleton',
        'housing-starts-skeleton', 'oil-price-skeleton',
        'monetary-aggregates-skeleton', 'job-vacancies-skeleton', 'household-consumption-skeleton', 'producer-prices-skeleton',
        'construction-production-skeleton', 'credit-indicator-skeleton', 'energy-consumption-skeleton', 'government-revenue-skeleton',
        'international-accounts-skeleton',
        'labour-cost-index-skeleton', 'rd-expenditure-skeleton', 'salmon-export-skeleton', 'oil-gas-investment-skeleton',
        'immigration-rate-skeleton', 'household-income-skeleton', 'life-expectancy-skeleton', 'crime-rate-skeleton',
        'education-level-skeleton', 'holiday-property-sales-skeleton', 'greenhouse-gas-skeleton', 'economic-forecasts-skeleton',
        'new-dwellings-price-skeleton', 'lifestyle-habits-skeleton', 'long-term-illness-skeleton',
        'population-growth-skeleton', 'births-deaths-skeleton', 'cpi-ate-skeleton', 'salmon-export-volume-skeleton',
        'basic-salary-skeleton', 'export-country-skeleton', 'import-country-skeleton', 'export-commodity-skeleton',
        'import-commodity-skeleton', 'construction-cost-wood-skeleton', 'construction-cost-multi-skeleton', 'wholesale-retail-skeleton',
        'household-types-skeleton', 'population-age-skeleton', 'cpi-coicop-skeleton', 'cpi-subgroups-skeleton',
        'cpi-items-skeleton', 'cpi-delivery-skeleton', 'household-income-size-skeleton', 'cohabiting-arrangements-skeleton',
        'utility-floor-space-skeleton', 'credit-indicator-c2-skeleton', 'job-vacancies-new-skeleton', 'oil-gas-turnover-skeleton',
        'trade-volume-price-skeleton', 'producer-price-industry-skeleton', 'deaths-age-skeleton', 'construction-production-skeleton',
        'bankruptcies-total-skeleton', 'energy-accounts-skeleton', 'monetary-m3-skeleton', 'new-dwellings-price-skeleton',
        'business-tendency-skeleton'
    ];
    
    skeletonIds.forEach(id => {
        const skeleton = document.getElementById(id);
        if (skeleton) {
            skeleton.style.opacity = '0';
            setTimeout(() => {
                skeleton.style.display = 'none';
            }, 300);
        }
    });
}

// Aggregate data by month for bar charts
function aggregateDataByMonth(data) {
    const monthlyData = {};
    
    data.forEach(item => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                sum: 0,
                count: 0,
                date: new Date(date.getFullYear(), date.getMonth(), 1)
            };
        }
        
        monthlyData[monthKey].sum += item.value;
        monthlyData[monthKey].count += 1;
    });
    
    // Convert to array and sort by date
    const result = Object.values(monthlyData).map(item => ({
        date: item.date,
        value: item.sum / item.count // Average for the month
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // For quarterly data (like GDP Growth), we might want to keep quarterly structure
    // Check if we have quarterly data by looking at the original data frequency
    const originalDates = data.map(item => new Date(item.date));
    const isQuarterly = originalDates.some(date => 
        date.getMonth() % 3 === 0 && date.getDate() === 1
    );
    
    if (isQuarterly) {
        // For quarterly data, return quarterly averages instead of monthly
        const quarterlyData = {};
        data.forEach(item => {
            const date = new Date(item.date);
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            const quarterKey = `${date.getFullYear()}-Q${quarter}`;
            
            if (!quarterlyData[quarterKey]) {
                quarterlyData[quarterKey] = {
                    sum: 0,
                    count: 0,
                    date: new Date(date.getFullYear(), (quarter - 1) * 3, 1)
                };
            }
            
            quarterlyData[quarterKey].sum += item.value;
            quarterlyData[quarterKey].count += 1;
        });
        
        return Object.values(quarterlyData).map(item => ({
            date: item.date,
            value: item.sum / item.count
        })).sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    return result;
}

// Load and render chart data
async function loadChartData(canvasId, apiUrl, chartTitle, chartType = 'line') {
    try {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas with id '${canvasId}' not found`);
            return;
        }

        // Fetch data from API
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Parse data based on source
        let parsedData;
        if (apiUrl.includes('ssb.no')) {
            parsedData = parseSSBData(data, chartTitle);
        } else if (apiUrl.includes('norges-bank.no')) {
            if (chartTitle === 'Exchange Rate') {
                parsedData = parseExchangeRateData(data);
            } else if (chartTitle === 'Interest Rate') {
                parsedData = parseInterestRateData(data);
            } else if (chartTitle === 'Government Debt') {
                parsedData = parseGovernmentDebtData(data);
            } else {
                throw new Error(`Unknown Norges Bank chart type: ${chartTitle}`);
            }
        } else if (apiUrl.includes('oil-fund.json')) {
            parsedData = parseOilFundData(data);
        } else {
            throw new Error(`Unknown data source: ${apiUrl}`);
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

        // Aggregate by month for bar charts
        const finalData = chartType === 'bar' ? aggregateDataByMonth(filteredData) : filteredData;

        // Render the chart
        renderChart(canvas, finalData, chartTitle, chartType);

    } catch (error) {
        console.error(`Error loading data for ${canvasId} (${chartTitle}):`, error);
        showError(`Failed to load ${chartTitle} data: ${error.message}`, canvas);
    }
}

// Parse SSB PXWeb JSON format into usable data
function parseSSBData(ssbData, chartTitle) {
    try {
        const dataset = ssbData.dataset;
        const dimension = dataset.dimension;
        const value = dataset.value; // This is a list, not an object

        // Find time dimension
        const timeDimension = dimension.Tid;
        if (!timeDimension) {
            throw new Error('Time dimension not found in SSB data');
        }

        // Get time labels and indices
        const timeLabels = timeDimension.category.label;
        const timeIndex = timeDimension.category.index;

        // Find the main data series
        let targetSeriesIndex = 0;
        let numSeries = 1;
        
        if (dimension.ContentsCode) {
            const contentLabels = dimension.ContentsCode.category.label;
            const contentIndices = dimension.ContentsCode.category.index;
            
            // Find the right content code based on the data type
            let found = false;
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
                    label.includes('Construction cost') ||
                    label.includes('Industrial production') ||
                    label.includes('Retail sales') ||
                    label.includes('Export') ||
                    label.includes('Import') ||
                    label.includes('Employment') ||
                    label.includes('Business confidence') ||
                    label.includes('Consumer confidence') ||
                    label.includes('Housing starts') ||
                    label.includes('Oil price') ||
                    label.includes('Monetary aggregates') ||
                    label.includes('Job vacancies') ||
                    label.includes('Household consumption') ||
                    label.includes('Credit indicator') ||
                    label.includes('Energy consumption') ||
                    label.includes('Government revenue') ||
                    label.includes('International accounts') ||
                    label.includes('Labour cost') ||
                    label.includes('R&D') ||
                    label.includes('Salmon export') ||
                    label.includes('Oil & gas investment') ||
                    label.includes('Immigration') ||
                    label.includes('Household income') ||
                    label.includes('Life expectancy') ||
                    label.includes('Crime rate') ||
                    label.includes('Education level') ||
                    label.includes('Holiday property') ||
                    label.includes('Greenhouse gas') ||
                    label.includes('Economic forecasts') ||
                    label.includes('New dwellings') ||
                    label.includes('Lifestyle habits') ||
                    label.includes('Long-term illness') ||
                    label.includes('Births and deaths') ||
                    label.includes('CPI-ATE') ||
                    label.includes('Basic salary') ||
                    label.includes('Export by country') ||
                    label.includes('Import by country') ||
                    label.includes('Export by commodity') ||
                    label.includes('Import by commodity') ||
                    label.includes('Construction cost wood') ||
                    label.includes('Construction cost multi') ||
                    label.includes('Wholesale retail') ||
                    label.includes('Household types') ||
                    label.includes('Population by age') ||
                    label.includes('CPI Coicop') ||
                    label.includes('CPI Sub-groups') ||
                    label.includes('CPI Items') ||
                    label.includes('CPI Delivery') ||
                    label.includes('Household income size') ||
                    label.includes('Cohabiting arrangements') ||
                    label.includes('Utility floor space') ||
                    label.includes('Oil gas turnover') ||
                    label.includes('Trade volume price') ||
                    label.includes('Producer price industry') ||
                    label.includes('Deaths by age') ||
                    label.includes('Energy accounts') ||
                    label.includes('Monetary M3') ||
                    label.includes('Business tendency')) {
                    targetSeriesIndex = contentIndices[key];
                    found = true;
                    break;
                }
            }
            
            // If no specific content code found, use the first one
            if (!found && Object.keys(contentIndices).length > 0) {
                const firstKey = Object.keys(contentIndices)[0];
                targetSeriesIndex = contentIndices[firstKey];
                console.log(`Using first content code for ${chartTitle}: ${contentLabels[firstKey]}`);
            }
            
            numSeries = Object.keys(contentIndices).length;
        }

        // Parse data points
        const dataPoints = [];
        
        // Iterate through the time periods
        Object.keys(timeLabels).forEach(timeKey => {
            const timeLabel = timeLabels[timeKey];
            const timeIndexValue = timeIndex[timeKey];
            
            // Parse the time label (format: "2023M01" for monthly data)
            const date = parseTimeLabel(timeLabel);
            
            if (date) {
                // Calculate the correct index in the value array
                // The array is organized by: [series1_time1, series2_time1, series3_time1, series1_time2, series2_time2, ...]
                const valueIndex = timeIndexValue * numSeries + targetSeriesIndex;
                
                if (valueIndex < value.length) {
                    const dataValue = value[valueIndex];
                    
                    // Skip null, undefined, or zero values
                    if (dataValue !== undefined && dataValue !== null && dataValue !== 0) {
                        dataPoints.push({
                            date: date,
                            value: parseFloat(dataValue)
                        });
                    }
                }
            }
        });

        // Sort by date
        dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        return dataPoints;

    } catch (error) {
        console.error('Error parsing SSB data:', error);
        throw new Error('Invalid SSB data format');
    }
}

// Parse SSB time labels (e.g., "2023M01" -> Date object)
function parseTimeLabel(timeLabel) {
    try {
        // Handle monthly format: "2023M01"
        if (timeLabel.includes('M')) {
            const [year, month] = timeLabel.split('M');
            return new Date(parseInt(year), parseInt(month) - 1, 1);
        }
        
        // Handle quarterly format: "2023K1", "2023K2", etc.
        if (timeLabel.includes('K')) {
            const [year, quarter] = timeLabel.split('K');
            const quarterNum = parseInt(quarter);
            const month = (quarterNum - 1) * 3; // K1=Jan, K2=Apr, K3=Jul, K4=Oct
            return new Date(parseInt(year), month, 1);
        }
        
        // Handle yearly format: "2023"
        if (/^\d{4}$/.test(timeLabel)) {
            return new Date(parseInt(timeLabel), 0, 1);
        }
        
        // Handle other formats as needed
        return new Date(timeLabel);
        
    } catch (error) {
        console.error('Error parsing time label:', timeLabel, error);
        return null;
    }
}

// Render Chart.js chart with political party colored lines
function renderChart(canvas, data, title, chartType = 'line') {
    // Clear any existing chart
    if (canvas.chart) {
        canvas.chart.destroy();
    }

    // Create datasets for each political period
    const datasets = createPoliticalDatasets(data, title, chartType);

    // Prepare data for Chart.js
    const chartData = {
        labels: data.map(item => item.date),
        datasets: datasets
    };

    // Create the chart
    canvas.chart = new Chart(canvas, {
        type: chartType,
        data: chartData,
        options: CHART_CONFIG
    });

    // Store chart instance for filtering
    if (!window.chartInstances) {
        window.chartInstances = {};
    }
    window.chartInstances[canvas.id] = canvas.chart;

    // Add static tooltip functionality
    const tooltipId = canvas.id.replace('-chart', '-tooltip');
    const tooltipElement = document.getElementById(tooltipId);
    
    if (tooltipElement) {
        // Add mouse move event listener to canvas
        canvas.addEventListener('mousemove', function(event) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            const elements = canvas.chart.getElementsAtEventForMode(
                { x: x, y: y },
                'index',
                { intersect: false }
            );
            
            if (elements.length > 0) {
                const element = elements[0];
                const context = {
                    parsed: {
                        x: canvas.chart.data.labels[element.index],
                        y: canvas.chart.data.datasets[element.datasetIndex].data[element.index]
                    },
                    dataset: {
                        label: canvas.chart.data.datasets[element.datasetIndex].label
                    }
                };
                updateStaticTooltip(canvas.chart, tooltipId, context);
            } else {
                hideStaticTooltip(tooltipId);
            }
        });
        
        // Hide tooltip when mouse leaves canvas
        canvas.addEventListener('mouseleave', function() {
            hideStaticTooltip(tooltipId);
        });
    }
}

// Create modern datasets with political period colors
function createPoliticalDatasets(data, title, chartType = 'line') {
    const dataset = {
        label: title,
        data: data.map(item => item.value),
        borderColor: '#1a1a1a',
        backgroundColor: chartType === 'bar' ? data.map(item => {
            const itemDate = new Date(item.date);
            for (const period of POLITICAL_PERIODS) {
                const startDate = new Date(period.start);
                const endDate = new Date(period.end);
                if (itemDate >= startDate && itemDate <= endDate) {
                    return period.color;
                }
            }
            return '#1a1a1a';
        }) : 'rgba(26, 26, 26, 0.05)',
        borderWidth: chartType === 'bar' ? 0 : 1.2,
        fill: chartType === 'bar' ? true : false,
        tension: 0.2,
        segment: chartType === 'line' ? {
            borderColor: ctx => {
                const dataIndex = ctx.p1DataIndex;
                const itemDate = new Date(data[dataIndex].date);
                
                for (const period of POLITICAL_PERIODS) {
                    const startDate = new Date(period.start);
                    const endDate = new Date(period.end);
                    
                    if (itemDate >= startDate && itemDate <= endDate) {
                        return period.color;
                    }
                }
                
                return '#1a1a1a';
            }
        } : undefined
    };
    
    return [dataset];
}

// Show error state
function showError(message, canvas = null) {
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#c33';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Error loading data', canvas.width / 2, canvas.height / 2 - 8);
        ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 8);
    } else {
        // Show global error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        document.querySelector('main').prepend(errorDiv);
    }
}

// Load and render oil fund data
async function loadOilFundData(canvasId, dataUrl, chartTitle) {
    try {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas with id '${canvasId}' not found`);
            return;
        }



        // Fetch data from local JSON file
        const response = await fetch(dataUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Parse oil fund data
        const parsedData = parseOilFundData(data);
        
        // Filter data from 2000 onwards
        const filteredData = parsedData.filter(item => {
            const year = new Date(item.date).getFullYear();
            return year >= 2000;
        });

        if (filteredData.length === 0) {
            throw new Error('No data available for the specified period');
        }

        // Render the chart
        renderChart(canvas, filteredData, chartTitle);

    } catch (error) {
        console.error(`Error loading data for ${canvasId}:`, error);
        showError(`Failed to load ${chartTitle} data. Please try again later.`, canvas);
    }
}

// Parse oil fund JSON data into usable format
function parseOilFundData(oilFundData) {
    try {
        const dataPoints = [];
        
        oilFundData.data.forEach(item => {
            // Create date for January 1st of each year
            const date = new Date(item.year, 0, 1);
            
            dataPoints.push({
                date: date,
                value: item.total // Use total value in billions NOK
            });
        });

        // Sort by date
        dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        return dataPoints;

    } catch (error) {
        console.error('Error parsing oil fund data:', error);
        throw new Error('Invalid oil fund data format');
    }
}

// Load and render exchange rate data
async function loadExchangeRateData(canvasId, apiUrl, chartTitle) {
    try {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas with id '${canvasId}' not found`);
            return;
        }

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const parsedData = parseExchangeRateData(data);
        
        const filteredData = parsedData.filter(item => {
            const year = new Date(item.date).getFullYear();
            return year >= 2000;
        });

        if (filteredData.length === 0) {
            throw new Error('No data available for the specified period');
        }

        renderChart(canvas, filteredData, chartTitle);

    } catch (error) {
        console.error(`Error loading data for ${canvasId}:`, error);
        showError(`Failed to load ${chartTitle} data. Please try again later.`, canvas);
    }
}

// Load and render interest rate data
async function loadInterestRateData(canvasId, apiUrl, chartTitle) {
    try {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas with id '${canvasId}' not found`);
            return;
        }

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const parsedData = parseInterestRateData(data);
        
        const filteredData = parsedData.filter(item => {
            const year = new Date(item.date).getFullYear();
            return year >= 2000;
        });

        if (filteredData.length === 0) {
            throw new Error('No data available for the specified period');
        }

        renderChart(canvas, filteredData, chartTitle);

    } catch (error) {
        console.error(`Error loading data for ${canvasId}:`, error);
        showError(`Failed to load ${chartTitle} data. Please try again later.`, canvas);
    }
}

// Load and render government debt data
async function loadGovernmentDebtData(canvasId, apiUrl, chartTitle) {
    try {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas with id '${canvasId}' not found`);
            return;
        }

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const parsedData = parseGovernmentDebtData(data);
        
        const filteredData = parsedData.filter(item => {
            const year = new Date(item.date).getFullYear();
            return year >= 2000;
        });

        if (filteredData.length === 0) {
            throw new Error('No data available for the specified period');
        }

        renderChart(canvas, filteredData, chartTitle);

    } catch (error) {
        console.error(`Error loading data for ${canvasId}:`, error);
        showError(`Failed to load ${chartTitle} data. Please try again later.`, canvas);
    }
}

// Parse Norges Bank exchange rate data
function parseExchangeRateData(data) {
    try {
        const dataPoints = [];
        const series = data.data.dataSets[0].series;
        
        // Get the time dimension from the structure
        const timeDimension = data.data.structure.dimensions.observation[0];
        const timeValues = timeDimension.values;
        
        // Parse USD/NOK (series 0:0:0:0)
        if (series['0:0:0:0'] && series['0:0:0:0'].observations) {
            Object.keys(series['0:0:0:0'].observations).forEach((key, index) => {
                const value = series['0:0:0:0'].observations[key][0];
                if (value && value.value !== undefined) {
                    // Use the actual time value from the structure
                    const timeValue = timeValues[index];
                    const date = new Date(timeValue.id);
                    
                    if (!isNaN(date.getTime())) {
                        dataPoints.push({
                            date: date,
                            value: parseFloat(value.value)
                        });
                    }
                }
            });
        }

        dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
        return dataPoints;

    } catch (error) {
        console.error('Error parsing exchange rate data:', error);
        // Fallback to simpler parsing if structure is different
        try {
            const dataPoints = [];
            const series = data.data.dataSets[0].series;
            
            Object.keys(series).forEach(seriesKey => {
                const seriesData = series[seriesKey];
                if (seriesData.observations) {
                    Object.keys(seriesData.observations).forEach(obsKey => {
                        const obs = seriesData.observations[obsKey][0];
                        if (obs && obs.value !== undefined) {
                            const date = new Date(obsKey);
                            if (!isNaN(date.getTime())) {
                                dataPoints.push({
                                    date: date,
                                    value: parseFloat(obs.value)
                                });
                            }
                        }
                    });
                }
            });
            
            dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
            return dataPoints;
        } catch (fallbackError) {
            throw new Error('Invalid exchange rate data format');
        }
    }
}

// Parse Norges Bank interest rate data
function parseInterestRateData(data) {
    try {
        const dataPoints = [];
        const series = data.data.dataSets[0].series;
        
        // Get the time dimension from the structure
        const timeDimension = data.data.structure.dimensions.observation[0];
        const timeValues = timeDimension.values;
        
        // Parse Key Policy Rate (series 0:0:0:0)
        if (series['0:0:0:0'] && series['0:0:0:0'].observations) {
            Object.keys(series['0:0:0:0'].observations).forEach((key, index) => {
                const value = series['0:0:0:0'].observations[key][0];
                if (value && value.value !== undefined) {
                    // Use the actual time value from the structure
                    const timeValue = timeValues[index];
                    const date = new Date(timeValue.id);
                    
                    if (!isNaN(date.getTime())) {
                        dataPoints.push({
                            date: date,
                            value: parseFloat(value.value)
                        });
                    }
                }
            });
        }

        dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
        return dataPoints;

    } catch (error) {
        console.error('Error parsing interest rate data:', error);
        // Fallback to simpler parsing if structure is different
        try {
            const dataPoints = [];
            const series = data.data.dataSets[0].series;
            
            Object.keys(series).forEach(seriesKey => {
                const seriesData = series[seriesKey];
                if (seriesData.observations) {
                    Object.keys(seriesData.observations).forEach(obsKey => {
                        const obs = seriesData.observations[obsKey][0];
                        if (obs && obs.value !== undefined) {
                            const date = new Date(obsKey);
                            if (!isNaN(date.getTime())) {
                                dataPoints.push({
                                    date: date,
                                    value: parseFloat(obs.value)
                                });
                            }
                        }
                    });
                }
            });
            
            dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
            return dataPoints;
        } catch (fallbackError) {
            throw new Error('Invalid interest rate data format');
        }
    }
}

// Parse Norges Bank government debt data
function parseGovernmentDebtData(data) {
    try {
        const dataPoints = [];
        const series = data.data.dataSets[0].series;
        
        // Get the time dimension from the structure
        const timeDimension = data.data.structure.dimensions.observation[0];
        const timeValues = timeDimension.values;
        
        // Find the series with the most observations (likely the main government debt series)
        let bestSeries = null;
        let maxObservations = 0;
        
        Object.keys(series).forEach(seriesKey => {
            const seriesData = series[seriesKey];
            if (seriesData.observations) {
                const observationCount = Object.keys(seriesData.observations).length;
                if (observationCount > maxObservations) {
                    maxObservations = observationCount;
                    bestSeries = seriesKey;
                }
            }
        });
        
        if (bestSeries && series[bestSeries].observations) {
            Object.keys(series[bestSeries].observations).forEach((key, index) => {
                const value = series[bestSeries].observations[key][0];
                if (value && value.value !== undefined) {
                    // Use the actual time value from the structure
                    const timeValue = timeValues[index];
                    const date = new Date(timeValue.id);
                    
                    if (!isNaN(date.getTime())) {
                        dataPoints.push({
                            date: date,
                            value: parseFloat(value.value)
                        });
                    }
                }
            });
        }

        dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
        return dataPoints;

    } catch (error) {
        console.error('Error parsing government debt data:', error);
        // Fallback to simpler parsing if structure is different
        try {
            const dataPoints = [];
            const series = data.data.dataSets[0].series;
            
            Object.keys(series).forEach(seriesKey => {
                const seriesData = series[seriesKey];
                if (seriesData.observations) {
                    Object.keys(seriesData.observations).forEach(obsKey => {
                        const obs = seriesData.observations[obsKey][0];
                        if (obs && obs.value !== undefined) {
                            const date = new Date(obsKey);
                            if (!isNaN(date.getTime())) {
                                dataPoints.push({
                                    date: date,
                                    value: parseFloat(obs.value)
                                });
                            }
                        }
                    });
                }
            });
            
            dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
            return dataPoints;
        } catch (fallbackError) {
            throw new Error('Invalid government debt data format');
        }
    }
}

// Utility function to add more charts easily
function addChart(canvasId, apiUrl, title) {
    return loadChartData(canvasId, apiUrl, title);
}

// Export functions for potential external use
window.NorwayDashboard = {
    addChart,
    POLITICAL_PERIODS,
    parseSSBData
};

// Diagnostic script for Riksdata data sources
async function runDiagnostics() {
    console.log('🔍 Starting Riksdata Diagnostics...\n');

    const dataSources = [
        { name: 'CPI', url: 'https://data.ssb.no/api/v0/dataset/1086.json?lang=en' },
        { name: 'Unemployment', url: 'https://data.ssb.no/api/v0/dataset/1054.json?lang=en' },
        { name: 'House Prices', url: 'https://data.ssb.no/api/v0/dataset/1060.json?lang=en' },
        { name: 'Producer Price Index', url: 'https://data.ssb.no/api/v0/dataset/26426.json?lang=en' },
        { name: 'Wage Index', url: 'https://data.ssb.no/api/v0/dataset/1124.json?lang=en' },
        { name: 'GDP Growth', url: 'https://data.ssb.no/api/v0/dataset/59012.json?lang=en' },
        { name: 'Trade Balance', url: 'https://data.ssb.no/api/v0/dataset/58962.json?lang=en' },
        { name: 'Bankruptcies', url: 'https://data.ssb.no/api/v0/dataset/95265.json?lang=en' },
        { name: 'Population Growth', url: 'https://data.ssb.no/api/v0/dataset/49626.json?lang=en' },
        { name: 'Construction Costs', url: 'https://data.ssb.no/api/v0/dataset/26944.json?lang=en' },
        { name: 'Industrial Production', url: 'https://data.ssb.no/api/v0/dataset/27002.json?lang=en' },
        { name: 'Retail Sales', url: 'https://data.ssb.no/api/v0/dataset/1064.json?lang=en' },
        { name: 'Export Volume', url: 'https://data.ssb.no/api/v0/dataset/179421.json?lang=en' },
        { name: 'Import Volume', url: 'https://data.ssb.no/api/v0/dataset/179421.json?lang=en' },
        { name: 'Employment Rate', url: 'https://data.ssb.no/api/v0/dataset/1054.json?lang=en' },
        { name: 'Business Confidence', url: 'https://data.ssb.no/api/v0/dataset/166316.json?lang=en' },
        { name: 'Consumer Confidence', url: 'https://data.ssb.no/api/v0/dataset/166330.json?lang=en' },
        { name: 'Housing Starts', url: 'https://data.ssb.no/api/v0/dataset/95146.json?lang=en' },
        { name: 'Oil Price', url: 'https://data.ssb.no/api/v0/dataset/26426.json?lang=en' },
        { name: 'Monetary Aggregates', url: 'https://data.ssb.no/api/v0/dataset/172769.json?lang=en' },
        { name: 'Job Vacancies', url: 'https://data.ssb.no/api/v0/dataset/166328.json?lang=en' },
        { name: 'Household Consumption', url: 'https://data.ssb.no/api/v0/dataset/166330.json?lang=en' },
        { name: 'Producer Prices', url: 'https://data.ssb.no/api/v0/dataset/26426.json?lang=en' },
        { name: 'Construction Production', url: 'https://data.ssb.no/api/v0/dataset/924808.json?lang=en' },
        { name: 'Credit Indicator', url: 'https://data.ssb.no/api/v0/dataset/166326.json?lang=en' },
        { name: 'Energy Consumption', url: 'https://data.ssb.no/api/v0/dataset/928196.json?lang=en' },
        { name: 'Government Revenue', url: 'https://data.ssb.no/api/v0/dataset/928194.json?lang=en' },
        { name: 'International Accounts', url: 'https://data.ssb.no/api/v0/dataset/924820.json?lang=en' },
        { name: 'Labour Cost Index', url: 'https://data.ssb.no/api/v0/dataset/760065.json?lang=en' },
        { name: 'R&D Expenditure', url: 'https://data.ssb.no/api/v0/dataset/61819.json?lang=en' },
        { name: 'Salmon Export Value', url: 'https://data.ssb.no/api/v0/dataset/1122.json?lang=en' },
        { name: 'Oil & Gas Investment', url: 'https://data.ssb.no/api/v0/dataset/166334.json?lang=en' },
        { name: 'Immigration Rate', url: 'https://data.ssb.no/api/v0/dataset/48651.json?lang=en' },
        { name: 'Household Income', url: 'https://data.ssb.no/api/v0/dataset/56900.json?lang=en' },
        { name: 'Life Expectancy', url: 'https://data.ssb.no/api/v0/dataset/102811.json?lang=en' },
        { name: 'Crime Rate', url: 'https://data.ssb.no/api/v0/dataset/97445.json?lang=en' },
        { name: 'Education Level', url: 'https://data.ssb.no/api/v0/dataset/85454.json?lang=en' },
        { name: 'Holiday Property Sales', url: 'https://data.ssb.no/api/v0/dataset/65962.json?lang=en' },
        { name: 'Greenhouse Gas Emissions', url: 'https://data.ssb.no/api/v0/dataset/832678.json?lang=en' },
        { name: 'Economic Forecasts', url: 'https://data.ssb.no/api/v0/dataset/934513.json?lang=en' },
        { name: 'New Dwellings Price', url: 'https://data.ssb.no/api/v0/dataset/26158.json?lang=en' },
        { name: 'Lifestyle Habits', url: 'https://data.ssb.no/api/v0/dataset/832683.json?lang=en' },
        { name: 'Long-term Illness', url: 'https://data.ssb.no/api/v0/dataset/832685.json?lang=en' },
        { name: 'Population Growth', url: 'https://data.ssb.no/api/v0/dataset/1104.json?lang=en' },
        { name: 'Births and Deaths', url: 'https://data.ssb.no/api/v0/dataset/1106.json?lang=en' },
        { name: 'CPI-ATE Index', url: 'https://data.ssb.no/api/v0/dataset/1118.json?lang=en' },
        { name: 'Salmon Export Volume', url: 'https://data.ssb.no/api/v0/dataset/1120.json?lang=en' },
        { name: 'Basic Salary Index', url: 'https://data.ssb.no/api/v0/dataset/1126.json?lang=en' },
        { name: 'Export by Country', url: 'https://data.ssb.no/api/v0/dataset/1130.json?lang=en' },
        { name: 'Import by Country', url: 'https://data.ssb.no/api/v0/dataset/1132.json?lang=en' },
        { name: 'Export by Commodity', url: 'https://data.ssb.no/api/v0/dataset/1134.json?lang=en' },
        { name: 'Import by Commodity', url: 'https://data.ssb.no/api/v0/dataset/1140.json?lang=en' },
        { name: 'Construction Cost Wood', url: 'https://data.ssb.no/api/v0/dataset/1056.json?lang=en' },
        { name: 'Construction Cost Multi', url: 'https://data.ssb.no/api/v0/dataset/1058.json?lang=en' },
        { name: 'Wholesale Retail Sales', url: 'https://data.ssb.no/api/v0/dataset/1064.json?lang=en' },
        { name: 'Household Types', url: 'https://data.ssb.no/api/v0/dataset/1068.json?lang=en' },
        { name: 'Population by Age', url: 'https://data.ssb.no/api/v0/dataset/1074.json?lang=en' },
        { name: 'CPI Coicop Divisions', url: 'https://data.ssb.no/api/v0/dataset/1084.json?lang=en' },
        { name: 'CPI Sub-groups', url: 'https://data.ssb.no/api/v0/dataset/1090.json?lang=en' },
        { name: 'CPI Items', url: 'https://data.ssb.no/api/v0/dataset/1096.json?lang=en' },
        { name: 'CPI Delivery Sectors', url: 'https://data.ssb.no/api/v0/dataset/1100.json?lang=en' },
        { name: 'Household Income Size', url: 'https://data.ssb.no/api/v0/dataset/56957.json?lang=en' },
        { name: 'Cohabiting Arrangements', url: 'https://data.ssb.no/api/v0/dataset/85440.json?lang=en' },
        { name: 'Utility Floor Space', url: 'https://data.ssb.no/api/v0/dataset/95177.json?lang=en' },
        { name: 'Credit Indicator C2', url: 'https://data.ssb.no/api/v0/dataset/166326.json?lang=en' },
        { name: 'Job Vacancies', url: 'https://data.ssb.no/api/v0/dataset/166328.json?lang=en' },
        { name: 'Oil Gas Turnover', url: 'https://data.ssb.no/api/v0/dataset/124322.json?lang=en' },
        { name: 'Trade Volume Price', url: 'https://data.ssb.no/api/v0/dataset/179415.json?lang=en' },
        { name: 'Producer Price Industry', url: 'https://data.ssb.no/api/v0/dataset/741023.json?lang=en' },
        { name: 'Deaths by Age', url: 'https://data.ssb.no/api/v0/dataset/567324.json?lang=en' },
        { name: 'Construction Production', url: 'https://data.ssb.no/api/v0/dataset/924808.json?lang=en' },
        { name: 'Bankruptcies Total', url: 'https://data.ssb.no/api/v0/dataset/924816.json?lang=en' },
        { name: 'Energy Accounts', url: 'https://data.ssb.no/api/v0/dataset/928196.json?lang=en' },
        { name: 'Monetary Aggregate M3', url: 'https://data.ssb.no/api/v0/dataset/172793.json?lang=en' },
        { name: 'New Dwellings Price', url: 'https://data.ssb.no/api/v0/dataset/25138.json?lang=en' },
        { name: 'Business Tendency Survey', url: 'https://data.ssb.no/api/v0/dataset/166316.json?lang=en' },
        { name: 'Exchange Rate', url: 'https://data.norges-bank.no/api/data/EXR/M.USD+EUR.NOK.SP?format=sdmx-json&startPeriod=2015-08-11&endPeriod=2025-08-01&locale=no' },
        { name: 'Interest Rate', url: 'https://data.norges-bank.no/api/data/IR/M.KPRA..?format=sdmx-json&startPeriod=2000-01-01&endPeriod=2025-08-01&locale=no' },
        { name: 'Government Debt', url: 'https://data.norges-bank.no/api/data/GOVT_KEYFIGURES/V_O+N_V+V_I+ATRI+V_IRS..B.GBON?endPeriod=2025-08-01&format=sdmx-json&locale=no&startPeriod=2000-01-01' }
    ];

    let passedTests = 0;
    let totalTests = dataSources.length;

    for (const source of dataSources) {
        try {
            console.log(`Testing ${source.name}...`);
            const response = await fetch(source.url);
            
            if (!response.ok) {
                console.log(`❌ ${source.name}: HTTP ${response.status} - ${response.statusText}`);
                continue;
            }

            const data = await response.json();
            
            if (data && (data.dataset || data.data)) {
                console.log(`✅ ${source.name}: Data structure valid`);
                passedTests++;
            } else {
                console.log(`❌ ${source.name}: Invalid data structure`);
            }
        } catch (error) {
            console.log(`❌ ${source.name}: ${error.message}`);
        }
    }

    // Test Oil Fund local data
    try {
        console.log('Testing Oil Fund local data...');
        const response = await fetch('data/oil-fund.json');
        if (response.ok) {
            const data = await response.json();
            if (data && Array.isArray(data)) {
                console.log('✅ Oil Fund: Local data valid');
                passedTests++;
            } else {
                console.log('❌ Oil Fund: Invalid local data structure');
            }
        } else {
            console.log('❌ Oil Fund: Local file not found');
        }
    } catch (error) {
        console.log(`❌ Oil Fund: ${error.message}`);
    }
    totalTests++;

    // Summary
    console.log(`\n📊 Test Results: ${passedTests}/${totalTests} data sources working`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    // Test political periods
    console.log('\n🏛️ Testing Political Periods...');
    const testDates = [
        new Date('2000-01-01'),
        new Date('2005-10-17'),
        new Date('2013-10-16'),
        new Date('2021-10-14'),
        new Date('2025-01-01')
    ];

    testDates.forEach(date => {
        const period = getPoliticalPeriod(date);
        if (period) {
            console.log(`✅ ${date.toISOString().split('T')[0]}: ${period.name}`);
        } else {
            console.log(`❌ ${date.toISOString().split('T')[0]}: No period found`);
        }
    });

    console.log(`\n🔍 Diagnostics complete!`);
}

// Run diagnostics when script is loaded
if (typeof window !== 'undefined') {
    window.runDiagnostics = runDiagnostics;
    console.log('🔍 Diagnostics script loaded. Run runDiagnostics() to test all data sources.');
}

// Chart filtering functionality
function initializeFilters() {
    const searchInput = document.getElementById('chartSearch');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const chartCards = document.querySelectorAll('.chart-card');

    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterCharts(searchTerm, getActiveSourceFilter());
    });

    // Source filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Apply filters
            const searchTerm = searchInput.value.toLowerCase();
            const sourceFilter = this.getAttribute('data-source');
            filterCharts(searchTerm, sourceFilter);
        });
    });

    function getActiveSourceFilter() {
        const activeButton = document.querySelector('.filter-btn.active');
        return activeButton ? activeButton.getAttribute('data-source') : 'all';
    }

    function filterCharts(searchTerm, sourceFilter) {
        chartCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const sourceLink = card.querySelector('.source-link').textContent.toLowerCase();
            
            let matchesSearch = true;
            let matchesSource = true;

            // Check search term
            if (searchTerm && !title.includes(searchTerm)) {
                matchesSearch = false;
            }

            // Check source filter
            if (sourceFilter !== 'all') {
                if (sourceFilter === 'ssb' && !sourceLink.includes('SSB')) {
                    matchesSource = false;
                } else if (sourceFilter === 'norges-bank' && !sourceLink.includes('Norges Bank')) {
                    matchesSource = false;
                }
            }

            // Show/hide card based on filters
            if (matchesSearch && matchesSource) {
                card.style.display = 'flex';
                card.style.opacity = '1';
            } else {
                card.style.display = 'none';
                card.style.opacity = '0';
            }
        });
    }
}

// Initialize filters when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Ensure page starts at the top on refresh
    window.scrollTo(0, 0);
    
    // Initialize filters after a short delay to ensure all elements are loaded
    setTimeout(initializeFilters, 100);
    
    // Initialize filter toggle functionality
    initializeFilterToggle();
    
    // Initialize sort toggle functionality
    initializeSortToggle();
    
    // Initialize back to top button
    initializeBackToTop();
    
    // Sort charts alphabetically by title
    sortChartsAlphabetically();
});

// Sort charts alphabetically by title
function sortChartsAlphabetically() {
    const chartGrid = document.querySelector('.chart-grid');
    if (!chartGrid) return;
    
    const chartCards = Array.from(chartGrid.querySelectorAll('.chart-card'));
    
    // Sort chart cards by their title text
    chartCards.sort((a, b) => {
        const titleA = a.querySelector('h3').textContent.toLowerCase();
        const titleB = b.querySelector('h3').textContent.toLowerCase();
        return titleA.localeCompare(titleB);
    });
    
    // Re-append sorted cards to the grid
    chartCards.forEach(card => {
        chartGrid.appendChild(card);
    });
}

// Filter toggle functionality
function initializeFilterToggle() {
    const filterToggle = document.getElementById('filterToggle');
    const filterPanel = document.getElementById('filterPanel');
    
    if (filterToggle && filterPanel) {
        filterToggle.addEventListener('click', function() {
            const isVisible = filterPanel.style.display !== 'none';
            
            if (isVisible) {
                filterPanel.style.display = 'none';
                filterToggle.classList.remove('active');
            } else {
                filterPanel.style.display = 'block';
                filterToggle.classList.add('active');
            }
        });
    }
}

// Sort toggle functionality
function initializeSortToggle() {
    const sortToggle = document.getElementById('sortToggle');
    let isAscending = true; // Start with A-Z sorting
    
    if (sortToggle) {
        sortToggle.addEventListener('click', function() {
            const chartGrid = document.querySelector('.chart-grid');
            if (!chartGrid) return;
            
            const chartCards = Array.from(chartGrid.querySelectorAll('.chart-card'));
            
            // Sort chart cards by their title text
            chartCards.sort((a, b) => {
                const titleA = a.querySelector('h3').textContent.toLowerCase();
                const titleB = b.querySelector('h3').textContent.toLowerCase();
                return isAscending ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA);
            });
            
            // Re-append sorted cards to the grid
            chartCards.forEach(card => {
                chartGrid.appendChild(card);
            });
            
            // Update button text to show CURRENT state, then toggle
            sortToggle.textContent = isAscending ? 'Z-A' : 'A-Z';
            sortToggle.classList.toggle('active');
            isAscending = !isAscending;
        });
    }
}

// Back to top functionality
function initializeBackToTop() {
    // Create back to top button
    const backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'backToTop';
    backToTopBtn.className = 'back-to-top-btn';
    backToTopBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
        </svg>
    `;
    backToTopBtn.title = 'Back to top';
    
    // Add button to body
    document.body.appendChild(backToTopBtn);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    
    // Scroll to top when clicked
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Initialize progress bar
    initializeProgressBar();
}

// Progress bar functionality
function initializeProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    
    if (progressBar) {
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset;
            const docHeight = document.body.offsetHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            progressBar.style.width = scrollPercent + '%';
        });
    }
}
