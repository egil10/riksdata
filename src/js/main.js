// ============================================================================
// RIKSDATA MAIN APPLICATION
// ============================================================================

console.log('Main.js module loading...');
console.log('🔧 DFO DEBUGGING ENABLED - Looking for DFO charts...');

import { loadChartData } from './charts.js';
import { showSkeletonLoading, hideSkeletonLoading, showError, debounce, withTimeout, downloadChartForCard } from './utils.js';
import { getDataById } from './registry.js';

console.log('All modules imported successfully');

/**
 * Set up ellipsis tooltips for truncated chart titles
 */
function setupEllipsisTooltips() {
    document.querySelectorAll('.chart-header h3').forEach(setEllipsisTitle);
}

/**
 * Set ellipsis title for a single element
 */
function setEllipsisTitle(el) {
    if (!el) return;
    // Wait for layout to settle (fonts, sidebar toggle, etc.)
    requestAnimationFrame(() => {
        const truncated = el.scrollWidth > el.clientWidth;
        if (truncated) {
            // Preserve any existing tooltip text if you have one
            if (!el.getAttribute('title')) el.setAttribute('title', el.textContent.trim());
        } else {
            // If not truncated, remove title to avoid redundant browser tooltips
            if (el.getAttribute('title')) el.removeAttribute('title');
        }
    });
}

// Top-level error guards
window.addEventListener('error', e => {
    console.error('Global error:', e.error || e.message, 'Stack:', e.error?.stack);
    
    // Don't show global error for Chart.js resize operations during fullscreen or zoom
    if (e.message && (
        e.message.includes('resize') || 
        e.message.includes('canvas') || 
        e.message.includes('Chart') ||
        e.message.includes('getContext') ||
        e.message.includes('appendChild') ||
        e.message.includes('removeChild') ||
        e.message.includes('DOM') ||
        e.message.includes('parentNode') ||
        e.message.includes('childNodes') ||
        e.message.includes('zoom') ||
        e.message.includes('scale') ||
        e.message.includes('transform') ||
        e.message.includes('viewport') ||
        e.message.includes('devicePixelRatio') ||
        e.message.includes('innerWidth') ||
        e.message.includes('innerHeight')
    )) {
        console.warn('Suppressing Chart.js/DOM/zoom error from global handler:', e.message);
        return;
    }
    
    // Also check the stack trace for Chart.js related errors
    if (e.error && e.error.stack && (
        e.error.stack.includes('Chart') ||
        e.error.stack.includes('resize') ||
        e.error.stack.includes('canvas') ||
        e.error.stack.includes('fullscreen') ||
        e.error.stack.includes('zoom') ||
        e.error.stack.includes('scale') ||
        e.error.stack.includes('transform') ||
        e.error.stack.includes('viewport') ||
        e.error.stack.includes('devicePixelRatio')
    )) {
        console.warn('Suppressing Chart.js/zoom error from stack trace:', e.error.stack);
        return;
    }
    
    // Hide loading screen on critical errors
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        document.body.classList.add('loaded');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
    
    // Show user-friendly error message
    showGlobalError('An unexpected error occurred. Please refresh the page.');
});

window.addEventListener('unhandledrejection', e => {
    console.error('Unhandled promise rejection:', e.reason);
    
    // Don't show global error for Chart.js related promise rejections
    if (e.reason && (
        e.reason.message && (
            e.reason.message.includes('resize') || 
            e.reason.message.includes('canvas') || 
            e.reason.message.includes('Chart') ||
            e.reason.message.includes('getContext') ||
            e.reason.message.includes('appendChild') ||
            e.reason.message.includes('removeChild') ||
            e.reason.message.includes('DOM') ||
            e.reason.message.includes('zoom') ||
            e.reason.message.includes('scale') ||
            e.reason.message.includes('transform') ||
            e.reason.message.includes('viewport') ||
            e.reason.message.includes('devicePixelRatio') ||
            e.reason.message.includes('innerWidth') ||
            e.reason.message.includes('innerHeight')
        )
    )) {
        console.warn('Suppressing Chart.js/zoom promise rejection from global handler:', e.reason);
        return;
    }
    
    // Also check the stack trace for Chart.js related errors
    if (e.reason && e.reason.stack && (
        e.reason.stack.includes('Chart') ||
        e.reason.stack.includes('resize') ||
        e.reason.stack.includes('canvas') ||
        e.reason.stack.includes('fullscreen') ||
        e.reason.stack.includes('zoom') ||
        e.reason.stack.includes('scale') ||
        e.reason.stack.includes('transform') ||
        e.reason.stack.includes('viewport') ||
        e.reason.stack.includes('devicePixelRatio')
    )) {
        console.warn('Suppressing Chart.js promise rejection from stack trace:', e.reason.stack);
        return;
    }
    
    // Hide loading screen on unhandled rejections
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        document.body.classList.add('loaded');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
    
    // Show user-friendly error message
    showGlobalError('Failed to load data. Please check your internet connection and refresh the page.');
});

/**
 * Update loading status message
 */
function updateLoadingStatus(message) {
    const statusElement = document.getElementById('loading-status');
    if (statusElement) {
        statusElement.innerHTML = message + '<span class="loading-dots">...</span>';
    }
}

/**
 * Show global error message
 */
