// ============================================================================
// RIKSDATA CONFIGURATION
// ============================================================================

// Norwegian Political Party Logos (Wikimedia Commons)
export const PARTY_LOGOS = {
    "Ap": {
        name: "Arbeiderpartiet",
        shortName: "Ap",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/36/Arbeidarpartiet.svg",
        color: "#E11926"
    },
    "Sp": {
        name: "Senterpartiet",
        shortName: "Sp",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Senterpartiets_logo.png",
        color: "#4CAF50"
    },
    "H": {
        name: "Høyre",
        shortName: "H",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Flag_of_H%C3%B8yre.png",
        color: "#87add7"
    },
    "KrF": {
        name: "Kristelig Folkeparti",
        shortName: "KrF",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b6/KrF_logo.jpg",
        color: "#FDED34"
    },
    "FrP": {
        name: "Fremskrittspartiet",
        shortName: "FrP",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Fremskrittspartiet_logo.svg",
        color: "#003087"
    },
    "V": {
        name: "Venstre",
        shortName: "V",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Venstres_logo.png",
        color: "#006666"
    },
    "SV": {
        name: "Sosialistisk Venstreparti",
        shortName: "SV",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Sosialistisk_Venstreparti_logo.svg",
        color: "#E32636"
    }
};

/**
 * Get party logo URL by party code
 * @param {string} partyCode - Party short code (e.g., 'Ap', 'H', 'Sp')
 * @returns {string|null} Party logo URL or null if not found
 */
export function getPartyLogo(partyCode) {
    return PARTY_LOGOS[partyCode]?.imageUrl || null;
}

/**
 * Get all party logos for a coalition
 * @param {Array<string>} parties - Array of party codes
 * @returns {Array<Object>} Array of party logo objects
 */
