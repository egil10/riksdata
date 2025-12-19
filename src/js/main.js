// ============================================================================
// RIKSDATA MAIN APPLICATION
// ============================================================================

console.log('Main.js module loading...');
console.log('🔧 DFO DEBUGGING ENABLED - Looking for DFO charts...');

import { loadChartData } from './charts.js';
import { showSkeletonLoading, hideSkeletonLoading, showError, debounce, withTimeout, downloadChartForCard } from './utils.js';
import { getDataById } from './registry.js';
import { chartConfigs } from './chart-configs.js';
import { progressiveLoader, loadChartWithProgress } from './progressive-loader.js';
import { connectionMonitor } from './connection-monitor.js';

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
        e.message.includes('innerHeight') ||
        e.message.includes('destructure') ||
        e.message.includes('null') ||
        e.message.includes('undefined')
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
 * Loading message translations
 */
const loadingMessages = {
    no: {
        'Initializing': 'Initialiserer',
        'Building interface...': 'Bygger grensesnitt...',
        'Preparing charts...': 'Forbereder diagrammer...',
        'Preparing lazy loading...': 'Forbereder lazy loading...',
        'Loading first charts...': 'Laster første diagrammer...',
        'Laster Chart.js...': 'Laster Chart.js...',
        'Chart.js lastet, starter...': 'Chart.js lastet, starter...'
    },
    en: {
        'Initializing': 'Initializing',
        'Building interface...': 'Building interface...',
        'Preparing charts...': 'Preparing charts...',
        'Preparing lazy loading...': 'Preparing lazy loading...',
        'Loading first charts...': 'Loading first charts...',
        'Laster Chart.js...': 'Loading Chart.js...',
        'Chart.js lastet, starter...': 'Chart.js loaded, initializing...'
    }
};

/**
 * Update loading status message
 */
