// ============================================================================
// RIKSDATA CONFIGURATION
// ============================================================================

// Political party periods for chart coloring (1945 onwards) with correct Norwegian colors
export const POLITICAL_PERIODS = [
    {
        name: "Einar Gerhardsen II (Ap)",
        start: "1945-11-05",
        end: "1951-11-19",
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)"
    },
    {
        name: "Oscar Torp (Ap)",
        start: "1951-11-19",
        end: "1955-01-22",
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)"
    },
    {
        name: "Einar Gerhardsen III (Ap)",
        start: "1955-01-22",
        end: "1963-08-28",
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)"
    },
    {
        name: "John Lyng (H, Sp, V, KrF)",
        start: "1963-08-28",
        end: "1963-09-25",
        color: "#87add7", // Høyre light blue
        backgroundColor: "rgba(135, 173, 215, 0.7)"
    },
    {
        name: "Einar Gerhardsen IV (Ap)",
        start: "1963-09-25",
        end: "1965-10-12",
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)"
    },
    {
        name: "Per Borten (Sp, H, V, KrF)",
        start: "1965-10-12",
        end: "1971-03-17",
        color: "#4CAF50", // Senterpartiet green
        backgroundColor: "rgba(76, 175, 80, 0.7)"
    },
    {
        name: "Trygve Bratteli I (Ap)",
        start: "1971-03-17",
        end: "1972-10-18",
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)"
    },
    {
        name: "Lars Korvald (KrF, Sp, V)",
        start: "1972-10-18",
        end: "1973-10-16",
        color: "#FDED34", // Kristelig Folkeparti yellow
        backgroundColor: "rgba(253, 237, 52, 0.7)"
    },
    {
        name: "Trygve Bratteli II (Ap)",
        start: "1973-10-16",
        end: "1976-01-15",
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)"
    },
    {
        name: "Odvar Nordli (Ap)",
        start: "1976-01-15",
        end: "1981-02-04",
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)"
    },
    {
        name: "Gro Harlem Brundtland I (Ap)",
        start: "1981-02-04",
        end: "1981-10-14",
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)"
    },
    {
        name: "Kåre Willoch (H)",
        start: "1981-10-14",
        end: "1986-05-09",
        color: "#87add7", // Høyre light blue
        backgroundColor: "rgba(135, 173, 215, 0.7)"
    },
    {
        name: "Gro Harlem Brundtland II (Ap)",
        start: "1986-05-09",
        end: "1989-10-16",
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)"
    },
    {
        name: "Jan P. Syse (H, KrF, Sp)",
        start: "1989-10-16",
        end: "1990-11-03",
        color: "#87add7", // Høyre light blue
        backgroundColor: "rgba(135, 173, 215, 0.7)"
    },
    {
        name: "Gro Harlem Brundtland III (Ap)",
        start: "1990-11-03",
        end: "1996-10-25",
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)"
    },
    {
        name: "Thorbjørn Jagland (Ap)",
        start: "1996-10-25",
        end: "1997-10-17",
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)"
    },
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

