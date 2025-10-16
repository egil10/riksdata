// ============================================================================
// DRILL-DOWN VIEW HANDLER
// ============================================================================
// Handles URL hash-based navigation for drill-down views
// Usage: index.html#bankruptcies will show all bankruptcy industry charts

import { drilldownConfigs } from './drilldown-configs.js';
import { loadChartData } from './charts.js';

let currentView = 'main';

/**
 * Initialize drill-down navigation
 */
export function initDrilldownNavigation() {
    console.log('🔍 Initializing drill-down navigation...');
    
    // Handle initial hash
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Add drill-down buttons to charts
    addDrilldownButton();
    addExportsDrilldownButton();
    addCPIDrilldownButton();
    addPPIDrilldownButton();
    addCreditIndicatorDrilldownButton();
    addImportsDrilldownButton();
    addVaccinationsDrilldownButton();
    addDFODrilldownButton();
    addOilFundDrilldownButton();
    addExchangeRatesDrilldownButton();
    addMoneySupplyDrilldownButton();
    addOsloIndicesDrilldownButton();
    addPopulationDrilldownButton();
    // Political timeline button is handled directly in HTML with onclick
}

/**
 * Handle URL hash changes
 */
function handleHashChange() {
    const hash = window.location.hash.slice(1); // Remove the '#'
    
    console.log(`📍 Hash changed to: ${hash || '(empty)'}`);
    
    // Clear search filter when navigating to any view (drilldown or main)
    clearSearchFilter();
    
    if (hash === 'bankruptcies') {
        showBankruptciesView();
    } else if (hash === 'exports') {
        showExportsView();
    } else if (hash === 'cpi') {
        showCPIView();
    } else if (hash === 'ppi') {
        showPPIView();
    } else if (hash === 'creditIndicator') {
        showCreditIndicatorView();
    } else if (hash === 'imports') {
        showImportsView();
    } else if (hash === 'vaccinations') {
        showVaccinationsView();
    } else if (hash === 'dfo') {
        showDFOView();
    } else if (hash === 'oilfund') {
        showOilFundView();
    } else if (hash === 'exchangeRates') {
        showExchangeRatesView();
    } else if (hash === 'moneySupply') {
        showMoneySupplyView();
    } else if (hash === 'osloIndices') {
        showOsloIndicesView();
    } else if (hash === 'population') {
        showPopulationView();
    } else if (hash === 'politicalTimeline') {
        showPoliticalTimelineView();
    } else {
        showMainDashboard();
    }
}

/**
 * Clear search filter and reset visibility
 */
function clearSearchFilter() {
    const searchInput = document.getElementById('headerSearch');
    const searchApplyBtn = document.getElementById('searchApplyBtn');
    const searchResetBtn = document.getElementById('searchResetBtn');
    
    if (searchInput) {
        searchInput.value = '';
        searchInput.classList.remove('has-input');
    }
    if (searchApplyBtn) {
        searchApplyBtn.classList.remove('has-input');
    }
    if (searchResetBtn) {
        searchResetBtn.style.display = 'none';
    }
    
    // Reset all chart cards to visible state
    const allCards = document.querySelectorAll('.chart-card');
    allCards.forEach(card => {
        card.style.display = '';
    });
}

/**
 * Show main dashboard
 */
function showMainDashboard() {
    console.log('📊 Showing main dashboard');
    currentView = 'main';
    
    const mainView = document.getElementById('main-dashboard');
    const drilldownView = document.getElementById('drilldown-view');
    
    if (mainView) mainView.style.display = 'block';
    if (drilldownView) drilldownView.style.display = 'none';
    
    // Update page title and header breadcrumb
    document.title = 'Riksdata - Norske Data og Statistikk';
    updateHeaderBreadcrumb('');
}

/**
 * Show bankruptcies drill-down view
 */
function showBankruptciesView() {
    console.log('🏢 Showing bankruptcies drill-down view');
    currentView = 'bankruptcies';
    
    const mainView = document.getElementById('main-dashboard');
    let drilldownView = document.getElementById('drilldown-view');
    
    // Hide main dashboard
    if (mainView) mainView.style.display = 'none';
    
    // Create drill-down view if it doesn't exist
    if (!drilldownView) {
        drilldownView = createDrilldownView();
    }
    
    drilldownView.style.display = 'block';
    
    // Update page title and header breadcrumb
    document.title = 'Riksdata - Bankruptcies by Industry';
    updateHeaderBreadcrumb('Bankruptcies by Industry');
    
    // Load all bankruptcy industry charts
    loadBankruptcyCharts();
}

/**
 * Show exports drill-down view
 */
function showExportsView() {
    console.log('🌍 Showing exports drill-down view');
    currentView = 'exports';
    
    const mainView = document.getElementById('main-dashboard');
    let drilldownView = document.getElementById('drilldown-view');
    
    // Hide main dashboard
    if (mainView) mainView.style.display = 'none';
    
    // Create drill-down view if it doesn't exist
    if (!drilldownView) {
        drilldownView = createDrilldownView();
    }
    
    drilldownView.style.display = 'block';
    
    // Update page title and header breadcrumb
    document.title = 'Riksdata - Exports by Country';
    updateHeaderBreadcrumb('Exports by Country');
    
    // Load all export country charts
    loadExportCharts();
}

/**
 * Show CPI drill-down view
 */
function showCPIView() {
    console.log('📊 Showing CPI drill-down view');
    currentView = 'cpi';
    
    const mainView = document.getElementById('main-dashboard');
    let drilldownView = document.getElementById('drilldown-view');
    
    // Hide main dashboard
    if (mainView) mainView.style.display = 'none';
    
    // Create drill-down view if it doesn't exist
    if (!drilldownView) {
        drilldownView = createDrilldownView();
    }
    
    drilldownView.style.display = 'block';
    
    // Scroll to top of page
    window.scrollTo(0, 0);
    
    // Update page title and header breadcrumb
    document.title = 'Riksdata - Consumer Price Index Variations';
    updateHeaderBreadcrumb('CPI Variations');
    
    // Load all CPI charts
    loadCPICharts();
}

/**
 * Show PPI drill-down view
 */
function showPPIView() {
    console.log('📊 Showing PPI drill-down view');
    currentView = 'ppi';
    
    const mainView = document.getElementById('main-dashboard');
    let drilldownView = document.getElementById('drilldown-view');
    
    // Hide main dashboard
    if (mainView) mainView.style.display = 'none';
    
    // Create drill-down view if it doesn't exist
    if (!drilldownView) {
        drilldownView = createDrilldownView();
    }
    
    drilldownView.style.display = 'block';
    
    // Scroll to top of page
    window.scrollTo(0, 0);
    
    // Update page title and header breadcrumb
    document.title = 'Riksdata - Producer Price Index Variations';
    updateHeaderBreadcrumb('PPI Variations');
    
    // Load all PPI charts
    loadPPICharts();
}

/**
 * Show Credit Indicator drill-down view
 */
function showCreditIndicatorView() {
    console.log('💳 Showing Credit Indicator drill-down view');
    currentView = 'creditIndicator';
    
    const mainView = document.getElementById('main-dashboard');
    let drilldownView = document.getElementById('drilldown-view');
    
    // Hide main dashboard
    if (mainView) mainView.style.display = 'none';
    
    // Create drill-down view if it doesn't exist
    if (!drilldownView) {
        drilldownView = createDrilldownView();
    }
    
    drilldownView.style.display = 'block';
    
    // Update page title and header breadcrumb
    document.title = 'Riksdata - Credit Indicator Variations';
    updateHeaderBreadcrumb('Credit Indicator Variations');
    
    // Load all Credit Indicator charts
    loadCreditIndicatorCharts();
}

/**
 * Show imports drill-down view
 */