function updateLoadingStatus(messageKey) {
    const statusElement = document.getElementById('loading-status');
    if (statusElement) {
        // Get translated message or fallback to key
        const message = loadingMessages[currentLanguage]?.[messageKey] || messageKey;
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

const PREF_KEY = 'riksdata_sidebar_expanded';
let currentLanguage = 'no';
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
 * Enhance subtitle with more informative details
 * Converts simple units to detailed info with dots as separators
 * NOTE: Scale units (Millioner, Milliarder, etc.) are auto-detected and added by detectDataScale()
 */
function enhanceSubtitle(subtitle, title, id) {
    if (!subtitle) return 'Data';

    let parts = [];

    const normalizedSubtitle = subtitle.toLowerCase();

    if (subtitle.includes('NOK Million') || subtitle === 'NOK Million') {
        parts.push('NOK'); // Scale (Millioner) will be auto-detected
    } else if (subtitle.includes('NOK') && subtitle.includes('milliarder')) {
        parts.push('NOK'); // Scale (Milliarder) will be auto-detected
    } else if (subtitle.includes('NOK per m²')) {
        parts.push('NOK per m²');
    } else if (normalizedSubtitle.includes('percentage') || normalizedSubtitle.includes('prosent')) {
        parts.push('Prosent');
    } else if (normalizedSubtitle.includes('index') || normalizedSubtitle.includes('indeks')) {
        parts.push('Indeks (2015=100)');
    } else if (normalizedSubtitle.includes('number') || normalizedSubtitle.includes('antall')) {
        parts.push('Antall');
    } else if (normalizedSubtitle.includes('terajoules') || normalizedSubtitle.includes('terajoule')) {
        parts.push('Terajoule (TJ)');
    } else if (normalizedSubtitle.includes('co2')) {
        parts.push('CO₂-ekvivalenter');
    } else if (normalizedSubtitle.includes('gdp') || normalizedSubtitle.includes('bnp')) {
        parts.push('BNP-vekst (%)');
    } else if (normalizedSubtitle.includes('liters of pure alcohol')) {
        parts.push('Liter ren alkohol per person');
    } else if (normalizedSubtitle.includes('years of schooling')) {
        parts.push('Gjennomsnittlig antall skoleår');
    } else if (normalizedSubtitle.includes('deaths per 100 live births')) {
        parts.push('Dødsfall per 100 fødte');
    } else if (normalizedSubtitle.includes('deaths per 100,000 live births')) {
        parts.push('Dødsfall per 100 000 fødte');
    } else if (normalizedSubtitle.includes('tonnes per person')) {
        parts.push('Tonn per person');
    } else if (normalizedSubtitle.includes('international-$')) {
        parts.push('Internasjonale dollar ($)');
    } else if (normalizedSubtitle.includes('pisa score')) {
        parts.push('PISA-score');
    } else if (normalizedSubtitle.includes('per million people')) {
        parts.push('Per million innbyggere');
    } else if (normalizedSubtitle.includes('persons')) {
        parts.push('Personer');
    } else if (normalizedSubtitle.includes('nok')) {
        parts.push('NOK');
    } else if (normalizedSubtitle.includes('percent') || normalizedSubtitle.includes('percentage')) {
        parts.push('%');
    } else {
        parts.push(subtitle);
    }

    // Add frequency based on chart type/ID
    if (id.includes('monthly') || title.includes('Monthly')) {
        parts.push('Månedlig');
    } else if (id.includes('quarterly') || title.includes('Quarterly') || id.includes('quarter')) {
        parts.push('Kvartalsvis');
    } else if (id.includes('recent') || title.includes('Recent')) {
        parts.push('Siste data');
    } else if (id.includes('annual') || title.includes('Annual')) {
        parts.push('Årlig');
    }

    // Add context based on chart type
    if (title.includes('Seasonally Adjusted')) {
        parts.push('Sesongjustert');
    }
    if (title.includes('Index') && !parts.some(p => p.includes('Indeks'))) {
        parts.push('Indeks');
    }

    // Join with dots
    return parts.join(' • ');
}

/**
 * Infer metadata from chart configuration
 */
function inferChartMetadata(config) {
    const { url, id, title, subtitle, sourceUrl, sourceName } = config;

    let inferredSubtitle = subtitle || 'Indeks (2015=100)';
    let inferredSourceUrl = sourceUrl;
    let inferredSourceName = sourceName;
    let inferredSource = 'ssb';

    // Infer from URL if not provided
    if (url.includes('data.ssb.no')) {
        const match = url.match(/\/dataset\/(\d+)/);
        if (match) {
            inferredSourceUrl = inferredSourceUrl || `https://data.ssb.no/api/v0/dataset/${match[1]}`;
            inferredSourceName = inferredSourceName || `Statistisk sentralbyrå (SSB)`;
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
        inferredSubtitle = 'NOK • Årlig • Statsbudsjett'; // Scale (Milliarder) will be auto-detected
        inferredSourceUrl = inferredSourceUrl || 'https://www.dfo.no/';
        inferredSourceName = inferredSourceName || 'DFO';
        inferredSource = 'dfo';
    } else {
        inferredSourceUrl = inferredSourceUrl || 'https://ourworldindata.org/';
        inferredSourceName = inferredSourceName || 'Vår verden i data (OWID)';
        inferredSource = 'static';
    }

    // Enhance subtitle with more details (except for DFO which already has enhanced subtitle)
    if (!url.includes('dfo/') && !id.includes('dfo-')) {
        inferredSubtitle = enhanceSubtitle(inferredSubtitle, title, id);
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

            // Load the chart data with progressive feedback
            const isDfoChart = chartId && chartId.startsWith('dfo-');
            console.log(`🚀 LAZY LOADING CHART: ${chartId} (${config.title}) - Type: ${config.type || 'line'}${isDfoChart ? ' (DFO CHART!)' : ''}`);
            loadChartWithProgress(chartId, config.url, config.title, config.type || 'line')
                .catch(error => {
                    console.error(`Failed to load chart ${chartId}:`, error);
                });
        }
    }, {
        // Use connection-aware preload distance
        rootMargin: `${connectionMonitor.getLoadingStrategy().preloadDistance}px 0px ${connectionMonitor.getLoadingStrategy().preloadDistance}px 0px`,
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
            console.error('Application initialization timed out after 30 seconds');
            hideLoadingScreen();
            showGlobalError('Application initialization timed out. Please refresh the page.');
        }, 30000);

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

        // Wait for first row of charts to actually load before hiding loading screen
        console.log('Waiting for first charts to load...');
        updateLoadingStatus('Loading first charts...');
        await waitForFirstChartsToLoad();

        // Hide loading screen with fade out
        console.log('Hiding loading screen...');
        hideLoadingScreen();
        console.log('Loading screen hidden');

        // Sort charts alphabetically by default
        sortChartsAlphabetically();

        // Set up ellipsis tooltips for truncated chart titles
        setupEllipsisTooltips();

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
 * Wait for first row of charts (at least 9 charts) to actually load
 */
async function waitForFirstChartsToLoad() {
    const MIN_CHARTS = 9; // Wait for at least 9 charts to load (first 3 rows)
    const MAX_WAIT_TIME = 8000; // Maximum wait time: 8 seconds
    const CHECK_INTERVAL = 200; // Check every 200ms

    const startTime = Date.now();

    return new Promise((resolve) => {
        const checkCharts = () => {
            const loadedChartCount = window.chartInstances ? Object.keys(window.chartInstances).length : 0;
            const elapsedTime = Date.now() - startTime;

            console.log(`📊 Charts loaded so far: ${loadedChartCount}`);

            // Resolve if we have enough charts or exceeded max wait time
            if (loadedChartCount >= MIN_CHARTS || elapsedTime >= MAX_WAIT_TIME) {
                console.log(`✅ Proceeding with ${loadedChartCount} charts loaded after ${elapsedTime}ms`);
                resolve();
            } else {
                // Check again after interval
                setTimeout(checkCharts, CHECK_INTERVAL);
            }
        };

        checkCharts();
    });
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

    // Language toggle (footer)
    const languageToggle = document.getElementById('languageToggle');
    if (languageToggle) {
        languageToggle.addEventListener('click', toggleLanguage);
    }

    // Legacy language toggle (if exists)
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

    // Search functionality - header search with Apply button
    const headerSearchInput = document.getElementById('headerSearch');
    const searchApplyBtn = document.getElementById('searchApplyBtn');
    const searchResetBtn = document.getElementById('searchResetBtn');

    if (headerSearchInput && searchApplyBtn && searchResetBtn) {
        // Add visual feedback when typing (but don't search yet)
        headerSearchInput.addEventListener('input', (e) => {
            if (e.target.value.trim()) {
                e.target.classList.add('has-input');
                searchApplyBtn.classList.add('has-input'); // Add rainbow gradient
                searchResetBtn.style.display = 'flex'; // Show reset button
            } else {
                e.target.classList.remove('has-input');
                searchApplyBtn.classList.remove('has-input'); // Remove rainbow gradient
                searchResetBtn.style.display = 'none'; // Hide reset button
            }
        });

        // Search on Enter key
        headerSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch({ target: headerSearchInput });
                searchApplyBtn.classList.remove('has-input'); // Remove rainbow after search
            }
        });

        // Search on Apply button click
        searchApplyBtn.addEventListener('click', () => {
            handleSearch({ target: headerSearchInput });
            searchApplyBtn.classList.remove('has-input'); // Remove rainbow after search
        });

        // Reset search on Reset button click
        searchResetBtn.addEventListener('click', () => {
            headerSearchInput.value = '';
            headerSearchInput.classList.remove('has-input');
            searchApplyBtn.classList.remove('has-input');
            searchResetBtn.style.display = 'none';
            // Trigger search with empty value to show all cards
            handleSearch({ target: headerSearchInput });
        });
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

    // Update language toggle button text
    const languageToggle = document.getElementById('languageToggle');
    if (languageToggle) {
        const langText = languageToggle.querySelector('.lang-text');
        if (langText) {
            langText.textContent = currentLanguage === 'no' ? 'English' : 'Norsk';
        }
    }

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
        const searchTerm = event.target.value.toLowerCase().trim();
        // Only search within visible grid
        const mainGrid = document.querySelector('#main-dashboard .chart-grid');
        const drilldownGrid = document.querySelector('#drilldown-view #drilldown-charts-container');
        const activeGrid = (drilldownGrid && drilldownGrid.offsetParent !== null) ? drilldownGrid : mainGrid;
        const chartCards = activeGrid ? activeGrid.querySelectorAll('.chart-card') : [];

        chartCards.forEach(card => {
            try {
                const titleElement = card.querySelector('h3');
                const sourceElement = card.querySelector('.source-link');

                // Skip cards that don't have required elements
                if (!titleElement || !sourceElement) {
                    console.warn('Chart card missing required elements for search:', card);
                    card.style.display = 'none'; // Hide invalid cards
                    return;
                }

                const title = titleElement.textContent.toLowerCase();
                const source = sourceElement.textContent.toLowerCase();

                // If search is empty, reset to default visibility (show only cards that were visible before search)
                if (searchTerm === '') {
                    // Reset: show cards that are not explicitly hidden by other filters
                    card.style.display = '';
                } else if (title.includes(searchTerm) || source.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            } catch (cardError) {
                console.warn('Error processing chart card during search:', cardError, card);
                card.style.display = 'none'; // Hide cards with errors
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
        // Only sort cards inside the currently visible grid
        const mainGrid = document.querySelector('#main-dashboard .chart-grid');
        const drilldownGrid = document.querySelector('#drilldown-view #drilldown-charts-container');
        const activeGrid = (drilldownGrid && drilldownGrid.offsetParent !== null) ? drilldownGrid : mainGrid;
        if (!activeGrid) return;
        const chartCards = Array.from(activeGrid.querySelectorAll('.chart-card'));

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

        // Re-append only visible and initialized cards first, then hidden ones
        const visibleCards = chartCards.filter(c => c.style.display !== 'none');
        const hiddenCards = chartCards.filter(c => c.style.display === 'none');
        [...visibleCards, ...hiddenCards].forEach(card => {
            activeGrid.appendChild(card);
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
        const mainGrid = document.querySelector('#main-dashboard .chart-grid');
        const drilldownGrid = document.querySelector('#drilldown-view #drilldown-charts-container');
        const activeGrid = (drilldownGrid && drilldownGrid.offsetParent !== null) ? drilldownGrid : mainGrid;
        if (!activeGrid) return;
        const chartCards = Array.from(activeGrid.querySelectorAll('.chart-card'));

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
            activeGrid.appendChild(card);
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
        const mainGrid = document.querySelector('#main-dashboard .chart-grid');
        const drilldownGrid = document.querySelector('#drilldown-view #drilldown-charts-container');
        const activeGrid = (drilldownGrid && drilldownGrid.offsetParent !== null) ? drilldownGrid : mainGrid;
        if (!activeGrid) return;
        const chartCards = Array.from(activeGrid.querySelectorAll('.chart-card'));

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
            headerSortToggle.setAttribute('aria-label', 'Sorter omvendt alfabetisk');
            headerSortToggle.setAttribute('title', 'Sorter omvendt alfabetisk');
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
            headerSortToggle.setAttribute('aria-label', 'Sorter alfabetisk');
            headerSortToggle.setAttribute('title', 'Sorter alfabetisk');
        }

        // Re-append cards in new order
        chartCards.forEach(card => {
            activeGrid.appendChild(card);
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

    // Update loading screen title
    const loadingTitle = document.getElementById('loading-title');
    if (loadingTitle) {
        loadingTitle.textContent = lang === 'no' ? 'Laster Riksdata' : 'Loading Riksdata';
    }

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

    // Update footer headings
    const footerDataSources = document.getElementById('footer-data-sources');
    if (footerDataSources) {
        footerDataSources.textContent = lang === 'no' ? 'Datakilder' : 'Data Sources';
    }

    const footerContact = document.getElementById('footer-contact');
    if (footerContact) {
        footerContact.textContent = lang === 'no' ? 'Kontakt' : 'Contact';
    }

    const footerAbout = document.getElementById('footer-about');
    if (footerAbout) {
        footerAbout.textContent = lang === 'no' ? 'Om Riksdata' : 'About Riksdata';
    }

    // Update footer description
    const footerDescription = document.getElementById('footer-description');
    if (footerDescription) {
        footerDescription.textContent = lang === 'no'
            ? 'Omfattende dashboard for norske økonomiske indikatorer med politisk kontekst. Visualisering av Norges økonomiske data siden 1945.'
            : 'Comprehensive dashboard for Norwegian economic indicators with political context. Visualization of Norway\'s economic data since 1945.';
    }

    // Update footer disclaimer
    const footerDisclaimer = document.getElementById('footer-disclaimer');
    if (footerDisclaimer) {
        footerDisclaimer.textContent = lang === 'no'
            ? 'Riksdata presenterer diagrammer fra offentlige API-er (f.eks. Statistisk sentralbyrå, Norges Bank og andre offisielle kilder). Intet ansvar tas for nøyaktighet eller fullstendighet — verifiser alltid via kildelenkene.'
            : 'Riksdata presents charts from public APIs (e.g., Statistics Norway, Norges Bank, and other official sources). No responsibility is taken for accuracy or completeness — always verify via source links.';
    }

    // Update footer rights
    const footerRights = document.getElementById('footer-rights');
    if (footerRights) {
        footerRights.textContent = lang === 'no' ? 'Alle rettigheter reservert.' : 'All rights reserved.';
    }

    // Update back to top link
    const backToTopText = document.getElementById('back-to-top-text');
    if (backToTopText) {
        backToTopText.textContent = lang === 'no' ? 'Tilbake til toppen' : 'Back to top';
    }

    const backToTopLink = document.getElementById('back-to-top-link');
    if (backToTopLink) {
        backToTopLink.setAttribute('aria-label', lang === 'no' ? 'Tilbake til toppen' : 'Back to top');
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
            updateLoadingStatus('Laster Chart.js...');
            bootTimeout = setTimeout(boot, 200); // Increased interval to reduce CPU usage
            return;
        }

        console.log('Chart.js is loaded, proceeding with initialization...');
        updateLoadingStatus('Chart.js lastet, starter...');

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
        showError('Programmet kunne ikke starte. Vennligst last siden på nytt.');
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

/**
 * Show download format picker dropdown
 */
function showDownloadFormatPicker(btn, card) {
    console.log('🎯 showDownloadFormatPicker called');

    // Remove any existing format picker
    document.querySelectorAll('.download-format-picker').forEach(picker => picker.remove());

    // Create format picker
    const picker = document.createElement('div');
    picker.className = 'download-format-picker';
    picker.innerHTML = `
            <div class="download-format-option" data-format="png">
                <svg class="download-format-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
                <span>PNG</span>
            </div>
            <div class="download-format-option" data-format="pdf">
                <svg class="download-format-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                <span>PDF</span>
            </div>
            <div class="download-format-option" data-format="html">
                <svg class="download-format-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="16 18 22 12 16 6"/>
                    <polyline points="8 6 2 12 8 18"/>
                </svg>
                <span>HTML</span>
            </div>
        `;

    // Position picker relative to button
    const chartActions = btn.closest('.chart-actions');
    if (!chartActions) {
        console.error('🎯 .chart-actions not found!');
        return;
    }
    console.log('🎯 Found .chart-actions, appending picker');
    chartActions.appendChild(picker);
    console.log('🎯 Picker appended, element:', picker);

    // Handle format selection
    picker.querySelectorAll('.download-format-option').forEach(option => {
        option.addEventListener('click', async (e) => {
            e.stopPropagation();
            const format = option.getAttribute('data-format');
            picker.remove();

            // Update button state and download
            updateActionButtonState(btn, 'loading', 'download');
            try {
                await downloadChartForCard(card, format);
                updateActionButtonState(btn, 'success', 'download');
            } catch (error) {
                console.error('Download failed:', error);
                updateActionButtonState(btn, 'error', 'download');
            }
        });
    });

    // Close picker when clicking outside
    const closePickerOnClickOutside = (e) => {
        if (!picker.contains(e.target) && e.target !== btn) {
            picker.remove();
            document.removeEventListener('click', closePickerOnClickOutside);
        }
    };
    setTimeout(() => {
        document.addEventListener('click', closePickerOnClickOutside);
    }, 100);
}

// ---- Chart Actions: Download / Copy ----
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.icon-btn');
    if (!btn) return;

    const card = btn.closest('.chart-card');
    if (!card) return;

    const action = btn.getAttribute('data-action');
    if (action === 'download') {
        e.stopPropagation();
        // Show download format picker
        showDownloadFormatPicker(btn, card);
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
            Object.values(Chart.instances).forEach(chart => {
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
    if (window.Chart && Chart.instances) {
        Object.values(Chart.instances).forEach((chart) => {
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

    // Disable body scroll
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.overflowY = 'hidden';

    // Handle close button click
    const closeFullscreen = () => {
        try {
            // Re-enable body scroll
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.top = '';
            document.body.style.overflowY = '';
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }

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


