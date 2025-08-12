// ============================================================================
// RIKSDATA UTILITY FUNCTIONS
// ============================================================================

import { POLITICAL_PERIODS } from './config.js';

/**
 * Get political period for a given date
 * @param {Date|string} date - The date to check
 * @returns {Object|null} Political period object or null if not found
 */
export function getPoliticalPeriod(date) {
    const targetDate = new Date(date);
    for (const period of POLITICAL_PERIODS) {
        const startDate = new Date(period.start);
        const endDate = new Date(period.end);
        if (targetDate >= startDate && targetDate <= endDate) {
            return period;
        }
    }
    return null;
}

/**
 * Parse SSB time labels (e.g., "2023M01" -> Date object)
 * @param {string} timeLabel - The time label to parse
 * @returns {Date|null} Parsed date or null if invalid
 */
export function parseTimeLabel(timeLabel) {
    try {
        // Handle monthly format: "2023M01"
        if (timeLabel.includes('M')) {
            const [year, month] = timeLabel.split('M');
            return new Date(parseInt(year), parseInt(month) - 1, 1);
        }
        
        // Handle quarterly format: "2023K1", "2023K2", etc.
        if (timeLabel.includes('K')) {
            const [year, quarter] = timeLabel.split('K');
            const quarterNum = parseInt(quarter);
            const month = (quarterNum - 1) * 3; // K1=Jan, K2=Apr, K3=Jul, K4=Oct
            return new Date(parseInt(year), month, 1);
        }
        
        // Handle yearly format: "2023"
        if (/^\d{4}$/.test(timeLabel)) {
            return new Date(parseInt(timeLabel), 0, 1);
        }
        
        // Handle other formats as needed
        return new Date(timeLabel);
        
    } catch (error) {
        console.error('Error parsing time label:', timeLabel, error);
        return null;
    }
}

/**
 * Aggregate data by month for bar charts
 * @param {Array} data - Array of data points with date and value
 * @returns {Array} Aggregated data by month
 */