function showImportsView() {
    console.log('🌍 Showing imports drill-down view');
    currentView = 'imports';
    
    const mainView = document.getElementById('main-dashboard');
    let drilldownView = document.getElementById('drilldown-view');
    
    // Hide main dashboard
    if (mainView) mainView.style.display = 'none';
    
    // Create drill-down view if it doesn't exist
    if (!drilldownView) {
        drilldownView = createDrilldownView();
    }
    
    drilldownView.style.display = 'block';
    
    // Update page title and header breadcrumb
    document.title = 'Riksdata - Imports by Country';
    updateHeaderBreadcrumb('Imports by Country');
    
    // Load all import country charts
    loadImportCharts();
}

/**
 * Show vaccinations drill-down view
 */
function showVaccinationsView() {
    console.log('💉 Showing vaccinations drill-down view');
    currentView = 'vaccinations';
    
    const mainView = document.getElementById('main-dashboard');
    let drilldownView = document.getElementById('drilldown-view');
    
    // Hide main dashboard
    if (mainView) mainView.style.display = 'none';
    
    // Create drill-down view if it doesn't exist
    if (!drilldownView) {
        drilldownView = createDrilldownView();
    }
    
    drilldownView.style.display = 'block';
    
    // Update page title and header breadcrumb
    document.title = 'Riksdata - Vaccination Coverage';
    updateHeaderBreadcrumb('Vaccination Coverage');
    
    // Load all vaccination charts
    loadVaccinationCharts();
}

/**
 * Show DFO drill-down view
 */
function showDFOView() {
    console.log('🏛️ Showing DFO government spending drill-down view');
    currentView = 'dfo';
    
    const mainView = document.getElementById('main-dashboard');
    let drilldownView = document.getElementById('drilldown-view');
    
    // Hide main dashboard
    if (mainView) mainView.style.display = 'none';
    
    // Create drill-down view if it doesn't exist
    if (!drilldownView) {
        drilldownView = createDrilldownView();
    }
    
    drilldownView.style.display = 'block';
    
    // Update page title and header breadcrumb
    document.title = 'Riksdata - Government Spending by Department';
    updateHeaderBreadcrumb('Government Spending');
    
    // Load all DFO charts
    loadDFOCharts();
}

/**
 * Show Oil Fund drill-down view
 */
function showOilFundView() {
    console.log('🛢️ Showing Oil Fund drill-down view');
    currentView = 'oilfund';
    
    const mainView = document.getElementById('main-dashboard');
    let drilldownView = document.getElementById('drilldown-view');
    
    // Hide main dashboard
    if (mainView) mainView.style.display = 'none';
    
    // Create drill-down view if it doesn't exist
    if (!drilldownView) {
        drilldownView = createDrilldownView();
    }
    
    drilldownView.style.display = 'block';
    
    // Update page title and header breadcrumb
    document.title = 'Riksdata - Oil Fund by Asset Class';
    updateHeaderBreadcrumb('Oil Fund Breakdown');
    
    // Load all Oil Fund charts
    loadOilFundCharts();
}

/**
 * Create drill-down view container
 */
function createDrilldownView() {
    const container = document.createElement('div');
    container.id = 'drilldown-view';
    container.className = 'main-content';
    
    container.innerHTML = `
        <div id="drilldown-charts-container" class="chart-grid">
            <!-- Charts will be dynamically loaded here -->
        </div>
    `;
    
    // Insert after main-dashboard
    const mainDashboard = document.getElementById('main-dashboard');
    if (mainDashboard && mainDashboard.parentNode) {
        mainDashboard.parentNode.insertBefore(container, mainDashboard.nextSibling);
    } else {
        document.body.appendChild(container);
    }
    
    // Scroll to top when drilldown view is created
    window.scrollTo(0, 0);
    
    return container;
}

/**
 * Load all bankruptcy industry charts
 */
async function loadBankruptcyCharts() {
    const chartsContainer = document.getElementById('drilldown-charts-container');
    if (!chartsContainer) return;
    
    // Clear existing charts
    chartsContainer.innerHTML = '';
    
    const configs = drilldownConfigs.bankruptcies;
    console.log(`📊 Loading ${configs.length} bankruptcy charts in drill-down view...`);
    
    // Create chart cards for each industry
    for (const config of configs) {
        const chartCard = createChartCard(config);
        chartsContainer.appendChild(chartCard);
    }
    
    // Now load all charts (lazy loading will handle visibility)
    console.log('✅ Chart cards created, loading data...');
    
    for (const config of configs) {
        try {
            await loadChartData(config.id, config.url, config.title, config.type || 'line');
        } catch (error) {
            console.error(`Failed to load ${config.title}:`, error);
        }
    }
    
    console.log('✅ All bankruptcy charts loaded in drill-down view!');
}

/**
 * Load all export country charts
 */
async function loadExportCharts() {
    const chartsContainer = document.getElementById('drilldown-charts-container');
    if (!chartsContainer) return;
    
    // Clear existing charts
    chartsContainer.innerHTML = '';
    
    const configs = drilldownConfigs.exports;
    console.log(`🌍 Loading ${configs.length} export country charts in drill-down view...`);
    
    // Create chart cards for each country
    for (const config of configs) {
        const chartCard = createChartCard(config);
        chartsContainer.appendChild(chartCard);
    }
    
    // Now load all charts
    console.log('✅ Chart cards created, loading data...');
    
    for (const config of configs) {
        try {
            await loadChartData(config.id, config.url, config.title, config.type || 'line');
        } catch (error) {
            console.error(`Failed to load ${config.title}:`, error);
        }
    }
    
    console.log('✅ All export charts loaded in drill-down view!');
}

/**
 * Load all CPI variation charts
 */
async function loadCPICharts() {
    const chartsContainer = document.getElementById('drilldown-charts-container');
    if (!chartsContainer) return;
    
    // Clear existing charts
    chartsContainer.innerHTML = '';
    
    const configs = drilldownConfigs.cpi;
    console.log(`📊 Loading ${configs.length} CPI variation charts in drill-down view...`);
    
    // Create chart cards for each CPI variation
    for (const config of configs) {
        const chartCard = createChartCard(config);
        chartsContainer.appendChild(chartCard);
    }
    
    // Now load all charts
    console.log('✅ Chart cards created, loading data...');
    
    for (const config of configs) {
        try {
            await loadChartData(config.id, config.url, config.title, config.type || 'line');
        } catch (error) {
            console.error(`Failed to load ${config.title}:`, error);
        }
    }
    
    console.log('✅ All CPI charts loaded in drill-down view!');
}

/**
 * Load all PPI variation charts
 */
async function loadPPICharts() {
    const chartsContainer = document.getElementById('drilldown-charts-container');
    if (!chartsContainer) return;
    
    // Clear existing charts
    chartsContainer.innerHTML = '';
    
    const configs = drilldownConfigs.ppi;
    console.log(`📊 Loading ${configs.length} PPI variation charts in drill-down view...`);
    
    // Create chart cards for each PPI variation
    for (const config of configs) {
        const chartCard = createChartCard(config);
        chartsContainer.appendChild(chartCard);
    }
    
    // Now load all charts
    console.log('✅ Chart cards created, loading data...');
    
    for (const config of configs) {
        try {
            await loadChartData(config.id, config.url, config.title, config.type || 'line');
        } catch (error) {
            console.error(`Failed to load ${config.title}:`, error);
        }
    }
    
    console.log('✅ All PPI charts loaded in drill-down view!');
}

/**
 * Load all Credit Indicator variation charts
 */