function showGlobalError(message) {
    // Remove any existing error message
    const existingError = document.querySelector('.global-error');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'global-error';
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #f8f9fa;
        border: 2px solid #dc3545;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        font-family: Arial, sans-serif;
        color: #dc3545;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    errorDiv.innerHTML = `
        <h3 style="margin: 0 0 10px 0; color: #dc3545;">Error</h3>
        <p style="margin: 0 0 15px 0;">${message}</p>
        <button onclick="window.location.reload()" style="
            background: #dc3545;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        ">Refresh Page</button>
    `;
    document.body.appendChild(errorDiv);
}

// Global state
let currentLanguage = 'en';
let currentSourceFilter = 'all';
let initializationTimeout = null;

// Scroll to top on page load/reload
window.addEventListener('load', () => {
    window.scrollTo(0, 0);
});

// Also scroll to top on page refresh
window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
});

/**
 * Infer metadata from chart configuration
 */
function inferChartMetadata(config) {
    const { url, id, title, subtitle, sourceUrl, sourceName } = config;
    
    let inferredSubtitle = subtitle || 'Index (2015=100)';
    let inferredSourceUrl = sourceUrl;
    let inferredSourceName = sourceName;
    let inferredSource = 'ssb';
    
    // Infer from URL if not provided
    if (url.includes('data.ssb.no')) {
        const match = url.match(/\/dataset\/(\d+)/);
        if (match) {
            inferredSourceUrl = inferredSourceUrl || `https://data.ssb.no/api/v0/dataset/${match[1]}`;
            inferredSourceName = inferredSourceName || `SSB ${match[1]}`;
        }
        inferredSource = 'ssb';
    } else if (url.includes('norges-bank') || url.includes('data.norges-bank.no')) {
        inferredSourceUrl = inferredSourceUrl || 'https://www.norges-bank.no/en/topics/Statistics/open-data/';
        inferredSourceName = inferredSourceName || 'Norges Bank';
        inferredSource = 'norges-bank';
    } else if (url.includes('nve') || url.includes('biapi.nve.no')) {
        inferredSourceUrl = inferredSourceUrl || 'https://biapi.nve.no/magasinstatistikk';
        inferredSourceName = inferredSourceName || 'NVE';
        inferredSource = 'nve';
    } else if (url.includes('statnett') || url.includes('driftsdata.statnett.no')) {
        inferredSourceUrl = inferredSourceUrl || 'https://www.statnett.no/en/about-statnett/our-role-in-the-power-system/electricity-market-data/';
        inferredSourceName = inferredSourceName || 'Statnett';
        inferredSource = 'statnett';
    } else if (url.includes('stortinget') || id.includes('stortinget')) {
        inferredSourceUrl = inferredSourceUrl || 'https://data.stortinget.no/statistikk/representanter/kjonn';
        inferredSourceName = inferredSourceName || 'Stortinget';
        inferredSource = 'stortinget';
    } else if (url.includes('oslo-indices') || id.includes('oseax') || id.includes('osebx') || id.includes('obx')) {
        inferredSourceUrl = inferredSourceUrl || 'https://finance.yahoo.com/';
        inferredSourceName = inferredSourceName || 'Yahoo Finance';
        inferredSource = 'yahoo';
    } else if (url.includes('dfo/') || id.includes('dfo-')) {
        inferredSubtitle = 'NOK (milliarder)';
        inferredSourceUrl = inferredSourceUrl || 'https://www.dfo.no/';
        inferredSourceName = inferredSourceName || 'DFO';
        inferredSource = 'dfo';
    } else {
        inferredSourceUrl = inferredSourceUrl || 'https://ourworldindata.org/';
        inferredSourceName = inferredSourceName || 'Our World in Data';
        inferredSource = 'static';
    }
    
    return { 
        subtitle: inferredSubtitle, 
        sourceUrl: inferredSourceUrl, 
        sourceName: inferredSourceName,
        source: inferredSource
    };
}

/**
 * Generate chart card HTML dynamically
 */
function createChartCardHTML(config) {
    const metadata = inferChartMetadata(config);
    const { id, title } = config;
    const { subtitle, sourceUrl, sourceName, source } = metadata;
    
    return `
        <div class="chart-card" data-chart-id="${id}" data-source="${source}">
            <div class="chart-header">
                <div class="chart-header-top">
                    <h3 title="${title}">${title}</h3>
                    <div class="chart-actions" role="toolbar" aria-label="Chart actions">
                        <button class="icon-btn" data-action="copy" aria-label="Kopier data" title="Kopier data">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
                        </button>
                        <button class="icon-btn" data-action="download" aria-label="Last ned diagram" title="Last ned diagram">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17V3"></path><path d="m6 11 6 6 6-6"></path><path d="M19 21H5"></path></svg>
                        </button>
                        <button class="icon-btn" data-action="fullscreen" aria-label="Fullskjerm" title="Fullskjerm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"></path><path d="M21 8V5a2 2 0 0 0-2-2h-3"></path><path d="M3 16v3a2 2 0 0 0 2 2h3"></path><path d="M16 21h3a2 2 0 0 0 2-2v-3"></path></svg>
                        </button>
                    </div>
                </div>
                <div class="chart-subtitle-row">
                    <div class="chart-subtitle">${subtitle}</div>
                    <div class="subtitle-actions">
                        <a href="${sourceUrl}" target="_blank" class="source-link">${sourceName}</a>
                    </div>
                </div>
            </div>
            <div class="skeleton-chart" id="${id}-skeleton"></div>
            <div class="chart-container">
                <canvas id="${id}"></canvas>
                <div class="static-tooltip" id="${id}-tooltip"></div>
            </div>
        </div>
    `;
}

/**
 * Render all chart cards into the DOM
 */
function renderChartCards() {
    const chartGrid = document.querySelector('.chart-grid');
    if (!chartGrid) {
        console.error('Chart grid container not found!');
        return;
    }
    
    console.log(`📊 Rendering ${chartConfigs.length} chart cards dynamically...`);
    
    const html = chartConfigs.map(config => createChartCardHTML(config)).join('');
    chartGrid.innerHTML = html;
    
    console.log(`✅ Successfully rendered ${chartConfigs.length} chart cards`);
}

// ============================================================================
// CHART CONFIGURATIONS - ONLY WORKING CHARTS
// ============================================================================
// Metadata (subtitle, sourceUrl, sourceName) is auto-inferred from URL

