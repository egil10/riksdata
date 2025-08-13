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
                    size: 13,
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
                    size: 13,
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

// API Configuration
export const API_CONFIG = {
    SSB_BASE_URL: 'https://data.ssb.no/api/v0/dataset',
    NORGES_BANK_BASE_URL: 'https://data.norges-bank.no/api/data',
    CACHE_BASE_PATH: 'data/cached'
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
        '179422': 'import-volume',
        '166316': 'business-confidence',
        '166330': 'consumer-confidence',
        '95146': 'housing-starts',
        '172769': 'monetary-aggregates',
        '166328': 'job-vacancies',
        '166331': 'household-consumption',
        '26427': 'producer-prices',
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
        '1065': 'wholesale-retail',
        '1068': 'household-types',
        '1074': 'population-age',
        '1084': 'cpi-coicop',
        '1090': 'cpi-subgroups',
        '1096': 'cpi-items',
        '1100': 'cpi-delivery',
        '56957': 'household-income-size',
        '85440': 'cohabiting-arrangements',
        '95177': 'utility-floor-space',
        '166327': 'credit-indicator-c2',
        '166329': 'job-vacancies-new',
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
        '13891': 'unemployed-industry-quarterly',
        '13892': 'unemployed-industry-annual',
        '14454': 'unemployed-nav-status'
    },
    norges_bank: {
        'EXR/M.USD+EUR.NOK.SP': 'exchange-rates',
        'IR/M.KPRA..': 'interest-rate',
        'GOVT_KEYFIGURES/V_O+N_V+V_I+ATRI+V_IRS..B.GBON': 'government-debt'
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