async function loadCreditIndicatorCharts() {
    const chartsContainer = document.getElementById('drilldown-charts-container');
    if (!chartsContainer) return;
    
    // Clear existing charts
    chartsContainer.innerHTML = '';
    
    const configs = drilldownConfigs.creditIndicator;
    console.log(`💳 Loading ${configs.length} Credit Indicator charts in drill-down view...`);
    
    // Create chart cards for each Credit Indicator variation
    for (const config of configs) {
        const chartCard = createChartCard(config);
        chartsContainer.appendChild(chartCard);
    }
    
    // Now load all charts
    console.log('✅ Chart cards created, loading data...');
    
    for (const config of configs) {
        try {
            await loadChartData(config.id, config.url, config.title, config.type || 'line');
        } catch (error) {
            console.error(`Failed to load ${config.title}:`, error);
        }
    }
    
    console.log('✅ All Credit Indicator charts loaded in drill-down view!');
}

/**
 * Load all import country charts
 */
async function loadImportCharts() {
    const chartsContainer = document.getElementById('drilldown-charts-container');
    if (!chartsContainer) return;
    
    // Clear existing charts
    chartsContainer.innerHTML = '';
    
    const configs = drilldownConfigs.imports;
    console.log(`🌍 Loading ${configs.length} import country charts in drill-down view...`);
    
    // Create chart cards for each country
    for (const config of configs) {
        const chartCard = createChartCard(config);
        chartsContainer.appendChild(chartCard);
    }
    
    // Now load all charts
    console.log('✅ Chart cards created, loading data...');
    
    for (const config of configs) {
        try {
            await loadChartData(config.id, config.url, config.title, config.type || 'line');
        } catch (error) {
            console.error(`Failed to load ${config.title}:`, error);
        }
    }
    
    console.log('✅ All import charts loaded in drill-down view!');
}

/**
 * Load all vaccination charts
 */
async function loadVaccinationCharts() {
    const chartsContainer = document.getElementById('drilldown-charts-container');
    if (!chartsContainer) return;
    
    // Clear existing charts
    chartsContainer.innerHTML = '';
    
    const configs = drilldownConfigs.vaccinations;
    console.log(`💉 Loading ${configs.length} vaccination charts in drill-down view...`);
    
    // Create chart cards for each vaccination type
    for (const config of configs) {
        const chartCard = createChartCard(config);
        chartsContainer.appendChild(chartCard);
    }
    
    // Now load all charts
    console.log('✅ Chart cards created, loading data...');
    
    for (const config of configs) {
        try {
            await loadChartData(config.id, config.url, config.title, config.type || 'line');
        } catch (error) {
            console.error(`Failed to load ${config.title}:`, error);
        }
    }
    
    console.log('✅ All vaccination charts loaded in drill-down view!');
}

/**
 * Load all DFO government spending charts
 */
async function loadDFOCharts() {
    const chartsContainer = document.getElementById('drilldown-charts-container');
    if (!chartsContainer) return;
    
    // Clear existing charts
    chartsContainer.innerHTML = '';
    
    const configs = drilldownConfigs.dfo;
    console.log(`🏛️ Loading ${configs.length} DFO department charts in drill-down view...`);
    
    // Create chart cards for each department
    for (const config of configs) {
        const chartCard = createChartCard(config);
        chartsContainer.appendChild(chartCard);
    }
    
    // Now load all charts
    console.log('✅ Chart cards created, loading data...');
    
    for (const config of configs) {
        try {
            await loadChartData(config.id, config.url, config.title, config.type || 'line');
        } catch (error) {
            console.error(`Failed to load ${config.title}:`, error);
        }
    }
    
    console.log('✅ All DFO charts loaded in drill-down view!');
}

/**
 * Load all Oil Fund asset class charts
 */
async function loadOilFundCharts() {
    const chartsContainer = document.getElementById('drilldown-charts-container');
    if (!chartsContainer) return;
    
    // Clear existing charts
    chartsContainer.innerHTML = '';
    
    const configs = drilldownConfigs.oilfund;
    console.log(`🛢️ Loading ${configs.length} Oil Fund asset class charts in drill-down view...`);
    
    // Create chart cards for each asset class
    for (const config of configs) {
        const chartCard = createChartCard(config);
        chartsContainer.appendChild(chartCard);
    }
    
    // Now load all charts
    console.log('✅ Chart cards created, loading data...');
    
    for (const config of configs) {
        try {
            await loadChartData(config.id, config.url, config.title, config.type || 'line');
        } catch (error) {
            console.error(`Failed to load ${config.title}:`, error);
        }
    }
    
    console.log('✅ All Oil Fund charts loaded in drill-down view!');
}

/**
 * Create a chart card element
 */
function createChartCard(config, sourceInfo = { name: 'SSB', url: 'https://www.ssb.no/' }) {
    const card = document.createElement('div');
    card.className = 'chart-card';
    card.setAttribute('data-chart-id', config.id);
    card.setAttribute('data-source', 'cached');
    
    card.innerHTML = `
        <div class="chart-header">
            <div class="chart-header-top">
                <h3 title="${config.title}">${config.title}</h3>
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
                <div class="chart-subtitle">${config.subtitle || ''}</div>
                <div class="subtitle-actions">
                    <a href="${sourceInfo.url}" target="_blank" class="source-link">${sourceInfo.name}</a>
                </div>
            </div>
        </div>
        <div class="skeleton-chart" id="${config.id}-skeleton"></div>
        <div class="chart-container">
            <canvas id="${config.id}"></canvas>
            <div class="static-tooltip" id="${config.id}-tooltip"></div>
        </div>
    `;
    
    return card;
}

/**
 * Update header breadcrumb
 */
function updateHeaderBreadcrumb(subtitle) {
    const appTitle = document.querySelector('.app-title');
    if (!appTitle) return;
    
    if (subtitle) {
        // Show breadcrumb - only Riksdata is clickable/hoverable
        appTitle.innerHTML = `
            <span class="breadcrumb-home" onclick="clearSearchAndGoHome()" style="cursor: pointer;">Riksdata</span>
            <span style="opacity: 0.5; margin: 0 0.5rem; pointer-events: none;">→</span>
            <span style="font-weight: 500; cursor: default; pointer-events: none;">${subtitle}</span>
        `;
        appTitle.onclick = null; // Remove global click handler
    } else {
        // Reset to default
        appTitle.innerHTML = 'Riksdata';
        appTitle.onclick = () => window.location.reload(true);
    }
}

/**
 * Clear search and go to home (hard refresh)
 */
window.clearSearchAndGoHome = function() {
    // Clear hash first to avoid navigation issues
    if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
    }
    
    // Do a full hard refresh to reset everything
    window.location.reload(true);
};

/**
 * Add drill-down functionality to bankruptcy chart
 */