const chartConfigs = [
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
// END OF CHART CONFIGURATIONS
// Total: ~120 working charts (70 SSB + 30 DFO + 26 OWID + others)
// ============================================================================

/**
 * Setup lazy loading for charts using IntersectionObserver
 */
async function setupLazyChartLoading() {
    console.log('🔧 Setting up lazy chart loading...');
    const { loadChartData } = await import('./charts.js');
    
    const observer = new IntersectionObserver((entries, obs) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            
            const card = entry.target;
            const canvas = card.querySelector('canvas');
            const chartId = card.getAttribute('data-chart-id');
            
            if (!chartId) { 
                obs.unobserve(card); 
                continue; 
            }

            // Find the chart configuration
            const config = chartConfigs.find(c => c.id === chartId);
            if (!config) {
                console.warn(`No configuration found for chart: ${chartId}`);
                obs.unobserve(card);
                continue;
            }

            // Unobserve immediately to prevent duplicate loading
            obs.unobserve(card);
            
            // Load the chart data
            const isDfoChart = chartId && chartId.startsWith('dfo-');
            console.log(`🚀 LAZY LOADING CHART: ${chartId} (${config.title}) - Type: ${config.type || 'line'}${isDfoChart ? ' (DFO CHART!)' : ''}`);
            loadChartData(chartId, config.url, config.title, config.type || 'line')
                .catch(error => {
                    console.error(`Failed to load chart ${chartId}:`, error);
                });
        }
    }, { 
        rootMargin: '800px 0px 800px 0px', // Increased to preload charts earlier
        threshold: 0 
    });

    // Observe all chart cards
    const chartCards = document.querySelectorAll('.chart-card');
    console.log(`🔍 Found ${chartCards.length} chart cards to observe`);
    
    let dfoChartCount = 0;
    chartCards.forEach((card, index) => {
        const chartId = card.getAttribute('data-chart-id');
        const isDfoChart = chartId && chartId.startsWith('dfo-');
        if (isDfoChart) dfoChartCount++;
        console.log(`📊 Chart ${index + 1}: ${chartId}${isDfoChart ? ' (DFO CHART!)' : ''}`);
        observer.observe(card);
    });
    
    console.log(`🎯 Total DFO charts found: ${dfoChartCount}`);
}

/**
 * Initialize the application
 */
export async function initializeApp() {
    try {
        console.log('Starting application initialization...');
        updateLoadingStatus('Initializing');
        
        // Set a global timeout for the entire initialization process
        initializationTimeout = setTimeout(() => {
            console.error('Application initialization timed out after 20 seconds');
            hideLoadingScreen();
            showGlobalError('Application initialization timed out. Please refresh the page.');
        }, 20000);
        
        // Show loading screen and progress bars
        const loadingScreen = document.getElementById('loading-screen');
        const loadProgressBar = document.getElementById('load-progress-bar');
        const scrollProgressBar = document.getElementById('scroll-progress-bar');
        
        console.log('Loading screen element:', loadingScreen);
        console.log('Load progress bar element:', loadProgressBar);
        console.log('Scroll progress bar element:', scrollProgressBar);
        
        // Initialize loading progress bar
        if (loadProgressBar) {
            loadProgressBar.style.width = '0%';
            loadProgressBar.classList.add('active');
        }
        
        // Render chart cards dynamically
        console.log('Rendering chart cards dynamically...');
        updateLoadingStatus('Building interface...');
        renderChartCards();
        
        // Show skeleton loading for all charts
        console.log('Showing skeleton loading...');
        updateLoadingStatus('Preparing charts...');
        showSkeletonLoading();
        
        // Show loading progress bar immediately
        if (loadProgressBar) {
            loadProgressBar.classList.add('active');
        }
        
        // Apply theme to Chart.js if available
        if (typeof Chart !== 'undefined') {
            try {
                const { applyChartJsTheme } = await import('./chart-theme.js');
                applyChartJsTheme(Chart);
                console.log('Chart.js theme applied successfully');
            } catch (error) {
                console.warn('Failed to apply Chart.js theme:', error);
            }
        }

        // Initialize lazy loading for charts
        console.log('Setting up lazy loading for charts...');
        updateLoadingStatus('Preparing lazy loading...');
        console.log('🚀 About to call setupLazyChartLoading...');
        await setupLazyChartLoading();
        console.log('✅ setupLazyChartLoading completed successfully');
        
        // Complete loading progress bar and hide it
        console.log('Setting loading progress bar to 100%');
        if (loadProgressBar) {
            loadProgressBar.style.width = '100%';
            // Hide loading progress bar after a brief moment
            setTimeout(() => {
                loadProgressBar.classList.remove('active');
            }, 500);
        }
        
        // Hide skeleton loading
        console.log('Hiding skeleton loading...');
        hideSkeletonLoading();
        
        // Clear the initialization timeout since we're done
        if (initializationTimeout) {
            clearTimeout(initializationTimeout);
            initializationTimeout = null;
        }
        
        // Hide loading screen with fade out
        console.log('Hiding loading screen...');
        hideLoadingScreen();
        console.log('Loading screen hidden');
        
        // Sort charts alphabetically by default
        sortChartsAlphabetically();
        
        // Set up ellipsis tooltips for truncated chart titles
        setupEllipsisTooltips();
        
        // Add info buttons to all charts
        addInfoButtonsToCharts();
        
        // Add source links to OWID charts
        addSourceLinksToOWIDCharts();
        
        console.log('Application initialization complete!');
        
    } catch (error) {
        console.error('Error initializing charts:', error);
        
        // Clear the initialization timeout
        if (initializationTimeout) {
            clearTimeout(initializationTimeout);
            initializationTimeout = null;
        }
        
        showError('Failed to load chart data. Please try again later.');
        
        // Hide loading progress bar even on error
        const loadProgressBar = document.getElementById('load-progress-bar');
        if (loadProgressBar) {
            loadProgressBar.classList.remove('active');
        }
        
        // Hide loading screen even if there's an error
        hideLoadingScreen();
    }
}

