// ============================================================================
// RIKSDATA CONFIGURATION
// ============================================================================

// Political party periods for chart coloring (post-2000) with correct Norwegian colors
export const POLITICAL_PERIODS = [
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

// Chart configuration with compressed x-axis format
export const CHART_CONFIG = {
    responsive: true,
    maintainAspectRatio: false,
    spanGaps: true,
    animation: {
        duration: 750,
        easing: 'easeInOutQuart'
    },
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
                color: getComputedStyle(document.documentElement).getPropertyValue('--axis-color').trim() || '#6B7280',
                font: {
                    size: 11,
                    family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    weight: '600'
                },
                padding: 10,
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
                color: getComputedStyle(document.documentElement).getPropertyValue('--grid-color').trim() || 'rgba(229, 231, 235, 0.6)',
                drawBorder: false,
                lineWidth: 1,
                drawOnChartArea: true,
                drawTicks: false
            },
            ticks: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--axis-color').trim() || '#6B7280',
                font: {
                    size: 11,
                    family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    weight: '600'
                },
                padding: 10,
                callback: function(value) {
                    return value.toLocaleString();
                }
            },
            border: {
                display: false
            }
        }
    },
    interaction: {
        intersect: false,
        mode: 'index'
    },
    elements: {
        point: {
            radius: 0,
            hoverRadius: 0
        },
        line: {
            tension: 0.1,
            borderWidth: 2
        }
    }
};

// Chart Quality Filter Configuration
export const CHART_FILTER_CONFIG = {
    // Minimum data points required for a chart to be considered valid
    minDataPoints: 10,
    
    // Maximum percentage of null/undefined values allowed
    maxNullPercentage: 20,
    
    // Minimum time span required (in months)
    minTimeSpan: 12,
    
    nationalOnly: true,
    
    // Keywords that indicate national-level data
    nationalKeywords: [
        'hele landet', 'national', 'total', 'alt', 'i alt', 'samlet',
        'nasjonal', 'landsomfattende', 'hele landet', 'landsdekkende'
    ],
    
    // Keywords that indicate regional-level data (to exclude)
    regionalKeywords: [
        'municipal', 'counties', 'county', 'district', 'regions', 'by county', 'by region',
        'kommune', 'fylker', 'fylke', 'distrikt', 'regioner', 'etter fylke', 'etter region'
    ],
    
    // Datasets that should always be included regardless of filters
    alwaysInclude: [
        'cpi', 'unemployment', 'house-prices', 'gdp-growth', 'trade-balance',
        'interest-rate', 'exchange', 'oil-fund', 'government-debt'
    ],
    
    // Datasets that should be excluded (low quality or irrelevant)
    excludeList: [
        'test', 'lite_datasett', 'foreløpige', 'preliminary'
    ]
};

// API Configuration
export const API_CONFIG = {
    SSB_BASE_URL: 'https://data.ssb.no/api/v0/dataset',
    NORGES_BANK_BASE_URL: 'https://data.norges-bank.no/api/data',
    CACHE_BASE_PATH: './data/cached'
};