function addDrilldownButton() {
    // Wait for DOM to be ready
    setTimeout(() => {
        const bankruptcyCard = document.querySelector('[data-chart-id="bankruptcies-total-chart"]');
        if (!bankruptcyCard) {
            console.warn('Bankruptcy total chart card not found, will retry...');
            setTimeout(addDrilldownButton, 1000);
            return;
        }
        
        console.log('✅ Found bankruptcy chart card, adding drill-down features...');
        
        // 1. Add chart-spline icon to chart actions
        const chartActions = bankruptcyCard.querySelector('.chart-actions');
        if (chartActions && !chartActions.querySelector('[data-action="drilldown"]')) {
            const drilldownBtn = document.createElement('button');
            drilldownBtn.className = 'icon-btn';
            drilldownBtn.setAttribute('data-action', 'drilldown');
            drilldownBtn.setAttribute('aria-label', 'View by industry');
            drilldownBtn.setAttribute('title', 'View by industry');
            drilldownBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                    <path d="m19 9-5 5-4-4-3 3"></path>
                </svg>
            `;
            drilldownBtn.onclick = (e) => {
                e.stopPropagation();
                window.location.hash = 'bankruptcies';
            };
            
            // Insert as first button
            chartActions.insertBefore(drilldownBtn, chartActions.firstChild);
            console.log('✅ Added drill-down icon button!');
        }
        
        // 2. Make title clickable
        const chartTitle = bankruptcyCard.querySelector('.chart-header h3');
        if (chartTitle && !chartTitle.hasAttribute('data-drilldown-enabled')) {
            chartTitle.style.cursor = 'pointer';
            chartTitle.setAttribute('data-drilldown-enabled', 'true');
            chartTitle.onclick = () => {
                window.location.hash = 'bankruptcies';
            };
            chartTitle.setAttribute('title', 'Click to view by industry');
            console.log('✅ Made title clickable!');
        }
        
        console.log('✅ Drill-down features added successfully!');
    }, 3000); // Wait 3 seconds for charts to load
}

/**
 * Add drill-down functionality to export-by-country chart
 */
function addExportsDrilldownButton() {
    // Wait for DOM to be ready
    setTimeout(() => {
        const exportCard = document.querySelector('[data-chart-id="export-country-chart"]');
        if (!exportCard) {
            console.warn('Export by country chart card not found, will retry...');
            setTimeout(addExportsDrilldownButton, 1000);
            return;
        }
        
        console.log('✅ Found export by country chart card, adding drill-down features...');
        
        // 1. Add chart-spline icon to chart actions
        const chartActions = exportCard.querySelector('.chart-actions');
        if (chartActions && !chartActions.querySelector('[data-action="drilldown-exports"]')) {
            const drilldownBtn = document.createElement('button');
            drilldownBtn.className = 'icon-btn';
            drilldownBtn.setAttribute('data-action', 'drilldown-exports');
            drilldownBtn.setAttribute('aria-label', 'View by country');
            drilldownBtn.setAttribute('title', 'View by country');
            drilldownBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                    <path d="m19 9-5 5-4-4-3 3"></path>
                </svg>
            `;
            drilldownBtn.onclick = (e) => {
                e.stopPropagation();
                window.location.hash = 'exports';
            };
            
            // Insert as first button
            chartActions.insertBefore(drilldownBtn, chartActions.firstChild);
            console.log('✅ Added drill-down icon button to exports!');
        }
        
        // 2. Make title clickable
        const chartTitle = exportCard.querySelector('.chart-header h3');
        if (chartTitle && !chartTitle.hasAttribute('data-drilldown-enabled')) {
            chartTitle.style.cursor = 'pointer';
            chartTitle.setAttribute('data-drilldown-enabled', 'true');
            chartTitle.onclick = () => {
                window.location.hash = 'exports';
            };
            chartTitle.setAttribute('title', 'Click to view by country');
            console.log('✅ Made export title clickable!');
        }
        
        console.log('✅ Export drill-down features added successfully!');
    }, 3000); // Wait 3 seconds for charts to load
}

/**
 * Add drill-down functionality to CPI chart
 */
function addCPIDrilldownButton() {
    // Wait for DOM to be ready
    setTimeout(() => {
        const cpiCard = document.querySelector('[data-chart-id="cpi-chart"]');
        if (!cpiCard) {
            console.warn('CPI chart card not found, will retry...');
            setTimeout(addCPIDrilldownButton, 1000);
            return;
        }
        
        console.log('✅ Found CPI chart card, adding drill-down features...');
        
        // 1. Add chart-spline icon to chart actions
        const chartActions = cpiCard.querySelector('.chart-actions');
        if (chartActions && !chartActions.querySelector('[data-action="drilldown-cpi"]')) {
            const drilldownBtn = document.createElement('button');
            drilldownBtn.className = 'icon-btn';
            drilldownBtn.setAttribute('data-action', 'drilldown-cpi');
            drilldownBtn.setAttribute('aria-label', 'View CPI variations');
            drilldownBtn.setAttribute('title', 'View CPI variations');
            drilldownBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                    <path d="m19 9-5 5-4-4-3 3"></path>
                </svg>
            `;
            drilldownBtn.onclick = (e) => {
                e.stopPropagation();
                window.location.hash = 'cpi';
            };
            
            // Insert as first button
            chartActions.insertBefore(drilldownBtn, chartActions.firstChild);
            console.log('✅ Added drill-down icon button to CPI!');
        }
        
        // 2. Make title clickable
        const chartTitle = cpiCard.querySelector('.chart-header h3');
        if (chartTitle && !chartTitle.hasAttribute('data-drilldown-enabled')) {
            chartTitle.style.cursor = 'pointer';
            chartTitle.setAttribute('data-drilldown-enabled', 'true');
            chartTitle.onclick = () => {
                window.location.hash = 'cpi';
            };
            chartTitle.setAttribute('title', 'Click to view CPI variations');
            console.log('✅ Made CPI title clickable!');
        }
        
        console.log('✅ CPI drill-down features added successfully!');
    }, 3000); // Wait 3 seconds for charts to load
}

/**
 * Add drill-down functionality to PPI chart
 */
function addPPIDrilldownButton() {
    // Wait for DOM to be ready
    setTimeout(() => {
        const ppiCard = document.querySelector('[data-chart-id="ppi-chart"]');
        if (!ppiCard) {
            console.warn('PPI chart card not found, will retry...');
            setTimeout(addPPIDrilldownButton, 1000);
            return;
        }
        
        console.log('✅ Found PPI chart card, adding drill-down features...');
        
        // 1. Add chart-spline icon to chart actions
        const chartActions = ppiCard.querySelector('.chart-actions');
        if (chartActions && !chartActions.querySelector('[data-action="drilldown-ppi"]')) {
            const drilldownBtn = document.createElement('button');
            drilldownBtn.className = 'icon-btn';
            drilldownBtn.setAttribute('data-action', 'drilldown-ppi');
            drilldownBtn.setAttribute('aria-label', 'View PPI variations');
            drilldownBtn.setAttribute('title', 'View PPI variations');
            drilldownBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                    <path d="m19 9-5 5-4-4-3 3"></path>
                </svg>
            `;
            drilldownBtn.onclick = (e) => {
                e.stopPropagation();
                window.location.hash = 'ppi';
            };
            
            // Insert as first button
            chartActions.insertBefore(drilldownBtn, chartActions.firstChild);
            console.log('✅ Added drill-down icon button to PPI!');
        }
        
        // 2. Make title clickable
        const chartTitle = ppiCard.querySelector('.chart-header h3');
        if (chartTitle && !chartTitle.hasAttribute('data-drilldown-enabled')) {
            chartTitle.style.cursor = 'pointer';
            chartTitle.setAttribute('data-drilldown-enabled', 'true');
            chartTitle.onclick = () => {
                window.location.hash = 'ppi';
            };
            chartTitle.setAttribute('title', 'Click to view PPI variations');
            console.log('✅ Made PPI title clickable!');
        }
        
        console.log('✅ PPI drill-down features added successfully!');
    }, 3000); // Wait 3 seconds for charts to load
}

/**
 * Add drill-down functionality to Credit Indicator chart
 */
