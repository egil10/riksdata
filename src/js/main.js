// ============================================================================
// RIKSDATA MAIN APPLICATION
// ============================================================================

console.log('Main.js module loading...');

import { loadChartData } from './charts.js';
import { showSkeletonLoading, hideSkeletonLoading, showError, debounce, withTimeout, downloadChartForCard, copyChartDataTSV } from './utils.js';

console.log('All modules imported successfully');

// Top-level error guards
window.addEventListener('error', e => {
    console.error('Global error:', e.error || e.message);
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
let currentTheme = 'light';
let isFilterPanelVisible = false;
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
        
        // Show skeleton loading for all charts
        console.log('Showing skeleton loading...');
        updateLoadingStatus('Preparing charts...');
        showSkeletonLoading();
        
        // Show loading progress bar immediately
        if (loadProgressBar) {
            loadProgressBar.classList.add('active');
        }
        
        // Load all charts in parallel with progress tracking
        console.log('Loading charts...');
        updateLoadingStatus('Loading chart data...');
        console.log('Chart.js available:', typeof Chart !== 'undefined');
        
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
        const chartPromises = [
            // Core economic indicators
            loadChartData('cpi-chart', 'https://data.ssb.no/api/v0/dataset/1086.json?lang=en', 'Consumer Price Index'),
            loadChartData('unemployment-chart', 'https://data.ssb.no/api/v0/dataset/1052.json?lang=en', 'Unemployment Rate'),
            loadChartData('house-prices-chart', 'https://data.ssb.no/api/v0/dataset/1060.json?lang=en', 'House Price Index'),
            loadChartData('ppi-chart', 'https://data.ssb.no/api/v0/dataset/26426.json?lang=en', 'Producer Price Index'),
            loadChartData('wage-chart', 'https://data.ssb.no/api/v0/dataset/1124.json?lang=en', 'Wage Index'),
            
            loadChartData('population-growth-chart', 'https://data.ssb.no/api/v0/dataset/49626.json?lang=en', 'Population Growth'),
            loadChartData('construction-costs-chart', 'https://data.ssb.no/api/v0/dataset/26944.json?lang=en', 'Construction Costs'),
            loadChartData('industrial-production-chart', 'https://data.ssb.no/api/v0/dataset/27002.json?lang=en', 'Industrial Production'),
            loadChartData('export-volume-chart', 'https://data.ssb.no/api/v0/dataset/179421.json?lang=en', 'Export Volume'),
            loadChartData('business-confidence-chart', 'https://data.ssb.no/api/v0/dataset/166316.json?lang=en', 'Business Confidence'),
            
            loadChartData('monetary-aggregates-chart', 'https://data.ssb.no/api/v0/dataset/172769.json?lang=en', 'Monetary Aggregates'),
            
            loadChartData('construction-production-chart', 'https://data.ssb.no/api/v0/dataset/924808.json?lang=en', 'Construction Production Index'),
            loadChartData('credit-indicator-chart', 'https://data.ssb.no/api/v0/dataset/166326.json?lang=en', 'Credit Indicator'),
            loadChartData('energy-consumption-chart', 'https://data.ssb.no/api/v0/dataset/928196.json?lang=en', 'Energy Consumption'),
            loadChartData('government-revenue-chart', 'https://data.ssb.no/api/v0/dataset/928194.json?lang=en', 'Government Revenue'),
            loadChartData('international-accounts-chart', 'https://data.ssb.no/api/v0/dataset/924820.json?lang=en', 'International Accounts'),
            loadChartData('labour-cost-index-chart', 'https://data.ssb.no/api/v0/dataset/760065.json?lang=en', 'Labour Cost Index'),
            loadChartData('rd-expenditure-chart', 'https://data.ssb.no/api/v0/dataset/61819.json?lang=en', 'R&D Expenditure'),
            loadChartData('salmon-export-chart', 'https://data.ssb.no/api/v0/dataset/1122.json?lang=en', 'Salmon Export Value'),
            loadChartData('oil-gas-investment-chart', 'https://data.ssb.no/api/v0/dataset/166334.json?lang=en', 'Oil & Gas Investment'),
            loadChartData('immigration-rate-chart', 'https://data.ssb.no/api/v0/dataset/48651.json?lang=en', 'Immigration Rate'),
            loadChartData('household-income-chart', 'https://data.ssb.no/api/v0/dataset/56900.json?lang=en', 'Household Income'),
            
            loadChartData('crime-rate-chart', 'https://data.ssb.no/api/v0/dataset/97445.json?lang=en', 'Crime Rate'),
            loadChartData('education-level-chart', 'https://data.ssb.no/api/v0/dataset/85454.json?lang=en', 'Education Level'),
            loadChartData('greenhouse-gas-chart', 'https://data.ssb.no/api/v0/dataset/832678.json?lang=en', 'Greenhouse Gas Emissions'),
            loadChartData('economic-forecasts-chart', 'https://data.ssb.no/api/v0/dataset/934513.json?lang=en', 'Economic Forecasts'),
            loadChartData('cpi-adjusted-indices-chart', 'https://data.ssb.no/api/v0/dataset/1118.json?lang=en', 'CPI Adjusted Indices'),
            loadChartData('cpi-group-level-chart', 'https://data.ssb.no/api/v0/dataset/1092.json?lang=en', 'CPI Group Level'),
            loadChartData('import-value-volume-sitc-chart', 'https://data.ssb.no/api/v0/dataset/34640.json?lang=en', 'Import Value Volume SITC'),
            loadChartData('export-value-volume-sitc-chart', 'https://data.ssb.no/api/v0/dataset/34642.json?lang=en', 'Export Value Volume SITC'),
            loadChartData('tax-returns-main-items-chart', 'https://data.ssb.no/api/v0/dataset/49656.json?lang=en', 'Tax Returns Main Items'),
            loadChartData('public-administration-expenditures-chart', 'https://data.ssb.no/api/v0/dataset/112175.json?lang=en', 'Public Administration Expenditures'),
            loadChartData('money-supply-m0-chart', 'https://data.ssb.no/api/v0/dataset/172771.json?lang=en', 'Money Supply M0'),

            loadChartData('money-supply-m3-net-claims-chart', 'https://data.ssb.no/api/v0/dataset/172800.json?lang=en', 'Money Supply M3 Net Claims'),
            loadChartData('import-value-volume-sitc1-chart', 'https://data.ssb.no/api/v0/dataset/34254.json?lang=en', 'Import Value Volume SITC1'),
            loadChartData('export-value-volume-sitc1-chart', 'https://data.ssb.no/api/v0/dataset/34256.json?lang=en', 'Export Value Volume SITC1'),
            loadChartData('oil-gas-industry-turnover-chart', 'https://data.ssb.no/api/v0/dataset/124341.json?lang=en', 'Oil Gas Industry Turnover'),
            loadChartData('living-arrangements-national-chart', 'https://data.ssb.no/api/v0/dataset/86813.json?lang=en', 'Living Arrangements National', 'bar'),
            loadChartData('cpi-seasonally-adjusted-chart', 'https://data.ssb.no/api/v0/dataset/45590.json?lang=en', 'CPI Seasonally Adjusted'),
            loadChartData('credit-indicator-k2-detailed-chart', 'https://data.ssb.no/api/v0/dataset/62264.json?lang=en', 'Credit Indicator K2 Detailed'),
            loadChartData('first-hand-price-index-chart', 'https://data.ssb.no/api/v0/dataset/82677.json?lang=en', 'First Hand Price Index'),
            loadChartData('first-hand-price-index-groups-chart', 'https://data.ssb.no/api/v0/dataset/82679.json?lang=en', 'First Hand Price Index Groups'),
            loadChartData('cpi-adjusted-delivery-sector-chart', 'https://data.ssb.no/api/v0/dataset/130297.json?lang=en', 'CPI Adjusted Delivery Sector'),

            
            // Norges Bank data
            loadChartData('interest-rate-chart', 'https://data.norges-bank.no/api/data/IR/M.KPRA.SD.?format=sdmx-json&startPeriod=1945-01-01&endPeriod=2025-08-01&locale=en', 'Key Policy Rate'),
            loadChartData('govt-debt-chart', 'https://data.norges-bank.no/api/data/GOVT_KEYFIGURES/V_O+N_V+V_I+ATRI+V_IRS..B.GBON?endPeriod=2025-08-01&format=sdmx-json&locale=no&startPeriod=1945-01-01', 'Government Debt', 'line'),
            
            // Oslo Stock Exchange data
            loadChartData('oseax-chart', './data/cached/oslo-indices/oseax.json', 'OSEAX - Oslo Stock Exchange All Share Index'),
            
            
            
            // Additional charts that exist in HTML
            loadChartData('household-consumption-chart', 'https://data.ssb.no/api/v0/dataset/166330.json?lang=en', 'Household Consumption'),
            loadChartData('immigrants-with-immigrant-parents-chart', 'https://data.ssb.no/api/v0/dataset/96304.json?lang=en', 'Immigrants with Immigrant Parents'),
            loadChartData('credit-indicator-k3-chart', 'https://data.ssb.no/api/v0/dataset/166327.json?lang=en', 'Credit Indicator K3'),
            loadChartData('first-hand-price-index-subgroups-chart', 'https://data.ssb.no/api/v0/dataset/82681.json?lang=en', 'First Hand Price Index Subgroups'),
            loadChartData('credit-indicator-k2-seasonally-adjusted-chart', 'https://data.ssb.no/api/v0/dataset/166329.json?lang=en', 'Credit Indicator K2 Seasonally Adjusted'),

            // Removed: retail-sales-seasonally-adjusted-chart (dataset 1065 failed to fetch)
            loadChartData('import-value-sitc3-chart', 'https://data.ssb.no/api/v0/dataset/34641.json?lang=en', 'Import Value SITC3'),
            loadChartData('export-value-sitc3-chart', 'https://data.ssb.no/api/v0/dataset/34643.json?lang=en', 'Export Value SITC3'),
            loadChartData('trade-volume-price-bec-chart', 'https://data.ssb.no/api/v0/dataset/179415.json?lang=en', 'Trade Volume Price BEC'),
            loadChartData('producer-price-index-industries-chart', 'https://data.ssb.no/api/v0/dataset/26430.json?lang=en', 'Producer Price Index Industries'),
            loadChartData('trade-volume-price-product-groups-chart', 'https://data.ssb.no/api/v0/dataset/179417.json?lang=en', 'Trade Volume Price Product Groups'),
            loadChartData('producer-price-index-products-chart', 'https://data.ssb.no/api/v0/dataset/26431.json?lang=en', 'Producer Price Index Products'),
            loadChartData('business-cycle-barometer-products-chart', 'https://data.ssb.no/api/v0/dataset/166317.json?lang=en', 'Business Cycle Barometer Products'),

            loadChartData('household-income-national-chart', 'https://data.ssb.no/api/v0/dataset/56957.json?lang=en', 'Household Income National'),
            loadChartData('oil-gas-industry-turnover-sn2007-chart', 'https://data.ssb.no/api/v0/dataset/124322.json?lang=en', 'Oil Gas Industry Turnover SN2007'),
            loadChartData('producer-price-index-subgroups-detailed-chart', 'https://data.ssb.no/api/v0/dataset/26432.json?lang=en', 'Producer Price Index Subgroups Detailed'),
            loadChartData('monetary-m3-chart', 'https://data.ssb.no/api/v0/dataset/172793.json?lang=en', 'Monetary Aggregate M3'),
            
            // Additional charts that exist in HTML but weren't being loaded (only those with cache files)

            loadChartData('bankruptcies-total-chart', 'https://data.ssb.no/api/v0/dataset/924816.json?lang=en', 'Bankruptcies Total'),
            loadChartData('basic-salary-chart', 'https://data.ssb.no/api/v0/dataset/1126.json?lang=en', 'Basic Salary Index'),
            loadChartData('construction-cost-multi-chart', 'https://data.ssb.no/api/v0/dataset/1058.json?lang=en', 'Construction Cost Multi'),
            loadChartData('construction-cost-wood-chart', 'https://data.ssb.no/api/v0/dataset/1056.json?lang=en', 'Construction Cost Wood'),
            loadChartData('cpi-coicop-chart', 'https://data.ssb.no/api/v0/dataset/1084.json?lang=en', 'CPI Coicop Divisions'),
            loadChartData('cpi-delivery-chart', 'https://data.ssb.no/api/v0/dataset/1100.json?lang=en', 'CPI Delivery Sectors'),
            loadChartData('cpi-items-chart', 'https://data.ssb.no/api/v0/dataset/1096.json?lang=en', 'CPI Items'),
            loadChartData('cpi-subgroups-chart', 'https://data.ssb.no/api/v0/dataset/1090.json?lang=en', 'CPI Sub-Groups'),
            loadChartData('education-level-chart', 'https://data.ssb.no/api/v0/dataset/85454.json?lang=en', 'Education Level'),
            loadChartData('household-types-chart', 'https://data.ssb.no/api/v0/dataset/1068.json?lang=en', 'Household Types'),
            loadChartData('producer-price-industry-chart', 'https://data.ssb.no/api/v0/dataset/741023.json?lang=en', 'Producer Price Industry'),
            loadChartData('utility-floor-space-chart', 'https://data.ssb.no/api/v0/dataset/95177.json?lang=en', 'Utility Floor Space'),

            // Removed: energy-accounts-chart (dataset 928197 failed to fetch)
        ];
        
        console.log('Total charts to load:', chartPromises.length);
        
        // Wait for all charts to load with progress tracking and timeouts
        console.log('Waiting for charts to load...');
        console.log(`Total charts to load: ${chartPromises.length}`);
        const totalCharts = chartPromises.length;
        
        // Wrap each chart promise with timeout and error handling
        const chartPromisesWithTimeout = chartPromises.map((promise, index) => 
            withTimeout(promise, 10000).catch(error => {
                console.error(`Chart ${index} failed with timeout or error:`, error);
                return null; // Return null instead of throwing to prevent Promise.allSettled from failing
            })
        );
        
        // Use Promise.allSettled to prevent deadlocks if any chart fails
        console.log('Starting Promise.allSettled...');
        updateLoadingStatus('Fetching latest data');
        const results = await Promise.allSettled(chartPromisesWithTimeout);
        console.log('Promise.allSettled completed');
        
        // Update progress based on completion with smooth animation
        console.log('Starting progress update loop...');
        let completedCharts = 0;
        for (let i = 0; i < results.length; i++) {
            completedCharts++;
            const progress = (completedCharts / totalCharts) * 100;
            console.log(`Progress: ${progress.toFixed(1)}% (${completedCharts}/${totalCharts})`);
            if (loadProgressBar) {
                loadProgressBar.style.width = `${progress}%`;
            }
            // Remove the delay - it was causing the 10-second load time
        }
        console.log('Progress update loop completed');
        
        // Log results for debugging
        let successCount = 0;
        let failureCount = 0;
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
                successCount++;
                console.log(`Chart ${index} loaded successfully`);
            } else {
                failureCount++;
                console.error(`Chart ${index} failed:`, result.reason);
            }
        });
        
        console.log(`Chart loading results: ${successCount} successful, ${failureCount} failed`);
        
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
    
    // Initialize theme from localStorage
    initializeTheme();
    
    // Language toggle
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', toggleLanguage);
    }

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Filter toggle
    const filterToggle = document.getElementById('filterToggle');
    if (filterToggle) {
        filterToggle.addEventListener('click', toggleFilterPanel);
    }

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Search functionality
    const searchInput = document.getElementById('chartSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // Source filters
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', handleSourceFilter);
    });

    // Sort toggle
    const sortToggle = document.getElementById('sortToggle');
    if (sortToggle) {
        sortToggle.addEventListener('click', toggleSort);
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
    
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.textContent = currentLanguage === 'en' ? 'NO' : 'EN';
    }
    
    updateLanguageTexts();
}