/**
 * Hide loading screen with proper cleanup
 */
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        // Enable scrolling after loading screen is hidden
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
    console.log('Initializing UI...');
    
    // Theme initialization removed - only using light theme
    
    // Language toggle
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', toggleLanguage);
    }

    // Theme toggle removed - only using light theme now

    // Filter toggle removed - no longer using right panel filter

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Search functionality - header search
    const headerSearchInput = document.getElementById('headerSearch');
    
    if (headerSearchInput) {
        headerSearchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // Source filters
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', handleSourceFilter);
    });

    // Sort toggle - header sort
    const headerSortToggle = document.getElementById('headerSortToggle');
    
    if (headerSortToggle) {
        headerSortToggle.addEventListener('click', toggleHeaderSort);
    }

    // Back to top button
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', scrollToTop);
    }

    // Progress bar on scroll
    window.addEventListener('scroll', updateProgressBarOnScroll);
    
    // Initialize scroll progress bar to 0% immediately
    requestAnimationFrame(() => {
        const scrollProgressBar = document.getElementById('scroll-progress-bar');
        if (scrollProgressBar) {
            scrollProgressBar.style.width = '0%';
        }
    });
    
    // Handle window resize for mobile optimization
    window.addEventListener('resize', debounce(handleWindowResize, 250));
    
    // Debug panel toggle (Ctrl+Shift+D)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            const debugPanel = document.getElementById('debug');
            if (debugPanel) {
                debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
            }
        }
    });
    
    console.log('UI initialization complete!');
}

/**
 * Toggle language between English and Norwegian
 */
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'no' : 'en';
    document.body.className = `lang-${currentLanguage}`;
    
    // Update language texts
    updateLanguageTexts();
}

// Theme toggle removed - only using light theme now

// Filter panel removed - no longer needed

/**
 * Toggle mobile menu visibility
 */
function toggleMobileMenu() {
    const headerControls = document.querySelector('.header-controls');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    
    if (headerControls) {
        headerControls.classList.toggle('mobile-open');
    }
    
    if (mobileMenuToggle) {
        mobileMenuToggle.classList.toggle('active');
    }
}

/**
 * Handle window resize for mobile optimization
 */
function handleWindowResize() {
    const isMobile = window.innerWidth < 768;
    
    // Chart colors update removed - only using light theme
    
    // Close mobile menu if switching to desktop
    if (!isMobile) {
        const headerControls = document.querySelector('.header-controls');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        
        if (headerControls) {
            headerControls.classList.remove('mobile-open');
        }
        
        if (mobileMenuToggle) {
            mobileMenuToggle.classList.remove('active');
        }
    }
}

/**
 * Handle search functionality
 * @param {Event} event - Search input event
 */
function handleSearch(event) {
    try {
        const searchTerm = event.target.value.toLowerCase();
        const chartCards = document.querySelectorAll('.chart-card');
        
        chartCards.forEach(card => {
            try {
                const titleElement = card.querySelector('h3');
                const sourceElement = card.querySelector('.source-link');
                
                // Skip cards that don't have required elements
                if (!titleElement || !sourceElement) {
                    console.warn('Chart card missing required elements for search:', card);
                    return;
                }
                
                const title = titleElement.textContent.toLowerCase();
                const source = sourceElement.textContent.toLowerCase();
                
                if (title.includes(searchTerm) || source.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            } catch (cardError) {
                console.warn('Error processing chart card during search:', cardError, card);
                // Continue with other cards
            }
        });
    } catch (searchError) {
        console.error('Error in search function:', searchError);
        // Don't show global error for search issues
    }
    
    // Resize visible charts after search (safe version)
    setTimeout(() => {
        try {
            if (window.chartInstances) {
                Object.values(window.chartInstances).forEach(chart => {
                    if (chart && typeof chart.resize === 'function') {
                        try {
                            chart.resize();
                        } catch (resizeError) {
                            // Silently ignore resize errors
                        }
                    }
                });
            }
        } catch (error) {
            // Silently ignore any chart resize errors
        }
    }, 100);
}

/**
 * Handle source filter
 * @param {Event} event - Filter button click event
 */
function handleSourceFilter(event) {
    try {
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
        try {
            const sourceLink = card.querySelector('.source-link');
            
            // Skip cards that don't have source link
            if (!sourceLink) {
                console.warn('Chart card missing source link for filtering:', card);
                return;
            }
            
            const cardSource = sourceLink.textContent.includes('SSB') ? 'ssb' : 
                              sourceLink.textContent.includes('Norges Bank') ? 'norges-bank' :
                              sourceLink.textContent.includes('NVE') ? 'nve' : 'static';
            
            if (source === 'all' || cardSource === source) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        } catch (cardError) {
            console.warn('Error processing chart card during filtering:', cardError, card);
            // Continue with other cards
        }
    });
    
    // Resize visible charts after filtering (safe version)
    setTimeout(() => {
        try {
            if (window.chartInstances) {
                Object.values(window.chartInstances).forEach(chart => {
                    if (chart && typeof chart.resize === 'function') {
                        try {
                            chart.resize();
                        } catch (resizeError) {
                            // Silently ignore resize errors
                        }
                    }
                });
            }
        } catch (error) {
            // Silently ignore any chart resize errors
        }
    }, 100);
    } catch (filterError) {
        console.error('Error in source filter function:', filterError);
        // Don't show global error for filter issues
    }
}

/**
 * Sort charts alphabetically by default
 */