export function getCoalitionLogos(parties) {
    return parties.map(code => PARTY_LOGOS[code]).filter(Boolean);
}

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
        backgroundColor: "rgba(76, 175, 80, 0.7)",
        primeMinister: "Per Borten",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Statsminister_Per_Borten_-_PA-0797_4133_001.jpg",
        party: "Sp",
        coalition: ["H", "V", "KrF"]
    },
    {
        name: "Trygve Bratteli I (Ap)",
        start: "1971-03-17",
        end: "1972-10-18",
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)",
        primeMinister: "Trygve Bratteli",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Trygve_Bratteli_%285Fo30141709010076%29.jpg",
        party: "Ap",
        coalition: []
    },
    {
        name: "Lars Korvald (KrF, Sp, V)",
        start: "1972-10-18",
        end: "1973-10-16",
        color: "#FDED34", // Kristelig Folkeparti yellow
        backgroundColor: "rgba(253, 237, 52, 0.7)",
        primeMinister: "Lars Korvald",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Lars_Korvald_%284Fo30141709010050%29.jpg",
        party: "KrF",
        coalition: ["Sp", "V"]
    },
    {
        name: "Trygve Bratteli II (Ap)",
        start: "1973-10-16",
        end: "1976-01-15",
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)",
        primeMinister: "Trygve Bratteli",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Trygve_Bratteli_%285Fo30141709010076%29.jpg",
        party: "Ap",
        coalition: []
    },
    {
        name: "Odvar Nordli (Ap)",
        start: "1976-01-15",
        end: "1981-02-04",
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)",
        primeMinister: "Odvar Nordli",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/17/Odvar_Nordli_1976.jpg",
        party: "Ap",
        coalition: []
    },
    {
        name: "Gro Harlem Brundtland I (Ap)",
        start: "1981-02-04",
        end: "1981-10-14",
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)",
        primeMinister: "Gro Harlem Brundtland",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Gro_Harlem_Brundtland_ca.1974%E2%80%931979.jpg",
        party: "Ap",
        coalition: []
    },
    {
        name: "Kåre Willoch (H)",
        start: "1981-10-14",
        end: "1986-05-09",
        color: "#87add7", // Høyre light blue
        backgroundColor: "rgba(135, 173, 215, 0.7)",
        primeMinister: "Kåre Willoch",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/61/Willoch_1983_%28high_resolution%2C_cropped%29.jpg",
        party: "H",
        coalition: ["KrF", "Sp"]
    },
    {
        name: "Gro Harlem Brundtland II (Ap)",
        start: "1986-05-09",
        end: "1989-10-16",
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)",
        primeMinister: "Gro Harlem Brundtland",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Gro_Harlem_Brundtland_ca.1974%E2%80%931979.jpg",
        party: "Ap",
        coalition: []
    },
    {
        name: "Jan P. Syse (H, KrF, Sp)",
        start: "1989-10-16",
        end: "1990-11-03",
        color: "#87add7", // Høyre light blue
        backgroundColor: "rgba(135, 173, 215, 0.7)",
        primeMinister: "Jan P. Syse",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/47/Jan_P._Syse.JPG",
        party: "H",
        coalition: ["KrF", "Sp"]
    },
    {
        name: "Gro Harlem Brundtland III (Ap)",
        start: "1990-11-03",
        end: "1996-10-25",
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)",
        primeMinister: "Gro Harlem Brundtland",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Gro_Harlem_Brundtland_ca.1974%E2%80%931979.jpg",
        party: "Ap",
        coalition: []
    },
    {
        name: "Thorbjørn Jagland (Ap)",
        start: "1996-10-25",
        end: "1997-10-17",
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)",
        primeMinister: "Thorbjørn Jagland",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Thorbj%C3%B8rn_Jagland%2C_Secretary_General%2C_Council_of_Europe_%2822167149560%29_%28cropped%29.jpg",
        party: "Ap",
        coalition: []
    },
    {
        name: "Kjell Magne Bondevik I (KrF, Sp, V)",
        start: "1997-10-17",
        end: "2000-03-17",
        color: "#FDED34", // Kristelig Folkeparti yellow
        backgroundColor: "rgba(253, 237, 52, 0.7)",
        primeMinister: "Kjell Magne Bondevik",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/da/Kjell_Magne_Bondevik%2C_Norges_statsminister%2C_under_presskonferens_vid_Nordiska_radets_session_i_Stockholm.jpg",
        party: "KrF",
        coalition: ["Sp", "V"]
    },
    {
        name: "Jens Stoltenberg I (Ap)",
        start: "2000-03-17",
        end: "2001-10-19",
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)",
        primeMinister: "Jens Stoltenberg",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Jens_Stoltenberg_2020.jpg",
        party: "Ap",
        coalition: []
    },
    {
        name: "Kjell Magne Bondevik II (KrF, H, V)",
        start: "2001-10-19",
        end: "2005-10-17",
        color: "#FDED34", // Kristelig Folkeparti yellow
        backgroundColor: "rgba(253, 237, 52, 0.7)",
        primeMinister: "Kjell Magne Bondevik",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/da/Kjell_Magne_Bondevik%2C_Norges_statsminister%2C_under_presskonferens_vid_Nordiska_radets_session_i_Stockholm.jpg",
        party: "KrF",
        coalition: ["H", "V"]
    },
    {
        name: "Jens Stoltenberg II (Ap, SV, Sp)",
        start: "2005-10-17",
        end: "2013-10-16",
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)",
        primeMinister: "Jens Stoltenberg",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Jens_Stoltenberg_2020.jpg",
        party: "Ap",
        coalition: ["SV", "Sp"]
    },
    {
        name: "Erna Solberg (H, FrP; later V, KrF)",
        start: "2013-10-16",
        end: "2021-10-14",
        color: "#87add7", // Høyre light blue
        backgroundColor: "rgba(135, 173, 215, 0.7)",
        primeMinister: "Erna Solberg",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5d/31.08.2013%2C_Erna_Solberg.2.jpg",
        party: "H",
        coalition: ["FrP", "V", "KrF"]
    },
    {
        name: "Jonas Gahr Støre (Ap, Sp)",
        start: "2021-10-14",
        end: "2025-09-08", // Extended until next election
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)",
        primeMinister: "Jonas Gahr Støre",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/37/Jonas_Gahr_St%C3%B8re_%282025%29_%28cropped%29.jpg",
        party: "Ap",
        coalition: ["Sp"]
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
        // === COMPREHENSIVE SSB DATASET MAPPINGS (125 FILES) ===
        // Core Economic Indicators
        '1086': 'cpi',
        '1054': 'unemployment',
        '1060': 'house-prices',
        '1061': 'house-price-index-recent',
        '26426': 'ppi',
        '1124': 'wage',
        '49626': 'population-growth',
        
        // Construction & Housing
        '26944': 'construction-costs',
        '1058': 'construction-cost-multi',
        '1056': 'construction-cost-wood',
        '924808': 'construction-production',
        '25151': 'new-detached-house-prices-national',
        '26158': 'new-dwellings-price',
        '65962': 'holiday-property-sales',
        
        // Industrial & Production  
        '27002': 'industrial-production',
        '741023': 'producer-price-industry',
        '26953': 'production-index-industry-recent',
        
        // Trade & Export/Import
        '179421': 'export-volume',
        '34640': 'import-value-volume-sitc',
        '34642': 'export-value-volume-sitc',
        '34254': 'import-value-volume-sitc1',
        '34256': 'export-value-volume-sitc1',
        '34641': 'import-value-sitc3',
        '34643': 'export-value-sitc3',
        '179415': 'trade-volume-price-bec',
        '179417': 'trade-volume-price-product-groups',
        '179418': 'trade-volume-price-sitc2',
        '179419': 'trade-main-figures-recent',
        '1130': 'export-country',
        '1132': 'import-country',
        '1134': 'export-commodity',
        '1140': 'import-commodity',
        
        // Business & Confidence
        '166316': 'business-confidence',
        '166317': 'business-cycle-barometer-products',
        '166318': 'business-cycle-barometer',
        '924816': 'bankruptcies-total',
        
        // Monetary & Credit
        '172769': 'monetary-aggregates',
        '172793': 'monetary-m3',
        '172771': 'money-supply-m0',
        '172800': 'money-supply-m3-net-claims',
        '166326': 'credit-indicator',
        '62264': 'credit-indicator-k2-detailed',
        '166329': 'credit-indicator-k2-seasonally-adjusted',
        '166327': 'credit-indicator-k3',
        
        // Energy & Environment
        '928196': 'energy-consumption',
        '832678': 'greenhouse-gas',
        
        // Government & Public
        '928194': 'government-revenue',
        '112175': 'public-administration-expenditures',
        '49656': 'tax-returns-main-items',
        '934513': 'economic-forecasts',
        '934514': 'economic-forecasts-selected',
        '59013': 'national-accounts-recent',
        '924820': 'international-accounts',
        
        // Labor & Wages
        '760065': 'labour-cost-index',
        '1126': 'basic-salary',
        
        // Oil & Gas
        '166334': 'oil-gas-investment',
        '124341': 'oil-gas-industry-turnover',
        '124322': 'oil-gas-industry-turnover-sn2007',
        
        // Research & Development
        '61819': 'rd-expenditure',
        
        // Retail & Sales
        '1064': 'retail-sales',
        '1122': 'salmon-export',
        '1120': 'salmon-export-volume',
        
        // Population & Demographics
        '48651': 'immigration-rate',
        '96304': 'immigrants-with-immigrant-parents',
        '1074': 'population-age',
        '1104': 'population-development-quarterly',
        '1106': 'births-deaths',
        '567324': 'deaths-age',
        
        // Household & Living
        '56900': 'household-income',
        '56957': 'household-income-national',
        '166330': 'household-consumption',
        '1068': 'household-types',
        '85440': 'cohabiting-arrangements',
        '86813': 'living-arrangements-national',
        '95177': 'utility-floor-space',
        
        // Social & Health
        '97445': 'crime-rate',
        '85454': 'education-level',
        '832683': 'lifestyle-habits',
        '832685': 'long-term-illness',
        
        // === CPI DETAILED MAPPINGS ===
        '1118': 'cpi-adjusted-indices',
        '1092': 'cpi-group-level',
        '1084': 'cpi-coicop',
        '1100': 'cpi-delivery',
        '1101': 'cpi-delivery-sector-recent',
        '1090': 'cpi-subgroups',
        '1094': 'cpi-subgroup-level2',
        '1096': 'cpi-items',
        '45590': 'cpi-seasonally-adjusted',
        '130297': 'cpi-adjusted-delivery-sector',
        '130299': 'cpi-adjusted-delivery-sector-recent',
        '1087': 'cpi-total-index-recent',
        
        // === PRODUCER PRICE INDEX MAPPINGS ===
        '26430': 'producer-price-index-industries',
        '26431': 'producer-price-index-products',
        '26429': 'producer-price-index-subgroups',
        '26432': 'producer-price-index-subgroups-detailed',
        '26428': 'producer-price-index-recent',
        '26433': 'producer-price-index-totals-recent',
        
        // === FIRST HAND PRICE INDEX ===
        '82677': 'first-hand-price-index',
        '82679': 'first-hand-price-index-groups',
        '82681': 'first-hand-price-index-subgroups',
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