export function aggregateDataByMonth(data) {
    const monthlyData = {};
    
    data.forEach(item => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                date: new Date(date.getFullYear(), date.getMonth(), 1),
                value: 0,
                count: 0
            };
        }
        
        monthlyData[monthKey].value += item.value;
        monthlyData[monthKey].count += 1;
    });
    
    // Calculate averages and sort by date
    return Object.values(monthlyData)
        .map(item => ({
            date: item.date,
            value: item.value / item.count
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Show error message on canvas
 * @param {string} message - Error message to display
 * @param {HTMLElement} canvas - Canvas element to show error on
 */
export function showError(message, canvas = null) {
    if (canvas) {
        canvas.style.display = 'none';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'chart-error';
        errorDiv.innerHTML = `<p>${message}</p>`;
        canvas.parentNode.appendChild(errorDiv);
    } else {
        console.error('Error:', message);
    }
}

/**
 * Show skeleton loading for all charts
 */
export function showSkeletonLoading() {
    const skeletonIds = [
        'cpi-skeleton', 'unemployment-skeleton', 'house-prices-skeleton', 'ppi-skeleton',
        'wage-skeleton', 'oil-fund-skeleton', 'exchange-skeleton', 'interest-rate-skeleton',
        'govt-debt-skeleton', 'gdp-growth-skeleton', 'trade-balance-skeleton', 'bankruptcies-skeleton',
        'population-growth-skeleton', 'construction-costs-skeleton',
        'industrial-production-skeleton', 'retail-sales-skeleton', 'export-volume-skeleton', 'import-volume-skeleton',
        'eur-exchange-skeleton', 'employment-rate-skeleton', 'business-confidence-skeleton', 'consumer-confidence-skeleton',
        'housing-starts-skeleton', 'oil-price-skeleton',
        'monetary-aggregates-skeleton', 'job-vacancies-skeleton', 'household-consumption-skeleton', 'producer-prices-skeleton',
        'construction-production-skeleton', 'credit-indicator-skeleton', 'energy-consumption-skeleton', 'government-revenue-skeleton',
        'international-accounts-skeleton',
        'labour-cost-index-skeleton', 'rd-expenditure-skeleton', 'salmon-export-skeleton', 'oil-gas-investment-skeleton',
        'immigration-rate-skeleton', 'household-income-skeleton', 'life-expectancy-skeleton', 'crime-rate-skeleton',
        'education-level-skeleton', 'holiday-property-sales-skeleton', 'greenhouse-gas-skeleton', 'economic-forecasts-skeleton',
        'new-dwellings-price-skeleton', 'lifestyle-habits-skeleton', 'long-term-illness-skeleton',
        'population-growth-skeleton', 'births-deaths-skeleton', 'cpi-ate-skeleton', 'salmon-export-volume-skeleton',
        'basic-salary-skeleton', 'export-country-skeleton', 'import-country-skeleton', 'export-commodity-skeleton',
        'import-commodity-skeleton', 'construction-cost-wood-skeleton', 'construction-cost-multi-skeleton', 'wholesale-retail-skeleton',
        'household-types-skeleton', 'population-age-skeleton', 'cpi-coicop-skeleton', 'cpi-subgroups-skeleton',
        'cpi-items-skeleton', 'cpi-delivery-skeleton', 'household-income-size-skeleton', 'cohabiting-arrangements-skeleton',
        'utility-floor-space-skeleton', 'credit-indicator-c2-skeleton', 'job-vacancies-new-skeleton', 'oil-gas-turnover-skeleton',
        'trade-volume-price-skeleton', 'producer-price-industry-skeleton', 'deaths-age-skeleton', 'construction-production-skeleton',
        'bankruptcies-total-skeleton', 'energy-accounts-skeleton', 'monetary-m3-skeleton', 'new-dwellings-price-skeleton',
        'business-tendency-skeleton'
    ];
    
    skeletonIds.forEach(id => {
        const skeleton = document.getElementById(id);
        if (skeleton) {
            skeleton.style.display = 'block';
        }
    });
}

/**
 * Hide skeleton loading
 */
export function hideSkeletonLoading() {
    const skeletonIds = [
        'cpi-skeleton', 'unemployment-skeleton', 'house-prices-skeleton', 'ppi-skeleton',
        'wage-skeleton', 'oil-fund-skeleton', 'exchange-skeleton', 'interest-rate-skeleton',
        'govt-debt-skeleton', 'gdp-growth-skeleton', 'trade-balance-skeleton', 'bankruptcies-skeleton',
        'population-growth-skeleton', 'construction-costs-skeleton',
        'industrial-production-skeleton', 'retail-sales-skeleton', 'export-volume-skeleton', 'import-volume-skeleton',
        'eur-exchange-skeleton', 'employment-rate-skeleton', 'business-confidence-skeleton', 'consumer-confidence-skeleton',
        'housing-starts-skeleton', 'oil-price-skeleton',
        'monetary-aggregates-skeleton', 'job-vacancies-skeleton', 'household-consumption-skeleton', 'producer-prices-skeleton',
        'construction-production-skeleton', 'credit-indicator-skeleton', 'energy-consumption-skeleton', 'government-revenue-skeleton',
        'international-accounts-skeleton',
        'labour-cost-index-skeleton', 'rd-expenditure-skeleton', 'salmon-export-skeleton', 'oil-gas-investment-skeleton',
        'immigration-rate-skeleton', 'household-income-skeleton', 'life-expectancy-skeleton', 'crime-rate-skeleton',
        'education-level-skeleton', 'holiday-property-sales-skeleton', 'greenhouse-gas-skeleton', 'economic-forecasts-skeleton',
        'new-dwellings-price-skeleton', 'lifestyle-habits-skeleton', 'long-term-illness-skeleton',
        'population-growth-skeleton', 'births-deaths-skeleton', 'cpi-ate-skeleton', 'salmon-export-volume-skeleton',
        'basic-salary-skeleton', 'export-country-skeleton', 'import-country-skeleton', 'export-commodity-skeleton',
        'import-commodity-skeleton', 'construction-cost-wood-skeleton', 'construction-cost-multi-skeleton', 'wholesale-retail-skeleton',
        'household-types-skeleton', 'population-age-skeleton', 'cpi-coicop-skeleton', 'cpi-subgroups-skeleton',
        'cpi-items-skeleton', 'cpi-delivery-skeleton', 'household-income-size-skeleton', 'cohabiting-arrangements-skeleton',
        'utility-floor-space-skeleton', 'credit-indicator-c2-skeleton', 'job-vacancies-new-skeleton', 'oil-gas-turnover-skeleton',
        'trade-volume-price-skeleton', 'producer-price-industry-skeleton', 'deaths-age-skeleton', 'construction-production-skeleton',
        'bankruptcies-total-skeleton', 'energy-accounts-skeleton', 'monetary-m3-skeleton', 'new-dwellings-price-skeleton',
        'business-tendency-skeleton'
    ];
    
    skeletonIds.forEach(id => {
        const skeleton = document.getElementById(id);
        if (skeleton) {
            skeleton.style.display = 'none';
        }
    });
}

/**
 * Update static tooltip
 * @param {Chart} chart - Chart.js instance
 * @param {string} tooltipId - Tooltip element ID
 * @param {Object} context - Chart context
 */
export function updateStaticTooltip(chart, tooltipId, context) {
    const tooltipElement = document.getElementById(tooltipId);
    if (!tooltipElement) return;
    
    const value = context.parsed.y;
    const date = new Date(context.parsed.x);
    const label = context.dataset.label;
    
    // Get political period information
    const politicalPeriod = getPoliticalPeriod(date);
    let politicalInfo = '';
    if (politicalPeriod) {
        politicalInfo = `
            <div class="tooltip-political">
                <span class="tooltip-party" style="background-color: ${politicalPeriod.color}"></span>
                ${politicalPeriod.name}
            </div>
        `;
    }
    
    tooltipElement.innerHTML = `
        <div class="tooltip-content">
            <div class="tooltip-title">${label}</div>
            <div class="tooltip-value">${value.toFixed(2)}</div>
            <div class="tooltip-date">${date.toLocaleDateString()}</div>
            ${politicalInfo}
        </div>
    `;
    
    tooltipElement.style.display = 'block';
}

/**
 * Hide static tooltip
 * @param {string} tooltipId - Tooltip element ID
 */
export function hideStaticTooltip(tooltipId) {
    const tooltipElement = document.getElementById(tooltipId);
    if (tooltipElement) {
        tooltipElement.style.display = 'none';
    }
}

/**
 * Format number for display
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export function formatNumber(value, decimals = 2) {
    return value.toFixed(decimals);
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