function sortChartsAlphabetically() {
    try {
        const chartGrid = document.querySelector('.chart-grid');
        const chartCards = Array.from(document.querySelectorAll('.chart-card'));
        
        // Sort alphabetically
        chartCards.sort((a, b) => {
            try {
                const titleA = a.querySelector('h3')?.textContent || '';
                const titleB = b.querySelector('h3')?.textContent || '';
                return titleA.localeCompare(titleB);
            } catch (sortError) {
                console.warn('Error sorting chart cards:', sortError);
                return 0; // Keep original order if sorting fails
            }
        });
        
        // Re-append cards in new order
        chartCards.forEach(card => {
            chartGrid.appendChild(card);
        });
    
    // Resize charts after sorting (safe version)
    setTimeout(() => {
        try {
            if (window.chartInstances) {
                Object.values(window.chartInstances).forEach(chart => {
                    if (chart && typeof chart.resize === 'function') {
                        try {
                            chart.resize();
                        } catch (resizeError) {
                            // Silently ignore resize errors
                        }
                    }
                });
            }
        } catch (error) {
            // Silently ignore any chart resize errors
        }
    }, 100);
    } catch (sortError) {
        console.error('Error in sortChartsAlphabetically function:', sortError);
        // Don't show global error for sorting issues
    }
}

/**
 * Toggle alphabetical sorting
 */
function toggleSort() {
    try {
        const sortToggle = document.getElementById('sortToggle');
        const chartGrid = document.querySelector('.chart-grid');
        const chartCards = Array.from(document.querySelectorAll('.chart-card'));
        
        if (sortToggle.textContent === 'A-Z') {
            // Sort reverse alphabetically
            chartCards.sort((a, b) => {
                try {
                    const titleA = a.querySelector('h3')?.textContent || '';
                    const titleB = b.querySelector('h3')?.textContent || '';
                    return titleB.localeCompare(titleA);
                } catch (sortError) {
                    console.warn('Error sorting chart cards:', sortError);
                    return 0; // Keep original order if sorting fails
                }
            });
            sortToggle.textContent = 'Z-A';
            sortToggle.classList.add('active');
        } else {
            // Sort alphabetically
            chartCards.sort((a, b) => {
                try {
                    const titleA = a.querySelector('h3')?.textContent || '';
                    const titleB = b.querySelector('h3')?.textContent || '';
                    return titleA.localeCompare(titleB);
                } catch (sortError) {
                    console.warn('Error sorting chart cards:', sortError);
                    return 0; // Keep original order if sorting fails
                }
            });
            sortToggle.textContent = 'A-Z';
            sortToggle.classList.remove('active');
        }
        
        // Re-append cards in new order
        chartCards.forEach(card => {
            chartGrid.appendChild(card);
        });
    
    // Resize charts after sorting (safe version)
    setTimeout(() => {
        try {
            if (window.chartInstances) {
                Object.values(window.chartInstances).forEach(chart => {
                    if (chart && typeof chart.resize === 'function') {
                        try {
                            chart.resize();
                        } catch (resizeError) {
                            // Silently ignore resize errors
                        }
                    }
                });
            }
        } catch (error) {
            // Silently ignore any chart resize errors
        }
    }, 100);
    } catch (toggleError) {
        console.error('Error in toggleSort function:', toggleError);
        // Don't show global error for toggle issues
    }
}

/**
 * Toggle alphabetical sorting for header sort button
 */
function toggleHeaderSort() {
    try {
        const headerSortToggle = document.getElementById('headerSortToggle');
        const sortIcon = document.getElementById('sortIcon');
        const chartGrid = document.querySelector('.chart-grid');
        const chartCards = Array.from(document.querySelectorAll('.chart-card'));
        
        // Check current state by looking at the icon (using a unique path segment)
        const isAscending = sortIcon.innerHTML.includes('M20 8h-5');
        
        if (isAscending) {
            // Sort reverse alphabetically (Z-A)
            chartCards.sort((a, b) => {
                try {
                    const titleA = a.querySelector('h3')?.textContent || '';
                    const titleB = b.querySelector('h3')?.textContent || '';
                    return titleB.localeCompare(titleA);
                } catch (sortError) {
                    console.warn('Error sorting chart cards:', sortError);
                    return 0; // Keep original order if sorting fails
                }
            });
            
            // Update icon to Z-A (arrow-down-z-a)
            sortIcon.innerHTML = `
                <path d="m3 16 4 4 4-4"/>
                <path d="M7 4v16"/>
                <path d="M15 4h5l-5 6h5"/>
                <path d="M15 20v-3.5a2.5 2.5 0 0 1 5 0V20"/>
                <path d="M20 18h-5"/>
            `;
            headerSortToggle.setAttribute('aria-label', 'Sort reverse alphabetically');
            headerSortToggle.setAttribute('title', 'Sort reverse alphabetically');
        } else {
            // Sort alphabetically (A-Z)
            chartCards.sort((a, b) => {
                try {
                    const titleA = a.querySelector('h3')?.textContent || '';
                    const titleB = b.querySelector('h3')?.textContent || '';
                    return titleA.localeCompare(titleB);
                } catch (sortError) {
                    console.warn('Error sorting chart cards:', sortError);
                    return 0; // Keep original order if sorting fails
                }
            });
            
            // Update icon to A-Z (arrow-up-a-z)
            sortIcon.innerHTML = `
                <path d="m3 8 4-4 4 4"/>
                <path d="M7 4v16"/>
                <path d="M20 8h-5"/>
                <path d="M15 10V6.5a2.5 2.5 0 0 1 5 0V10"/>
                <path d="M15 14h5l-5 6h5"/>
            `;
            headerSortToggle.setAttribute('aria-label', 'Sort alphabetically');
            headerSortToggle.setAttribute('title', 'Sort alphabetically');
        }
        
        // Re-append cards in new order
        chartCards.forEach(card => {
            chartGrid.appendChild(card);
        });
    
    // Resize charts after sorting (safe version)
    setTimeout(() => {
        try {
            if (window.chartInstances) {
                Object.values(window.chartInstances).forEach(chart => {
                    if (chart && typeof chart.resize === 'function') {
                        try {
                            chart.resize();
                        } catch (resizeError) {
                            // Silently ignore resize errors
                        }
                    }
                });
            }
        } catch (error) {
            // Silently ignore any chart resize errors
        }
    }, 100);
    } catch (headerSortError) {
        console.error('Error in toggleHeaderSort function:', headerSortError);
        // Don't show global error for header sort issues
    }
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
    const headerSearchInput = document.getElementById('headerSearch');
    
    if (headerSearchInput) {
        headerSearchInput.placeholder = lang === 'no' ? 'Søk i diagrammer...' : 'Search charts...';
    }
}