function addCreditIndicatorDrilldownButton() {
    // Wait for DOM to be ready
    setTimeout(() => {
        const creditCard = document.querySelector('[data-chart-id="credit-indicator-chart"]');
        if (!creditCard) {
            console.warn('Credit Indicator chart card not found, will retry...');
            setTimeout(addCreditIndicatorDrilldownButton, 1000);
            return;
        }
        
        console.log('✅ Found Credit Indicator chart card, adding drill-down features...');
        
        // 1. Add chart-spline icon to chart actions
        const chartActions = creditCard.querySelector('.chart-actions');
        if (chartActions && !chartActions.querySelector('[data-action="drilldown-credit-indicator"]')) {
            const drilldownBtn = document.createElement('button');
            drilldownBtn.className = 'icon-btn';
            drilldownBtn.setAttribute('data-action', 'drilldown-credit-indicator');
            drilldownBtn.setAttribute('aria-label', 'View Credit Indicator variations');
            drilldownBtn.setAttribute('title', 'View Credit Indicator variations');
            drilldownBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                    <path d="m19 9-5 5-4-4-3 3"></path>
                </svg>
            `;
            drilldownBtn.onclick = (e) => {
                e.stopPropagation();
                window.location.hash = 'creditIndicator';
            };
            
            // Insert as first button
            chartActions.insertBefore(drilldownBtn, chartActions.firstChild);
            console.log('✅ Added drill-down icon button to Credit Indicator!');
        }
        
        // 2. Make title clickable
        const chartTitle = creditCard.querySelector('.chart-header h3');
        if (chartTitle && !chartTitle.hasAttribute('data-drilldown-enabled')) {
            chartTitle.style.cursor = 'pointer';
            chartTitle.setAttribute('data-drilldown-enabled', 'true');
            chartTitle.onclick = () => {
                window.location.hash = 'creditIndicator';
            };
            chartTitle.setAttribute('title', 'Click to view Credit Indicator variations');
            console.log('✅ Made Credit Indicator title clickable!');
        }
        
        console.log('✅ Credit Indicator drill-down features added successfully!');
    }, 3000); // Wait 3 seconds for charts to load
}

/**
 * Add drill-down functionality to import-by-country chart
 */
function addImportsDrilldownButton() {
    // Wait for DOM to be ready
    setTimeout(() => {
        const importCard = document.querySelector('[data-chart-id="import-country-chart"]');
        if (!importCard) {
            console.warn('Import by country chart card not found, will retry...');
            setTimeout(addImportsDrilldownButton, 1000);
            return;
        }
        
        console.log('✅ Found import by country chart card, adding drill-down features...');
        
        // 1. Add chart-spline icon to chart actions
        const chartActions = importCard.querySelector('.chart-actions');
        if (chartActions && !chartActions.querySelector('[data-action="drilldown-imports"]')) {
            const drilldownBtn = document.createElement('button');
            drilldownBtn.className = 'icon-btn';
            drilldownBtn.setAttribute('data-action', 'drilldown-imports');
            drilldownBtn.setAttribute('aria-label', 'View by country');
            drilldownBtn.setAttribute('title', 'View by country');
            drilldownBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                    <path d="m19 9-5 5-4-4-3 3"></path>
                </svg>
            `;
            drilldownBtn.onclick = (e) => {
                e.stopPropagation();
                window.location.hash = 'imports';
            };
            
            // Insert as first button
            chartActions.insertBefore(drilldownBtn, chartActions.firstChild);
            console.log('✅ Added drill-down icon button to imports!');
        }
        
        // 2. Make title clickable
        const chartTitle = importCard.querySelector('.chart-header h3');
        if (chartTitle && !chartTitle.hasAttribute('data-drilldown-enabled')) {
            chartTitle.style.cursor = 'pointer';
            chartTitle.setAttribute('data-drilldown-enabled', 'true');
            chartTitle.onclick = () => {
                window.location.hash = 'imports';
            };
            chartTitle.setAttribute('title', 'Click to view by country');
            console.log('✅ Made import title clickable!');
        }
        
        console.log('✅ Import drill-down features added successfully!');
    }, 3000); // Wait 3 seconds for charts to load
}

/**
 * Add drill-down functionality to vaccination chart
 */
function addVaccinationsDrilldownButton() {
    // Wait for DOM to be ready
    setTimeout(() => {
        const vaccinationCard = document.querySelector('[data-chart-id="norway-vaccination-pol3-chart"]');
        if (!vaccinationCard) {
            console.warn('Vaccination chart card not found, will retry...');
            setTimeout(addVaccinationsDrilldownButton, 1000);
            return;
        }
        
        console.log('✅ Found vaccination chart card, adding drill-down features...');
        
        // 1. Add chart-spline icon to chart actions
        const chartActions = vaccinationCard.querySelector('.chart-actions');
        if (chartActions && !chartActions.querySelector('[data-action="drilldown-vaccinations"]')) {
            const drilldownBtn = document.createElement('button');
            drilldownBtn.className = 'icon-btn';
            drilldownBtn.setAttribute('data-action', 'drilldown-vaccinations');
            drilldownBtn.setAttribute('aria-label', 'View all vaccines');
            drilldownBtn.setAttribute('title', 'View all vaccines');
            drilldownBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                    <path d="m19 9-5 5-4-4-3 3"></path>
                </svg>
            `;
            drilldownBtn.onclick = (e) => {
                e.stopPropagation();
                window.location.hash = 'vaccinations';
            };
            
            // Insert as first button
            chartActions.insertBefore(drilldownBtn, chartActions.firstChild);
            console.log('✅ Added drill-down icon button to vaccinations!');
        }
        
        // 2. Make title clickable
        const chartTitle = vaccinationCard.querySelector('.chart-header h3');
        if (chartTitle && !chartTitle.hasAttribute('data-drilldown-enabled')) {
            chartTitle.style.cursor = 'pointer';
            chartTitle.setAttribute('data-drilldown-enabled', 'true');
            chartTitle.onclick = () => {
                window.location.hash = 'vaccinations';
            };
            chartTitle.setAttribute('title', 'Click to view all vaccines');
            console.log('✅ Made vaccination title clickable!');
        }
        
        console.log('✅ Vaccination drill-down features added successfully!');
    }, 3000); // Wait 3 seconds for charts to load
}

/**
 * Add drill-down functionality to DFO total chart
 */
function addDFODrilldownButton() {
    // Wait for DOM to be ready
    setTimeout(() => {
        const dfoCard = document.querySelector('[data-chart-id="dfo-total-chart"]');
        if (!dfoCard) {
            console.warn('DFO total chart card not found, will retry...');
            setTimeout(addDFODrilldownButton, 1000);
            return;
        }
        
        console.log('✅ Found DFO total chart card, adding drill-down features...');
        
        // 1. Add chart-spline icon to chart actions
        const chartActions = dfoCard.querySelector('.chart-actions');
        if (chartActions && !chartActions.querySelector('[data-action="drilldown-dfo"]')) {
            const drilldownBtn = document.createElement('button');
            drilldownBtn.className = 'icon-btn';
            drilldownBtn.setAttribute('data-action', 'drilldown-dfo');
            drilldownBtn.setAttribute('aria-label', 'View by department');
            drilldownBtn.setAttribute('title', 'View by department');
            drilldownBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                    <path d="m19 9-5 5-4-4-3 3"></path>
                </svg>
            `;
            drilldownBtn.onclick = (e) => {
                e.stopPropagation();
                window.location.hash = 'dfo';
            };
            
            // Insert as first button
            chartActions.insertBefore(drilldownBtn, chartActions.firstChild);
            console.log('✅ Added drill-down icon button to DFO!');
        }
        
        // 2. Make title clickable
        const chartTitle = dfoCard.querySelector('.chart-header h3');
        if (chartTitle && !chartTitle.hasAttribute('data-drilldown-enabled')) {
            chartTitle.style.cursor = 'pointer';
            chartTitle.setAttribute('data-drilldown-enabled', 'true');
            chartTitle.onclick = () => {
                window.location.hash = 'dfo';
            };
            chartTitle.setAttribute('title', 'Click to view by department');
            console.log('✅ Made DFO title clickable!');
        }
        
        console.log('✅ DFO drill-down features added successfully!');
    }, 3000); // Wait 3 seconds for charts to load
}

/**
 * Add drill-down functionality to Oil Fund total chart
 */