/**
 * Initialize theme from localStorage
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        currentTheme = savedTheme;
        document.documentElement.classList.toggle('dark-mode', currentTheme === 'dark');
        
        // Update icon to match saved theme
        const themeIcon = document.querySelector('#themeToggle .theme-icon');
        if (themeIcon) {
            themeIcon.innerHTML = currentTheme === 'dark' 
                ? '<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/>'
                : '<path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>';
        }
    }
}

/**
 * Toggle theme between light and dark (highly optimized for speed)
 */
function toggleTheme() {
    // Toggle theme state
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Apply dark mode class to html element (fastest possible transition)
    document.documentElement.classList.toggle('dark-mode', currentTheme === 'dark');
    
    // Update icon efficiently (pre-optimized SVG paths)
    const themeIcon = document.querySelector('#themeToggle .theme-icon');
    if (themeIcon) {
        themeIcon.innerHTML = currentTheme === 'dark' 
            ? '<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/>'
            : '<path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>';
    }
    
    // Store preference efficiently
    localStorage.setItem('theme', currentTheme);
    
    // Update chart colors without re-rendering (CSS variables handle most changes)
    updateChartColorsForTheme();
}

/**
 * Update chart colors for current theme (highly optimized)
 */
function updateChartColorsForTheme() {
    const isDark = currentTheme === 'dark';
    const isMobile = window.innerWidth < 768;
    
    // Get CSS variables for consistent theming
    const axisColor = getComputedStyle(document.documentElement).getPropertyValue('--axis-color').trim();
    const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--grid-color').trim();
    
    // Update chart instances efficiently
    if (window.chartInstances) {
        Object.values(window.chartInstances).forEach(chart => {
            if (chart && chart.options) {
                // Update axis colors using CSS variables
                if (chart.options.scales?.x?.ticks) {
                    chart.options.scales.x.ticks.color = axisColor;
                    chart.options.scales.x.ticks.font.size = isMobile ? 8 : 12;
                }
                if (chart.options.scales?.y?.ticks) {
                    chart.options.scales.y.ticks.color = axisColor;
                    chart.options.scales.y.ticks.font.size = isMobile ? 8 : 12;
                }
                
                // Update grid colors using CSS variables
                if (chart.options.scales?.x?.grid) {
                    chart.options.scales.x.grid.color = gridColor;
                }
                if (chart.options.scales?.y?.grid) {
                    chart.options.scales.y.grid.color = gridColor;
                }
                
                // Update without animation for maximum speed
                chart.update('none');
            }
        });
    }
}

