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
    
    // Add drill-down button to bankruptcies total chart
    addDrilldownButton();
}

/**
 * Handle URL hash changes
 */
function handleHashChange() {
    const hash = window.location.hash.slice(1); // Remove the '#'
    
    console.log(`📍 Hash changed to: ${hash || '(empty)'}`);
    
    if (hash === 'bankruptcies') {
        showBankruptciesView();
    } else {
        showMainDashboard();
    }
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
 * Create a chart card element
 */
function createChartCard(config) {
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
                ${config.subtitle ? `<p class="chart-subtitle">${config.subtitle}</p>` : ''}
                <a href="https://www.ssb.no/" target="_blank" class="source-link">SSB</a>
            </div>
        </div>
        <div class="chart-container">
            <div class="skeleton-loader" id="${config.id}-skeleton">
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
            </div>
            <canvas id="${config.id}"></canvas>
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
        // Show breadcrumb
        appTitle.innerHTML = `
            <span onclick="window.location.hash = ''" style="cursor: pointer;">Riksdata</span>
            <span style="opacity: 0.5; margin: 0 0.5rem;">→</span>
            <span style="font-weight: 500;">${subtitle}</span>
        `;
    } else {
        // Reset to default
        appTitle.innerHTML = 'Riksdata';
        appTitle.onclick = () => window.location.reload();
    }
}

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

// Auto-initialize when module loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDrilldownNavigation);
} else {
    initDrilldownNavigation();
}