function addOilFundDrilldownButton() {
    // Wait for DOM to be ready
    setTimeout(() => {
        const oilFundCard = document.querySelector('[data-chart-id="oil-fund-total-chart"]');
        if (!oilFundCard) {
            console.warn('Oil Fund total chart card not found, will retry...');
            setTimeout(addOilFundDrilldownButton, 1000);
            return;
        }
        
        console.log('✅ Found Oil Fund total chart card, adding drill-down features...');
        
        // 1. Add chart-spline icon to chart actions
        const chartActions = oilFundCard.querySelector('.chart-actions');
        if (chartActions && !chartActions.querySelector('[data-action="drilldown-oilfund"]')) {
            const drilldownBtn = document.createElement('button');
            drilldownBtn.className = 'icon-btn';
            drilldownBtn.setAttribute('data-action', 'drilldown-oilfund');
            drilldownBtn.setAttribute('aria-label', 'View by asset class');
            drilldownBtn.setAttribute('title', 'View by asset class');
            drilldownBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                    <path d="m19 9-5 5-4-4-3 3"></path>
                </svg>
            `;
            drilldownBtn.onclick = (e) => {
                e.stopPropagation();
                window.location.hash = 'oilfund';
            };
            
            // Insert as first button
            chartActions.insertBefore(drilldownBtn, chartActions.firstChild);
            console.log('✅ Added drill-down icon button to Oil Fund!');
        }
        
        // 2. Make title clickable
        const chartTitle = oilFundCard.querySelector('.chart-header h3');
        if (chartTitle && !chartTitle.hasAttribute('data-drilldown-enabled')) {
            chartTitle.style.cursor = 'pointer';
            chartTitle.setAttribute('data-drilldown-enabled', 'true');
            chartTitle.onclick = () => {
                window.location.hash = 'oilfund';
            };
            chartTitle.setAttribute('title', 'Click to view by asset class');
            console.log('✅ Made Oil Fund title clickable!');
        }
        
        console.log('✅ Oil Fund drill-down features added successfully!');
    }, 3000); // Wait 3 seconds for charts to load
}

/**
 * Show exchange rates drill-down view
 */
function showExchangeRatesView() {
    console.log('💱 Showing exchange rates drill-down view');
    currentView = 'exchangeRates';
    
    const mainView = document.getElementById('main-dashboard');
    let drilldownView = document.getElementById('drilldown-view');
    
    // Hide main dashboard
    if (mainView) mainView.style.display = 'none';
    
    // Create drill-down view if it doesn't exist
    if (!drilldownView) {
        drilldownView = createDrilldownView();
    }
    
    drilldownView.style.display = 'block';
    
    // Update page title and header breadcrumb
    document.title = 'Riksdata - Exchange Rates';
    updateHeaderBreadcrumb('Exchange Rates');
    
    // Load all exchange rate charts
    loadExchangeRateCharts();
}

/**
 * Load exchange rate charts for drill-down view
 */
async function loadExchangeRateCharts() {
    const chartsContainer = document.getElementById('drilldown-charts-container');
    if (!chartsContainer) return;
    
    // Clear existing charts
    chartsContainer.innerHTML = '';
    
    const configs = drilldownConfigs.exchangeRates;
    console.log(`💱 Loading ${configs.length} exchange rate charts in drill-down view...`);
    
    // Create chart cards for each exchange rate
    for (const config of configs) {
        const chartCard = createChartCard(config, { name: 'Norges Bank', url: 'https://www.norges-bank.no/' });
        chartsContainer.appendChild(chartCard);
    }

    // Load chart data for each card
    for (const config of configs) {
        try {
            await loadChartData(config.id, config.url, config.title, config.type);
        } catch (error) {
            console.error(`Failed to load exchange rate chart ${config.id}:`, error);
        }
    }
    
    console.log('✅ All exchange rate charts loaded successfully!');
}

/**
 * Add drill-down functionality to exchange rates chart
 */
function addExchangeRatesDrilldownButton() {
    // Wait for DOM to be ready
    setTimeout(() => {
        const exchangeRatesCard = document.querySelector('[data-chart-id="i44-nok-chart"]');
        if (!exchangeRatesCard) {
            console.warn('Exchange rates chart card not found, will retry...');
            setTimeout(addExchangeRatesDrilldownButton, 1000);
            return;
        }
        
        console.log('✅ Found exchange rates chart card, adding drill-down features...');
        
        // 1. Add chart-spline icon to chart actions
        const chartActions = exchangeRatesCard.querySelector('.chart-actions');
        if (chartActions && !chartActions.querySelector('[data-action="drilldown-exchangeRates"]')) {
            const drilldownBtn = document.createElement('button');
            drilldownBtn.className = 'icon-btn';
            drilldownBtn.setAttribute('data-action', 'drilldown-exchangeRates');
            drilldownBtn.setAttribute('aria-label', 'View all exchange rates');
            drilldownBtn.setAttribute('title', 'View all exchange rates');
            drilldownBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                    <path d="m19 9-5 5-4-4-3 3"></path>
                </svg>
            `;
            drilldownBtn.onclick = (e) => {
                e.stopPropagation();
                window.location.hash = 'exchangeRates';
            };
            
            // Insert as first button
            chartActions.insertBefore(drilldownBtn, chartActions.firstChild);
            console.log('✅ Added drill-down icon button to exchange rates!');
        }
        
        // 2. Make title clickable
        const chartTitle = exchangeRatesCard.querySelector('.chart-header h3');
        if (chartTitle && !chartTitle.hasAttribute('data-drilldown-enabled')) {
            chartTitle.style.cursor = 'pointer';
            chartTitle.setAttribute('data-drilldown-enabled', 'true');
            chartTitle.onclick = () => {
                window.location.hash = 'exchangeRates';
            };
            chartTitle.setAttribute('title', 'Click to view all exchange rates');
            console.log('✅ Made exchange rates title clickable!');
        }
        
        console.log('✅ Exchange rates drill-down features added successfully!');
    }, 3000); // Wait 3 seconds for charts to load
}

/**
 * Show money supply drill-down view
 */
function showMoneySupplyView() {
    console.log('💰 Showing money supply drill-down view');
    currentView = 'moneySupply';
    
    const mainView = document.getElementById('main-dashboard');
    let drilldownView = document.getElementById('drilldown-view');
    
    // Hide main dashboard
    if (mainView) mainView.style.display = 'none';
    
    // Create drill-down view if it doesn't exist
    if (!drilldownView) {
        drilldownView = createDrilldownView();
    }
    
    drilldownView.style.display = 'block';
    
    // Update page title and header breadcrumb
    document.title = 'Riksdata - Money Supply';
    updateHeaderBreadcrumb('Money Supply');
    
    // Load all money supply charts
    loadMoneySupplyCharts();
}

/**
 * Load money supply charts for drill-down view
 */
async function loadMoneySupplyCharts() {
    const chartsContainer = document.getElementById('drilldown-charts-container');
    if (!chartsContainer) return;
    
    // Clear existing charts
    chartsContainer.innerHTML = '';
    
    const configs = drilldownConfigs.moneySupply;
    console.log(`💰 Loading ${configs.length} money supply charts in drill-down view...`);
    
    // Create chart cards for each money supply measure
    for (const config of configs) {
        const chartCard = createChartCard(config, { name: 'SSB', url: 'https://www.ssb.no/' });
        chartsContainer.appendChild(chartCard);
    }

    // Load chart data for each card
    for (const config of configs) {
        try {
            await loadChartData(config.id, config.url, config.title, config.type);
        } catch (error) {
            console.error(`Failed to load money supply chart ${config.id}:`, error);
        }
    }
    
    console.log('✅ All money supply charts loaded successfully!');
}

