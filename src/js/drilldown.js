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
    addImportsDrilldownButton();
    addVaccinationsDrilldownButton();
    addDFODrilldownButton();
    addOilFundDrilldownButton();
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
    } else if (hash === 'imports') {
        showImportsView();
    } else if (hash === 'vaccinations') {
        showVaccinationsView();
    } else if (hash === 'dfo') {
        showDFOView();
    } else if (hash === 'oilfund') {
        showOilFundView();
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
    
    // Update page title and header breadcrumb
    document.title = 'Riksdata - Consumer Price Index Variations';
    updateHeaderBreadcrumb('CPI Variations');
    
    // Load all CPI charts
    loadCPICharts();
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
 * Clear search and go to home
 */
window.clearSearchAndGoHome = function() {
    // Clear search input
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
    
    // Show all cards
    const chartCards = document.querySelectorAll('.chart-card');
    chartCards.forEach(card => {
        card.style.display = 'block';
    });
    
    // Navigate to home
    window.location.hash = '';
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
        const vaccinationCard = document.querySelector('[data-chart-id="vaccination-chart"]');
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

// Auto-initialize when module loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDrilldownNavigation);
} else {
    initDrilldownNavigation();
}