/**
 * Update scroll progress bar
 * @param {number} percentage - Progress percentage (0-100)
 */
function updateScrollProgressBar(percentage) {
    const scrollProgressBar = document.getElementById('scroll-progress-bar');
    if (scrollProgressBar) {
        scrollProgressBar.style.width = `${percentage}%`;
    }
}

/**
 * Update scroll progress bar based on scroll position
 */
function updateProgressBarOnScroll() {
    // Only update scroll progress bar after loading is complete
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && loadingScreen.style.display !== 'none') {
        return; // Don't update scroll progress bar during loading
    }
    
    // Also check if the body has the 'loaded' class to ensure loading is truly complete
    if (!document.body.classList.contains('loaded')) {
        return; // Don't update scroll progress bar until loading is complete
    }
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercentage = (scrollTop / scrollHeight) * 100;
    
    // Show scroll progress bar and update it
    const scrollProgressBar = document.getElementById('scroll-progress-bar');
    if (scrollProgressBar) {
        scrollProgressBar.classList.add('active');
        updateScrollProgressBar(scrollPercentage);
    }
    
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

/**
 * Sidebar functionality
 */
(function () {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const backdrop = document.getElementById('sidebar-backdrop');
    
    if (!sidebar || !toggleBtn) return;
    
    // Restore state
    const PREF_KEY = 'sidebarExpanded';
    const wasExpanded = localStorage.getItem(PREF_KEY) === '1';
    const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
    
    function expandSidebar() {
        sidebar.classList.remove('collapsed');
        sidebar.classList.add('expanded');
        document.body.classList.add('sidebar-expanded');
        
        if (isMobile() && backdrop) {
            backdrop.style.display = 'block';
            setTimeout(() => backdrop.classList.add('show'), 10);
        }
        
        localStorage.setItem(PREF_KEY, '1');
    }
    
    function collapseSidebar() {
        sidebar.classList.remove('expanded');
        sidebar.classList.add('collapsed');
        document.body.classList.remove('sidebar-expanded');
        
        if (isMobile() && backdrop) {
            backdrop.classList.remove('show');
            setTimeout(() => backdrop.style.display = 'none', 150);
        }
        
        localStorage.setItem(PREF_KEY, '0');
    }
    
    function toggle() {
        if (sidebar.classList.contains('expanded')) {
            collapseSidebar();
        } else {
            expandSidebar();
        }
    }
    
    // Events
    toggleBtn.addEventListener('click', toggle);
    
    // Close sidebar when clicking backdrop on mobile
    if (backdrop) {
        backdrop.addEventListener('click', collapseSidebar);
    }
    
    // Close sidebar on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('expanded')) {
            collapseSidebar();
        }
    });

    // Filter panel removed - escape key handler no longer needed
    
    // Restore state on load
    if (wasExpanded) {
        // delay until layout paints to avoid jank
        requestAnimationFrame(expandSidebar);
    }
})();

// Fail-safe boot function
let bootAttempts = 0;
const MAX_BOOT_ATTEMPTS = 50; // Reduced to prevent long waits
let bootTimeout = null;

function boot() {
    try {
        bootAttempts++;
        console.log(`DOM loaded, starting application... (attempt ${bootAttempts})`);
        
        // Clear any existing timeout
        if (bootTimeout) {
            clearTimeout(bootTimeout);
        }
        
        // Prevent infinite loops
        if (bootAttempts > MAX_BOOT_ATTEMPTS) {
            console.error('Maximum boot attempts reached. Chart.js may not be loading properly.');
            hideSkeletonLoading();
            hideLoadingScreen();
            showError('Failed to load Chart.js library. Please refresh the page.');
            return;
        }
        
        // Wait for Chart.js to be loaded
        if (typeof Chart === 'undefined') {
            console.log('Waiting for Chart.js to load...');
            updateLoadingStatus('Loading Chart.js library...');
            bootTimeout = setTimeout(boot, 200); // Increased interval to reduce CPU usage
            return;
        }
        
        console.log('Chart.js is loaded, proceeding with initialization...');
        updateLoadingStatus('Chart.js loaded, initializing...');
        
        // Using light theme only - no theme switching needed
        
        console.log('Initializing UI...');
        initializeUI();
        console.log('Initializing app...');
        initializeApp();
        // Note: regional-level cards remain in DOM but are filtered by data selection
    } catch (e) {
        console.error('BOOT ERROR:', e);
        hideSkeletonLoading();
        hideLoadingScreen();
        showError('Application failed to start. Please refresh the page.');
    }
}

// Initialize when DOM is loaded or if already past
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
    // DOMContentLoaded already fired (common on GH Pages); run immediately
    boot();
}

// Add a timeout to prevent infinite waiting for Chart.js
setTimeout(() => {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js failed to load after 15 seconds');
        hideSkeletonLoading();
        hideLoadingScreen();
        showError('Failed to load Chart.js library. Please refresh the page.');
    }
}, 15000);

// ---- Chart Data Registry and Actions ----
import { updateActionButtonState } from './icons.js';
import { copyChartDataTSV } from './utils.js';

// Registry moved to registry.js to avoid circular imports