/**
 * Add drill-down functionality to money supply chart
 */
function addMoneySupplyDrilldownButton() {
    // Wait for DOM to be ready
    setTimeout(() => {
        const moneySupplyCard = document.querySelector('[data-chart-id="money-supply-m0-chart"]');
        if (!moneySupplyCard) {
            console.warn('Money supply chart card not found, will retry...');
            setTimeout(addMoneySupplyDrilldownButton, 1000);
            return;
        }
        
        console.log('✅ Found money supply chart card, adding drill-down features...');
        
        // 1. Add chart-spline icon to chart actions
        const chartActions = moneySupplyCard.querySelector('.chart-actions');
        if (chartActions && !chartActions.querySelector('[data-action="drilldown-moneySupply"]')) {
            const drilldownBtn = document.createElement('button');
            drilldownBtn.className = 'icon-btn';
            drilldownBtn.setAttribute('data-action', 'drilldown-moneySupply');
            drilldownBtn.setAttribute('aria-label', 'View all money supply measures');
            drilldownBtn.setAttribute('title', 'View all money supply measures');
            drilldownBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                    <path d="m19 9-5 5-4-4-3 3"></path>
                </svg>
            `;
            drilldownBtn.onclick = (e) => {
                e.stopPropagation();
                window.location.hash = 'moneySupply';
            };
            
            // Insert as first button
            chartActions.insertBefore(drilldownBtn, chartActions.firstChild);
            console.log('✅ Added drill-down icon button to money supply!');
        }
        
        // 2. Make title clickable
        const chartTitle = moneySupplyCard.querySelector('.chart-header h3');
        if (chartTitle && !chartTitle.hasAttribute('data-drilldown-enabled')) {
            chartTitle.style.cursor = 'pointer';
            chartTitle.setAttribute('data-drilldown-enabled', 'true');
            chartTitle.onclick = () => {
                window.location.hash = 'moneySupply';
            };
            chartTitle.setAttribute('title', 'Click to view all money supply measures');
            console.log('✅ Made money supply title clickable!');
        }
        
        console.log('✅ Money supply drill-down features added successfully!');
    }, 3000); // Wait 3 seconds for charts to load
}

/**
 * Show Oslo indices drill-down view
 */
function showOsloIndicesView() {
    console.log('📈 Showing Oslo indices drill-down view');
    currentView = 'osloIndices';
    
    const mainView = document.getElementById('main-dashboard');
    let drilldownView = document.getElementById('drilldown-view');
    
    // Hide main dashboard
    if (mainView) mainView.style.display = 'none';
    
    // Create drill-down view if it doesn't exist
    if (!drilldownView) {
        drilldownView = createDrilldownView();
    }
    
    drilldownView.style.display = 'block';
    
    // Update page title and header breadcrumb
    document.title = 'Riksdata - Oslo Stock Exchange Indices';
    updateHeaderBreadcrumb('Oslo Stock Exchange Indices');
    
    // Load all Oslo indices charts
    loadOsloIndicesCharts();
}

/**
 * Load Oslo indices charts for drill-down view
 */
async function loadOsloIndicesCharts() {
    const chartsContainer = document.getElementById('drilldown-charts-container');
    if (!chartsContainer) return;
    
    // Clear existing charts
    chartsContainer.innerHTML = '';
    
    const configs = drilldownConfigs.osloIndices;
    console.log(`📈 Loading ${configs.length} Oslo indices charts in drill-down view...`);
    
    // Create chart cards for each Oslo index
    for (const config of configs) {
        const chartCard = createChartCard(config, { name: 'Oslo Børs', url: 'https://www.oslobors.no/' });
        chartsContainer.appendChild(chartCard);
    }

    // Load chart data for each card
    for (const config of configs) {
        try {
            await loadChartData(config.id, config.url, config.title, config.type);
        } catch (error) {
            console.error(`Failed to load Oslo index chart ${config.id}:`, error);
        }
    }
    
    console.log('✅ All Oslo indices charts loaded successfully!');
}

/**
 * Add drill-down functionality to Oslo indices chart
 */
function addOsloIndicesDrilldownButton() {
    // Wait for DOM to be ready
    setTimeout(() => {
        const osloIndicesCard = document.querySelector('[data-chart-id="oseax-chart"]');
        if (!osloIndicesCard) {
            console.warn('Oslo indices chart card not found, will retry...');
            setTimeout(addOsloIndicesDrilldownButton, 1000);
            return;
        }
        
        console.log('✅ Found Oslo indices chart card, adding drill-down features...');
        
        // 1. Add chart-spline icon to chart actions
        const chartActions = osloIndicesCard.querySelector('.chart-actions');
        if (chartActions && !chartActions.querySelector('[data-action="drilldown-osloIndices"]')) {
            const drilldownBtn = document.createElement('button');
            drilldownBtn.className = 'icon-btn';
            drilldownBtn.setAttribute('data-action', 'drilldown-osloIndices');
            drilldownBtn.setAttribute('aria-label', 'View all Oslo indices');
            drilldownBtn.setAttribute('title', 'View all Oslo indices');
            drilldownBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                    <path d="m19 9-5 5-4-4-3 3"></path>
                </svg>
            `;
            drilldownBtn.onclick = (e) => {
                e.stopPropagation();
                window.location.hash = 'osloIndices';
            };
            
            // Insert as first button
            chartActions.insertBefore(drilldownBtn, chartActions.firstChild);
            console.log('✅ Added drill-down icon button to Oslo indices!');
        }
        
        // 2. Make title clickable
        const chartTitle = osloIndicesCard.querySelector('.chart-header h3');
        if (chartTitle && !chartTitle.hasAttribute('data-drilldown-enabled')) {
            chartTitle.style.cursor = 'pointer';
            chartTitle.setAttribute('data-drilldown-enabled', 'true');
            chartTitle.onclick = () => {
                window.location.hash = 'osloIndices';
            };
            chartTitle.setAttribute('title', 'Click to view all Oslo indices');
            console.log('✅ Made Oslo indices title clickable!');
        }
        
        console.log('✅ Oslo indices drill-down features added successfully!');
    }, 3000); // Wait 3 seconds for charts to load
}

/**
 * Show population drill-down view
 */
function showPopulationView() {
    console.log('👥 Showing population drill-down view');
    currentView = 'population';
    
    const mainView = document.getElementById('main-dashboard');
    let drilldownView = document.getElementById('drilldown-view');
    
    // Hide main dashboard
    if (mainView) mainView.style.display = 'none';
    
    // Create drill-down view if it doesn't exist
    if (!drilldownView) {
        drilldownView = createDrilldownView();
    }
    
    drilldownView.style.display = 'block';
    
    // Update page title and header breadcrumb
    document.title = 'Riksdata - Population';
    updateHeaderBreadcrumb('Population');
    
    // Load all population charts
    loadPopulationCharts();
}

/**
 * Load population charts for drill-down view
 */
async function loadPopulationCharts() {
    const chartsContainer = document.getElementById('drilldown-charts-container');
    if (!chartsContainer) return;
    
    // Clear existing charts
    chartsContainer.innerHTML = '';
    
    const configs = drilldownConfigs.population;
    console.log(`👥 Loading ${configs.length} population charts in drill-down view...`);
    
    // Create chart cards for each population measure
    for (const config of configs) {
        const chartCard = createChartCard(config, { name: 'SSB', url: 'https://www.ssb.no/' });
        chartsContainer.appendChild(chartCard);
    }

    // Load chart data for each card
    for (const config of configs) {
        try {
            await loadChartData(config.id, config.url, config.title, config.type);
        } catch (error) {
            console.error(`Failed to load population chart ${config.id}:`, error);
        }
    }
    
    console.log('✅ All population charts loaded successfully!');
}