// Dataset mappings for cache files
export const DATASET_MAPPINGS = {
    ssb: {
        '1086': 'cpi',
        '1054': 'unemployment',
        '1060': 'house-prices',
        '26426': 'ppi',
        '1124': 'wage',
        '59012': 'gdp-growth',
        '58962': 'trade-balance',
        '95265': 'bankruptcies',
        '49626': 'population-growth',
        '26944': 'construction-costs',
        '27002': 'industrial-production',
        '1064': 'retail-sales',
        '179421': 'export-volume',
        '179422': 'import-value-volume-sitc',
        '166316': 'business-confidence',
        '166330': 'consumer-confidence',
        '95146': 'housing-starts',
        '172769': 'monetary-aggregates',
        '166328': 'job-vacancies',
        '166331': 'household-consumption',
        '26427': 'producer-price-index-recent',
        '924808': 'construction-production',
        '166326': 'credit-indicator',
        '928196': 'energy-consumption',
        '928194': 'government-revenue',
        '924820': 'international-accounts',
        '760065': 'labour-cost-index',
        '61819': 'rd-expenditure',
        '1122': 'salmon-export',
        '166334': 'oil-gas-investment',
        '48651': 'immigration-rate',
        '56900': 'household-income',
        '102811': 'life-expectancy',
        '97445': 'crime-rate',
        '85454': 'education-level',
        '65962': 'holiday-property-sales',
        '832678': 'greenhouse-gas',
        '934513': 'economic-forecasts',
        '26158': 'new-dwellings-price',
        '832683': 'lifestyle-habits',
        '832685': 'long-term-illness',
        '1104': 'population-growth-alt',
        '1106': 'births-deaths',
        '1118': 'cpi-ate',
        '1120': 'salmon-export-volume',
        '1126': 'basic-salary',
        '1130': 'export-country',
        '1132': 'import-country',
        '1134': 'export-commodity',
        '1140': 'import-commodity',
        '1056': 'construction-cost-wood',
        '1058': 'construction-cost-multi',
        '1065': 'retail-sales-seasonally-adjusted',
        '1068': 'household-types',
        '1074': 'population-age',
        '1084': 'cpi-coicop',
        '1090': 'cpi-subgroups',
        '1096': 'cpi-items',
        '1100': 'cpi-delivery',
        '56957': 'household-income-size',
        '85440': 'cohabiting-arrangements',
        '95177': 'utility-floor-space',
        '166327': 'credit-indicator-k3',
        '166329': 'credit-indicator-k2-seasonally-adjusted',
        '124322': 'oil-gas-turnover',
        '179415': 'trade-volume-price',
        '741023': 'producer-price-industry',
        '567324': 'deaths-age',
        '924809': 'construction-production-alt',
        '924816': 'bankruptcies-total',
        '928197': 'energy-accounts',
        '172793': 'monetary-m3',
        '25139': 'new-dwellings-price-alt',
        '166317': 'business-tendency',
        '13760': 'labor-force-monthly',
        '14483': 'labor-force-quarterly',
        '13618': 'labor-force-annual',
        '13619': 'labor-force-quarterly-break',
        '05110': 'employment-status-quarterly',
        '05111': 'employment-status-annual',
        '14077': 'education-labor-quarterly',
        '14090': 'education-labor-annual',
        '13784': 'employment-education-quarterly',
        '13785': 'employment-education-annual',
        '03777': 'labor-force-age-quarterly',
        '03780': 'labor-force-age-annual',
        '11433': 'labor-force-flows',
        '08518': 'unemployed-age-quarterly',
        '08517': 'unemployed-age-annual',
        '04552': 'unemployment-duration-quarterly',
        '04553': 'unemployment-duration-annual',
        // Additional mappings for charts that exist in main.js
        '1052': 'unemployment',
        '34640': 'import-value-volume-sitc',
        '34642': 'export-value-volume-sitc',
        '49656': 'tax-returns-main-items',
        '112175': 'public-administration-expenditures',
        '172771': 'money-supply-m0',
        '172795': 'money-supply-m3-by-sector',
        '172798': 'money-supply-by-sector',
        '172800': 'money-supply-m3-net-claims',
        '25151': 'new-detached-house-prices-national',
        '34254': 'import-value-volume-sitc1',
        '34256': 'export-value-volume-sitc1',
        '59322': 'population-by-gender-age-historical',
        '124341': 'oil-gas-industry-turnover',
        '44631': 'employed-by-residence-workplace',
        '86813': 'living-arrangements-national',
        '45590': 'cpi-seasonally-adjusted',
        '62264': 'credit-indicator-k2-detailed',
        '82677': 'first-hand-price-index',
        '82679': 'first-hand-price-index-groups',
        '130297': 'cpi-adjusted-delivery-sector',
        '215588': 'wage-indices-by-industry-sn88',
        '26952': 'production-index-by-product',
        '65195': 'population-by-gender-age-5year',
        '96304': 'immigrants-with-immigrant-parents',
        '1100': 'cpi-delivery-sector-annual',
        '82681': 'first-hand-price-index-subgroups',
        '130299': 'cpi-adjusted-delivery-sector-recent',
        '26428': 'producer-price-index-recent',
        '1101': 'cpi-delivery-sector-recent',
        '26429': 'producer-price-index-subgroups',
        '34641': 'import-value-sitc3',
        '34643': 'export-value-sitc3',
        '179415': 'trade-volume-price-bec',
        '26951': 'production-index-by-industry',
        '26430': 'producer-price-index-industries',
        '179416': 'trade-main-figures-by-country',
        '179417': 'trade-volume-price-product-groups',
        '179418': 'trade-volume-price-sitc2',
        '26431': 'producer-price-index-products',
        '166317': 'business-cycle-barometer-products',
        '166318': 'business-cycle-barometer',
        '56957': 'household-income-national',
        '1126': 'wages-by-occupation',
        '124322': 'oil-gas-industry-turnover-sn2007',
        '1061': 'house-price-index-recent',
        '59013': 'national-accounts-recent',
        '26432': 'producer-price-index-subgroups-detailed',
        '1087': 'cpi-total-index-recent',
        '179419': 'trade-main-figures-recent',
        '26953': 'production-index-industry-recent',
        '26433': 'producer-price-index-totals-recent',
        '934514': 'economic-forecasts-selected',
        '567324': 'deaths-by-week-age',
        '13891': 'unemployed-industry-quarterly',
        '13892': 'unemployed-industry-annual',
        '14454': 'unemployed-nav-status',
        '1104': 'population-development-quarterly',
        '1118': 'cpi-adjusted-indices',
        '1128': 'wage-indices-by-industry',
        '1138': 'import-by-country-monthly',
        '1062': 'house-price-index-recent',
        '1082': 'population-by-gender-age-timeline',
        '1092': 'cpi-group-level',
        '1094': 'cpi-subgroup-level2',
        '1098': 'cpi-weights-subgroup',
        '34640': 'import-value-volume-sitc',
        '34642': 'export-value-volume-sitc',
        '49656': 'tax-returns-main-items',
        '112175': 'public-administration-expenditures',
        '172771': 'money-supply-m0',
        '172795': 'money-supply-m3-by-sector',
        '172798': 'money-supply-by-sector',
        '172800': 'money-supply-m3-net-claims',
        '25151': 'new-detached-house-prices-national',
        '34254': 'import-value-volume-sitc1',
        '34256': 'export-value-volume-sitc1',
        '59322': 'population-by-gender-age-historical',
        '124341': 'oil-gas-industry-turnover',
        '44631': 'employed-by-residence-workplace',
        '86813': 'living-arrangements-national',
        '45590': 'cpi-seasonally-adjusted',
        '62264': 'credit-indicator-k2-detailed',
        '82677': 'first-hand-price-index',
        '82679': 'first-hand-price-index-groups',
        '130297': 'cpi-adjusted-delivery-sector',
        '215588': 'wage-indices-by-industry-sn88',
        '26952': 'production-index-by-product',
        '65195': 'population-by-gender-age-5year',
        '82647': 'first-hand-price-index-subgroups',
        '95134': 'cpi-delivery-sector-annual',
        '62266': 'credit-indicator-k3',
        '62495': 'bankruptcies-by-industry',
        '48670': 'immigrants-with-immigrant-parents',
        '124363': 'oil-gas-industry-turnover-sn2007',
        '317687': 'wages-by-occupation',
        '97435': 'household-income-national',
        '166316': 'business-cycle-barometer',
        '166318': 'business-cycle-barometer-products',
        '1136': 'export-by-country-monthly',
        '26433': 'producer-price-index-products',
        '179417': 'trade-volume-price-sitc2',
        '179419': 'trade-volume-price-product-groups',
        '179423': 'trade-main-figures-by-country',
        '27263': 'producer-price-index-industries',
        '29843': 'production-index-by-industry',
        '367182': 'trade-volume-price-bec',
        '367189': 'export-value-sitc3',
        '367187': 'import-value-sitc3',
        '1066': 'retail-sales-seasonally-adjusted',
        '741154': 'producer-price-index-subgroups',
        '435959': 'credit-indicator-k2-seasonally-adjusted',
        '868304': 'cpi-delivery-sector-recent',
        '868306': 'cpi-seasonally-adjusted-recent',
        '868328': 'producer-price-index-recent',
        '868330': 'cpi-adjusted-delivery-sector-recent',
        '932937': 'deaths-by-week-age',
        '934516': 'economic-forecasts-selected',
        '372129': 'producer-price-index-totals-recent',
        '372131': 'production-index-industry-recent',
        '372133': 'trade-main-figures-recent',
        '1088': 'cpi-total-index-recent',
        '741154': 'producer-price-index-subgroups-detailed',
        '372144': 'national-accounts-recent',
    },
    norges_bank: {
        'EXR/M.USD+EUR.NOK.SP': 'exchange-rates',
        'IR/M.KPRA..': 'interest-rate',
        'GOVT_KEYFIGURES/V_O+N_V+V_I+ATRI+V_IRS..B.GBON': 'government-debt',
    }
};

// Chart types configuration
export const CHART_TYPES = {
    LINE: 'line',
    BAR: 'bar',
    AREA: 'area'
};

// Data sources
export const DATA_SOURCES = {
    SSB: 'ssb',
    NORGES_BANK: 'norges-bank',
    STATIC: 'static'
};