// ---- Chart Actions: Download / Copy ----
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.icon-btn');
    if (!btn) return;
    
    const card = btn.closest('.chart-card');
    if (!card) return;
    
    const action = btn.getAttribute('data-action');
    if (action === 'download') {
        // Directly download as HTML
        updateActionButtonState(btn, 'loading', 'download');
        downloadChartForCard(card, 'html')
            .then(() => {
                updateActionButtonState(btn, 'success', 'download');
            })
            .catch((error) => {
                console.error('Download failed:', error);
                updateActionButtonState(btn, 'error', 'download');
            });
    } else if (action === 'copy') {
        copyChartDataTSV(card, getDataById);
        updateActionButtonState(btn, 'success', 'copy'); // ensure btn is swapped directly
    } else if (action === 'fullscreen') {
        openChartFullscreen(card);
    } else if (action === 'minimize') {
        // Handle minimize button in fullscreen mode
        const fullscreenModal = card.closest('.fullscreen-modal');
        if (fullscreenModal) {
            // Find the original card and move canvas back
            const chartId = card.getAttribute('data-chart-id');
            const originalCard = document.querySelector(`[data-chart-id="${chartId}"]:not(.fullscreen-card)`);
            if (originalCard) {
                const canvas = card.querySelector('canvas');
                const originalContainer = originalCard.querySelector('.chart-container');
                if (canvas && originalContainer) {
                    originalContainer.appendChild(canvas);
                    
                    // Resize chart back to original size
                    const chartInstance = canvas.chart;
                    if (chartInstance && typeof chartInstance.resize === 'function') {
                        setTimeout(() => {
                            chartInstance.resize();
                        }, 100);
                    }
                }
            }
            
            // Remove modal
            document.body.removeChild(fullscreenModal);
        }
    }
});



// ---- Table Actions: Copy / Download ----
/**
 * Copy political table data to clipboard
 */
function copyPoliticalTable(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const rows = Array.from(table.querySelectorAll(".political-row"))
        .map(row => {
            const colorBox = row.querySelector('.party-color');
            const partyShort = row.querySelector('.party-short');
            const regjeringName = row.querySelector('.regjering-name');
            const years = row.querySelector('.years');
            const coalitionParties = row.querySelector('.coalition-parties');
            
            const partyName = partyShort ? partyShort.textContent.trim() : '';
            const regjering = regjeringName ? regjeringName.textContent.trim() : '';
            const period = years ? years.textContent.trim() : '';
            const coalition = coalitionParties ? coalitionParties.textContent.trim() : '';
            
            return `${partyName}\t${regjering}\t${period}\t${coalition}`;
        })
        .join('\n');

    // Add header row
    const headerRow = 'Party\tGovernment\tPeriod\tCoalition\n';
    const fullData = headerRow + rows;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(fullData)
            .then(() => console.log("Political table copied to clipboard"))
            .catch(err => console.error("Copy failed", err));
    } else {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = fullData;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
    }
}

/**
 * Download political table as CSV
 */
function downloadPoliticalTable(tableId, filename = "norwegian-political-history.csv") {
    const table = document.getElementById(tableId);
    if (!table) return;

    const rows = Array.from(table.querySelectorAll(".political-row"))
        .map(row => {
            const colorBox = row.querySelector('.party-color');
            const partyShort = row.querySelector('.party-short');
            const regjeringName = row.querySelector('.regjering-name');
            const years = row.querySelector('.years');
            const coalitionParties = row.querySelector('.coalition-parties');
            
            const partyName = partyShort ? partyShort.textContent.trim() : '';
            const regjering = regjeringName ? regjeringName.textContent.trim() : '';
            const period = years ? years.textContent.trim() : '';
            const coalition = coalitionParties ? coalitionParties.textContent.trim() : '';
            
            return `"${partyName}","${regjering}","${period}","${coalition}"`;
        })
        .join('\n');

    // Add header row
    const headerRow = '"Party","Government","Period","Coalition"\n';
    const fullData = headerRow + rows;

    const blob = new Blob([fullData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Wire up table action buttons
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".btn-action").forEach(btn => {
        const action = btn.getAttribute("data-action");
        const table = btn.closest(".table-wrapper")?.querySelector(".political-table");
        const tableId = table?.id;

        btn.addEventListener("click", () => {
            if (!tableId) return;
            if (action === "copy") copyPoliticalTable(tableId);
            if (action === "download") downloadPoliticalTable(tableId);
        });
    });
});

// Re-run ellipsis tooltips on resize and when layout changes
window.addEventListener('resize', () => {
    document.querySelectorAll('.chart-header h3').forEach(setEllipsisTitle);
});

// Handle zoom events safely to prevent errors
window.addEventListener('resize', debounce(() => {
    try {
        // Safely resize charts with error handling
        if (window.Chart && Chart.instances) {
            Chart.instances.forEach(chart => {
                try {
                    if (chart && typeof chart.resize === 'function') {
                        const canvas = chart.canvas;
                        const container = canvas?.parentElement;
                        if (container && container.style.display !== 'none' && container.offsetHeight > 0) {
                            chart.resize();
                        }
                    }
                } catch (chartError) {
                    // Silently ignore individual chart resize errors
                    console.warn('Chart resize error during zoom (ignored):', chartError.message);
                }
            });
        }
    } catch (error) {
        // Silently ignore zoom-related errors
        console.warn('Zoom resize error (ignored):', error.message);
    }
}, 100));

// Using debounce function from utils.js (already imported)

// Resize Chart.js instances when sidebar toggles or layout changes
function resizeCharts() {
    if (window.Chart) {
        Chart.helpers.each(Chart.instances, (chart) => {
            if (chart && typeof chart.resize === 'function') {
                // Only resize charts that are visible and have proper containers
                const canvas = chart.canvas;
                const container = canvas.parentElement;
                if (container && container.style.display !== 'none' && container.offsetHeight > 0) {
                    chart.resize();
                }
            }
        });
    }
}