// Chart configuration with compressed x-axis format and mobile optimization
export const CHART_CONFIG = {
    responsive: true,
    maintainAspectRatio: false, // keep, since we now control container height in CSS
    spanGaps: true,
    animation: false,           // huge win on initial load
    parsing: false,             // use if data is already numbers with x/y; skip deep parsing
    normalized: true,           // improves perf for large timeseries
    plugins: {
        tooltip: {
            enabled: false, // Disable default tooltips
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    // Wrap long labels for mobile
                    return label.length > 40 ? label.match(/.{1,40}/g) : label;
                }
            }
        },
        legend: {
            display: false
        },
        decimation: {
            enabled: true,
            algorithm: 'lttb',   // visually faithful downsampling
            samples: 600         // ~600 points per dataset is plenty for a card
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
                maxTicksLimit: window.innerWidth < 768 ? 6 : 8, // Fewer ticks on mobile
                color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#6B7280',
                font: {
                    size: window.innerWidth < 768 ? 8 : 11, // Smaller font on mobile
                    family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    weight: '600'
                },
                padding: window.innerWidth < 768 ? 5 : 10, // Less padding on mobile
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
                color: getComputedStyle(document.documentElement).getPropertyValue('--grid').trim() || 'rgba(229, 231, 235, 0.6)',
                drawBorder: false,
                lineWidth: 1,
                drawOnChartArea: true,
                drawTicks: false
            },
            ticks: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#6B7280',
                font: {
                    size: window.innerWidth < 768 ? 8 : 11, // Smaller font on mobile
                    family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    weight: '600'
                },
                padding: window.innerWidth < 768 ? 5 : 10, // Less padding on mobile
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
        mode: 'nearest', 
        intersect: false 
    },
    elements: {
        point: {
            radius: 0,
            hoverRadius: 0
        },
        line: {
            tension: 0.1,
            borderWidth: 2,
            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#3b82f6',
            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#3b82f6'
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
    NVE_BASE_URL: 'https://biapi.nve.no/magasinstatistikk',
    CACHE_BASE_PATH: './data/cached'
};

// Dataset mappings for cache files
export const DATASET_MAPPINGS = {
    ssb: {
        // Core economic indicators (these files exist)
        '1086': 'cpi',
        '1054': 'unemployment',
        '1060': 'house-prices',
        '26426': 'ppi',
        '1124': 'wage',

        // Removed: '95265': 'bankruptcies-total', // Keeping only bankruptcies-total chart
        '49626': 'population-growth',
        '26944': 'construction-costs',
        '27002': 'industrial-production',
        '1064': 'retail-sales',
        '179421': 'export-volume',
        '179422': 'import-value-volume-sitc',
        '166316': 'business-confidence',

        '172769': 'monetary-aggregates',

        '166330': 'household-consumption',
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

        '97445': 'crime-rate',
        '85454': 'education-level',
        '65962': 'holiday-property-sales',
        '832678': 'greenhouse-gas',
        '934513': 'economic-forecasts',
        '26158': 'new-dwellings-price',
        '832683': 'lifestyle-habits',
        '832685': 'long-term-illness',
        '1104': 'population-development-quarterly',
        '1106': 'births-deaths',
        '1118': 'cpi-ate',
        '1120': 'salmon-export-volume',
        '1126': 'basic-salary',
        '1130': 'export-country',
        '1132': 'import-country',
        '1134': 'export-commodity',
        '1140': 'import-commodity',
        '1056': 'construction-cost-wood',
        
        // Additional mappings for charts that exist
        '1058': 'construction-cost-multi',
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
        '924816': 'bankruptcies-total',
        '172793': 'monetary-m3',
        '08517': 'unemployed-age-annual',

        '04553': 'unemployment-duration-annual',
        '13891': 'unemployed-industry-quarterly',
        '13892': 'unemployed-industry-annual',
        '14454': 'unemployed-nav-status',
        
        // Additional mappings for charts that exist in main.js (these files exist)
        '1052': 'unemployment',
        '34640': 'import-value-volume-sitc',
        '34642': 'export-value-volume-sitc',
        '49656': 'tax-returns-main-items',
        '112175': 'public-administration-expenditures',
        '172771': 'money-supply-m0',

        '172800': 'money-supply-m3-net-claims',
        '25151': 'new-detached-house-prices-national',
        '34254': 'import-value-volume-sitc1',
        '34256': 'export-value-volume-sitc1',
        '124341': 'oil-gas-industry-turnover',
        '86813': 'living-arrangements-national',
        '45590': 'cpi-seasonally-adjusted',
        '62264': 'credit-indicator-k2-detailed',
        '82677': 'first-hand-price-index',
        '82679': 'first-hand-price-index-groups',
        '130297': 'cpi-adjusted-delivery-sector',

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

        '26430': 'producer-price-index-industries',

        '179417': 'trade-volume-price-product-groups',
        '179418': 'trade-volume-price-sitc2',
        '26431': 'producer-price-index-products',
        '166317': 'business-cycle-barometer-products',
        '166318': 'business-cycle-barometer',
        '56957': 'household-income-national',

        '124322': 'oil-gas-industry-turnover-sn2007',
        '1061': 'house-price-index-recent',
        '59013': 'national-accounts-recent',
        '26432': 'producer-price-index-subgroups-detailed',
        '1087': 'cpi-total-index-recent',
        '179419': 'trade-main-figures-recent',
        '26953': 'production-index-industry-recent',
        '26433': 'producer-price-index-totals-recent',
        '934514': 'economic-forecasts-selected',
        '1118': 'cpi-adjusted-indices',
        '1092': 'cpi-group-level',
        '1094': 'cpi-subgroup-level2',
        
        // Additional mappings for charts that exist in HTML but were missing (these files exist)
    },
    norges_bank: {
        'EXR/M.USD+EUR.NOK.SP': 'exchange-rates',
        'IR/M.KPRA.SD.': 'interest-rate',
        'GOVT_KEYFIGURES/V_O+N_V+V_I+ATRI+V_IRS..B.GBON': 'government-debt',
        // Government Debt - Key Indicators (TBIL - Treasury Bills)
        'GOVT_KEYFIGURES/N_V..B.TBIL': 'government-debt-tbil-nominal',
        'GOVT_KEYFIGURES/V_I..B.TBIL': 'government-debt-tbil-issued',
        'GOVT_KEYFIGURES/V_O..B.TBIL': 'government-debt-tbil-holdings',
        // Government Debt - Key Indicators (GBON - Government Bonds)
        'GOVT_KEYFIGURES/N_V..B.GBON': 'government-debt-gbon-nominal',
        'GOVT_KEYFIGURES/V_I..B.GBON': 'government-debt-gbon-issued',
        'GOVT_KEYFIGURES/V_O..B.GBON': 'government-debt-gbon-holdings',
        'GOVT_KEYFIGURES/ATRI..B.GBON': 'government-debt-gbon-atri',
        'GOVT_KEYFIGURES/ATRE..B.GBON': 'government-debt-gbon-atre',
        // Government Debt - Key Indicators (IRS - Interest Rate Swaps)
        'GOVT_KEYFIGURES/V_IRS..B.IRS': 'government-debt-irs-volume',
        'GOVT_KEYFIGURES/ATRI..B.IRS': 'government-debt-irs-atri',
    },
    oslo_indices: {
        'OSEAX': 'oseax',
        'OSEBX': 'osebx'
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
    NVE: 'nve',
    STATIC: 'static',
    OSLO_INDICES: 'oslo-indices'
};