/**
 * Add drill-down functionality to population chart
 */
function addPopulationDrilldownButton() {
    // Wait for DOM to be ready
    setTimeout(() => {
        const populationCard = document.querySelector('[data-chart-id="population-growth-chart"]');
        if (!populationCard) {
            console.warn('Population chart card not found, will retry...');
            setTimeout(addPopulationDrilldownButton, 1000);
            return;
        }
        
        console.log('✅ Found population chart card, adding drill-down features...');
        
        // 1. Add chart-spline icon to chart actions
        const chartActions = populationCard.querySelector('.chart-actions');
        if (chartActions && !chartActions.querySelector('[data-action="drilldown-population"]')) {
            const drilldownBtn = document.createElement('button');
            drilldownBtn.className = 'icon-btn';
            drilldownBtn.setAttribute('data-action', 'drilldown-population');
            drilldownBtn.setAttribute('aria-label', 'View all population statistics');
            drilldownBtn.setAttribute('title', 'View all population statistics');
            drilldownBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                    <path d="m19 9-5 5-4-4-3 3"></path>
                </svg>
            `;
            drilldownBtn.onclick = (e) => {
                e.stopPropagation();
                window.location.hash = 'population';
            };
            
            // Insert as first button
            chartActions.insertBefore(drilldownBtn, chartActions.firstChild);
            console.log('✅ Added drill-down icon button to population!');
        }
        
        // 2. Make title clickable
        const chartTitle = populationCard.querySelector('.chart-header h3');
        if (chartTitle && !chartTitle.hasAttribute('data-drilldown-enabled')) {
            chartTitle.style.cursor = 'pointer';
            chartTitle.setAttribute('data-drilldown-enabled', 'true');
            chartTitle.onclick = () => {
                window.location.hash = 'population';
            };
            chartTitle.setAttribute('title', 'Click to view all population statistics');
            console.log('✅ Made population title clickable!');
        }
        
        console.log('✅ Population drill-down features added successfully!');
    }, 3000); // Wait 3 seconds for charts to load
}

/**
 * Show political timeline drill-down view
 */
function showPoliticalTimelineView() {
    console.log('🏛️ Showing political timeline drill-down view');
    currentView = 'politicalTimeline';
    
    const mainView = document.getElementById('main-dashboard');
    let drilldownView = document.getElementById('drilldown-view');
    
    // Hide main dashboard
    if (mainView) mainView.style.display = 'none';
    
    // Create drill-down view if it doesn't exist
    if (!drilldownView) {
        drilldownView = createDrilldownView();
    }
    
    drilldownView.style.display = 'block';
    
    // Update page title and header breadcrumb
    document.title = 'Riksdata - Political Timeline';
    updateHeaderBreadcrumb('Political Timeline');
    
    // Scroll to top of page
    window.scrollTo(0, 0);
    
    // Load political timeline
    loadPoliticalTimeline();
}

/**
 * Load political timeline for drill-down view
 */
async function loadPoliticalTimeline() {
    const chartsContainer = document.getElementById('drilldown-charts-container');
    if (!chartsContainer) return;
    
    // Clear existing content
    chartsContainer.innerHTML = '';
    
    try {
        // Load political timeline data
        const response = await fetch('./data/static/political-timeline.json?v=' + Date.now());
        if (!response.ok) {
            throw new Error(`Failed to load political timeline: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🏛️ Loaded political timeline data:', data);
        console.log('🏛️ Total governments found:', data.governments.length);
        
        // Create timeline container
        const timelineContainer = document.createElement('div');
        timelineContainer.className = 'political-timeline-container';
        timelineContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
            padding: 2rem;
            max-width: 1400px;
            margin: 0 auto;
        `;
        
        // Create government cards (newest first - reverse chronological)
        const reversedGovernments = data.governments.slice().reverse();
        console.log('🏛️ Creating cards for governments:', reversedGovernments.map(g => g.name));
        
        reversedGovernments.forEach((government, index) => {
            const card = createGovernmentCard(government, data.parties);
            timelineContainer.appendChild(card);
        });
        
        chartsContainer.appendChild(timelineContainer);
        
        console.log('✅ Political timeline loaded successfully!');
        
    } catch (error) {
        console.error('Failed to load political timeline:', error);
        chartsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <h3>Failed to load political timeline</h3>
                <p>Please try refreshing the page.</p>
            </div>
        `;
    }
}

/**
 * Create a government card with PM photo and party logos
 */
function createGovernmentCard(government, parties) {
    const card = document.createElement('div');
    card.className = 'government-card';
    card.style.cssText = `
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 1rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    `;
    
    // Add subtle hover effect (shadow only, no movement)
    card.addEventListener('mouseenter', () => {
        card.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    });
    
    // Party color accent
    const party = parties[government.party];
    const accentColor = party ? party.color : '#666';
    
    // Create card content with horizontal layout
    card.innerHTML = `
        <div style="height: 100%; display: flex; flex-direction: column;">
            <!-- Government Name and Year Header -->
            <div style="margin-bottom: 0.75rem; border-bottom: 3px solid ${accentColor}; padding-bottom: 0.5rem;">
                <a href="${government.wikipediaUrl}" 
                   target="_blank" 
                   style="text-decoration: none; color: inherit;">
                    <h3 style="margin: 0; font-size: 1.3rem; color: var(--text); font-weight: 600;">${government.name}</h3>
                    <p style="margin: 0; color: var(--text-muted); font-size: 0.9rem; font-weight: 500;">${government.years}</p>
                </a>
            </div>
            
            <!-- Horizontal Layout: Image Left, Party Info Right -->
            <div style="display: flex; gap: 1rem; flex: 1;">
                <!-- PM Photo - Left Side -->
                <div style="flex-shrink: 0;">
                    <img src="${government.imageUrl}" 
                         alt="${government.primeMinister}" 
                         style="width: 80px; height: 100px; object-fit: cover; border-radius: 6px; border: 2px solid ${accentColor}; box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);">
                </div>
                
                <!-- Party Information - Right Side -->
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 0.5rem;">
                    <!-- Main Party -->
                    <div style="display: flex; align-items: center; gap: 0.4rem; white-space: nowrap;">
                        <img src="${party?.logoUrl || ''}" 
                             alt="${party?.name || government.party}" 
                             style="width: 20px; height: 20px; object-fit: contain;">
                        <a href="${party?.website || '#'}" 
                           target="_blank" 
                           style="color: ${accentColor}; text-decoration: none; font-weight: 600; font-size: 0.9rem;">
                            ${party?.name || government.party}
                        </a>
                        <span style="color: var(--text-muted); font-size: 0.75rem;">
                            ${government.coalition.length > 0 ? '(Coalition)' : '(Minority)'}
                        </span>
                    </div>
                    
                    <!-- Coalition Partners - Stacked -->
                    ${government.coalition.length > 0 ? `
                        ${government.coalition.map(coalitionParty => {
                            const coalitionPartyData = parties[coalitionParty];
                            return `
                                <div style="display: flex; align-items: center; gap: 0.4rem; white-space: nowrap;">
                                    <img src="${coalitionPartyData?.logoUrl || ''}" 
                                         alt="${coalitionPartyData?.name || coalitionParty}" 
                                         style="width: 18px; height: 18px; object-fit: contain;">
                                    <a href="${coalitionPartyData?.website || '#'}" 
                                       target="_blank"
                                       style="color: var(--text); text-decoration: none; font-weight: 500; font-size: 0.8rem;">
                                        ${coalitionPartyData?.name || coalitionParty}
                                    </a>
                                </div>
                            `;
                        }).join('')}
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// Auto-initialize when module loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDrilldownNavigation);
} else {
    initDrilldownNavigation();
}