// Call resizeCharts after sidebar toggle
document.addEventListener('DOMContentLoaded', () => {
    const sidebarToggle = document.querySelector('[data-action="toggle-sidebar"]');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            setTimeout(() => {
                resizeCharts();
                setupEllipsisTooltips();
            }, 200); // Wait for sidebar animation to complete
        });
    }
});

/**
 * Open chart in fullscreen mode
 */
function openChartFullscreen(card) {
    const chartId = card.getAttribute('data-chart-id');
    const chartCanvas = card.querySelector('canvas');
    
    if (!chartCanvas) {
        console.warn('No chart canvas found for fullscreen');
        return;
    }
    
    // Get the Chart.js instance
    const chartInstance = chartCanvas.chart;
    if (!chartInstance) {
        console.warn('No Chart.js instance found for fullscreen');
        return;
    }
    
    // Store reference to original container
    const originalContainer = card.querySelector('.chart-container');
    
    // Create fullscreen modal
    const modal = document.createElement('div');
    modal.className = 'fullscreen-modal';
    
    // Clone the entire chart card structure
    const cardClone = card.cloneNode(true);
    cardClone.classList.add('fullscreen-card');
    
    // Remove the skeleton chart from the clone
    const skeletonChart = cardClone.querySelector('.skeleton-chart');
    if (skeletonChart) {
        skeletonChart.remove();
    }
    
    // Replace the fullscreen button with a minimize button
    const fullscreenBtn = cardClone.querySelector('[data-action="fullscreen"]');
    if (fullscreenBtn) {
        fullscreenBtn.setAttribute('data-action', 'minimize');
        fullscreenBtn.setAttribute('aria-label', 'Minimize');
        fullscreenBtn.setAttribute('title', 'Minimize');
        fullscreenBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3"/>
                <path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
                <path d="M3 16h3a2 2 0 0 1 2 2v3"/>
                <path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
            </svg>
        `;
    }
    
    // Remove the cloned canvas and move the original canvas
    const clonedCanvas = cardClone.querySelector('canvas');
    if (clonedCanvas) {
        clonedCanvas.remove();
    }
    const chartContainer = cardClone.querySelector('.chart-container');
    if (chartContainer) {
        chartContainer.appendChild(chartCanvas);
    }
    
    // Add the cloned card to modal
    modal.appendChild(cardClone);
    
    // Add to body
    document.body.appendChild(modal);
    
    // Resize the chart to fit the fullscreen container
    setTimeout(() => {
        try {
            if (chartInstance && typeof chartInstance.resize === 'function') {
                chartInstance.resize();
            }
        } catch (error) {
            console.warn('Error resizing chart in fullscreen:', error);
        }
    }, 100);
    
    // Handle close button click
    const closeFullscreen = () => {
        try {
            // First, remove the modal to avoid DOM conflicts
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
            
            // Then move the canvas back to its original container
            if (originalContainer && chartCanvas && !originalContainer.contains(chartCanvas)) {
                try {
                    originalContainer.appendChild(chartCanvas);
                } catch (appendError) {
                    console.warn('Error appending canvas back to original container:', appendError);
                }
            }
            
            // Resize chart back to original size with a longer delay
            setTimeout(() => {
                try {
                    if (chartInstance && typeof chartInstance.resize === 'function') {
                        chartInstance.resize();
                    }
                } catch (error) {
                    console.warn('Error resizing chart after fullscreen:', error);
                }
            }, 300); // Increased delay for better stability
        } catch (error) {
            console.error('Error closing fullscreen:', error);
            // Fallback: just remove the modal
            try {
                if (document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
            } catch (removeError) {
                console.warn('Error removing modal in fallback:', removeError);
            }
        }
        
        // Clean up event listeners
        try {
            document.removeEventListener('keydown', handleEscape);
        } catch (listenerError) {
            console.warn('Error removing event listener:', listenerError);
        }
    };
    
    // Handle minimize button click
    const minimizeBtn = cardClone.querySelector('[data-action="minimize"]');
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', closeFullscreen);
    }
    
    // Handle escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeFullscreen();
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Clean up on modal background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeFullscreen();
        }
    });
}



// Export functions for use in other scripts

/**
 * Add source links to all OWID charts
 */
function addSourceLinksToOWIDCharts() {
    const owidCharts = document.querySelectorAll('.chart-card[data-source="static"]');
    
    owidCharts.forEach(chartCard => {
        const subtitleRow = chartCard.querySelector('.chart-subtitle-row');
        if (!subtitleRow) return;
        
        let subtitleActions = subtitleRow.querySelector('.subtitle-actions');
        
        // Create subtitle-actions if it doesn't exist
        if (!subtitleActions) {
            subtitleActions = document.createElement('div');
            subtitleActions.className = 'subtitle-actions';
            subtitleRow.appendChild(subtitleActions);
        }
        
        // Check if source link already exists
        const existingSourceLink = subtitleActions.querySelector('.source-link');
        if (existingSourceLink) {
            // Update existing source link to point to main OWID homepage
            existingSourceLink.href = 'https://ourworldindata.org/';
            existingSourceLink.textContent = 'Our World in Data';
        } else {
            // Create new source link
            const sourceLink = document.createElement('a');
            sourceLink.href = 'https://ourworldindata.org/';
            sourceLink.target = '_blank';
            sourceLink.className = 'source-link';
            sourceLink.textContent = 'Our World in Data';
            subtitleActions.appendChild(sourceLink);
        }
        
        // Remove any existing chart-source div (the long text block)
        const existingChartSource = chartCard.querySelector('.chart-source');
        if (existingChartSource) {
            existingChartSource.remove();
        }
    });
}

// Initialize source links when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    addSourceLinksToOWIDCharts();
});

// Also add source links after charts are loaded
document.addEventListener('chartsLoaded', () => {
    addSourceLinksToOWIDCharts();
});