/**
 * Toggle filter panel visibility
 */
function toggleFilterPanel() {
    const filterPanel = document.getElementById('filterPanel');
    if (filterPanel) {
        isFilterPanelVisible = !isFilterPanelVisible;
        filterPanel.style.display = isFilterPanelVisible ? 'block' : 'none';
    }
}

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
    
    // Update chart colors and fonts for new screen size
    updateChartColorsForTheme();
    
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
    const searchTerm = event.target.value.toLowerCase();
    const chartCards = document.querySelectorAll('.chart-card');
    
    chartCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const source = card.querySelector('.source-link').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || source.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * Handle source filter
 * @param {Event} event - Filter button click event
 */
function handleSourceFilter(event) {
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
        const sourceLink = card.querySelector('.source-link');
        const cardSource = sourceLink.textContent.includes('SSB') ? 'ssb' : 
                          sourceLink.textContent.includes('Norges Bank') ? 'norges-bank' : 'static';
        
        if (source === 'all' || cardSource === source) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * Sort charts alphabetically by default
 */
function sortChartsAlphabetically() {
    const chartGrid = document.querySelector('.chart-grid');
    const chartCards = Array.from(document.querySelectorAll('.chart-card'));
    
    // Sort alphabetically
    chartCards.sort((a, b) => {
        const titleA = a.querySelector('h3').textContent;
        const titleB = b.querySelector('h3').textContent;
        return titleA.localeCompare(titleB);
    });
    
    // Re-append cards in new order
    chartCards.forEach(card => {
        chartGrid.appendChild(card);
    });
}

/**
 * Toggle alphabetical sorting
 */
function toggleSort() {
    const sortToggle = document.getElementById('sortToggle');
    const chartGrid = document.querySelector('.chart-grid');
    const chartCards = Array.from(document.querySelectorAll('.chart-card'));
    
    if (sortToggle.textContent === 'A-Z') {
        // Sort reverse alphabetically
        chartCards.sort((a, b) => {
            const titleA = a.querySelector('h3').textContent;
            const titleB = b.querySelector('h3').textContent;
            return titleB.localeCompare(titleA);
        });
        sortToggle.textContent = 'Z-A';
        sortToggle.classList.add('active');
    } else {
        // Sort alphabetically
        chartCards.sort((a, b) => {
            const titleA = a.querySelector('h3').textContent;
            const titleB = b.querySelector('h3').textContent;
            return titleA.localeCompare(titleB);
        });
        sortToggle.textContent = 'A-Z';
        sortToggle.classList.remove('active');
    }
    
    // Re-append cards in new order
    chartCards.forEach(card => {
        chartGrid.appendChild(card);
    });
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
    const searchInput = document.getElementById('chartSearch');
    if (searchInput) {
        searchInput.placeholder = lang === 'no' ? 'Søk i diagrammer...' : 'Search charts...';
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
        
        // Load saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            currentTheme = 'dark';
            document.body.classList.add('dark-mode');
            // Set moon icon for dark mode
            const themeIcon = document.querySelector('#themeToggle .theme-icon');
            if (themeIcon) {
                themeIcon.innerHTML = '<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/>';
            }
        } else {
            // Default to light theme
            currentTheme = 'light';
            document.body.classList.remove('dark-mode');
            // Moon icon is already set in HTML for light mode
        }
        
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
const chartDataRegistry = new Map();

export function registerChartData(id, dataArray) {
    chartDataRegistry.set(id, dataArray);
}

function getDataById(id) {
    return chartDataRegistry.get(id) || [];
}

// ---- Chart Actions: Download / Copy ----
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.icon-btn');
    if (!btn) return;
    
    const card = btn.closest('.chart-card');
    if (!card) return;
    
    const action = btn.getAttribute('data-action');
    if (action === 'download') {
        downloadChartForCard(card);
    } else if (action === 'copy') {
        copyChartDataTSV(card, getDataById);
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
