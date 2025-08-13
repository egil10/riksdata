// ============================================================================
// RIKSDATA UTILITIES
// ============================================================================

import { CHART_FILTER_CONFIG } from './config.js';

/**
 * Chart Quality Filter - Ensures only high-quality, nationally relevant charts are displayed
 */
export class ChartQualityFilter {
    
    /**
     * Check if a dataset is national-level (not regional/municipal)
     */
    static isNationalDataset(datasetTitle, datasetId) {
        const title = datasetTitle.toLowerCase();
        const id = datasetId.toString();
        
        // Check if it's in the always include list
        if (CHART_FILTER_CONFIG.alwaysInclude.some(keyword => 
            title.includes(keyword) || id.includes(keyword))) {
            return true;
        }
        
        // Check if it's in the exclude list
        if (CHART_FILTER_CONFIG.excludeList.some(keyword => 
            title.includes(keyword) || id.includes(keyword))) {
            return false;
        }
        
        // Check for regional keywords (exclude these)
        if (CHART_FILTER_CONFIG.regionalKeywords.some(keyword => 
            title.includes(keyword))) {
            return false;
        }
        
        // Check for national keywords (include these)
        if (CHART_FILTER_CONFIG.nationalKeywords.some(keyword => 
            title.includes(keyword))) {
            return true;
        }
        
        // Default: include if no regional keywords found
        return !CHART_FILTER_CONFIG.regionalKeywords.some(keyword => 
            title.includes(keyword));
    }
    
    /**
     * Analyze data quality and determine if chart should be displayed
     */
    static analyzeDataQuality(data, datasetTitle, datasetId) {
        if (!data || !data.dataset || !data.dataset.value) {
            return {
                shouldDisplay: false,
                reason: 'No data available',
                quality: 0
            };
        }
        
        const values = data.dataset.value;
        const timeData = data.dataset.dimension.Tid?.category?.index || {};
        const timeLabels = data.dataset.dimension.Tid?.category?.label || {};
        
        // Count data points
        const dataPoints = Object.keys(values).length;
        
        // Count null/undefined values
        const nullCount = Object.values(values).filter(v => 
            v === null || v === undefined || v === '' || isNaN(v)).length;
        const nullPercentage = (nullCount / dataPoints) * 100;
        
        // Calculate time span
        const timeKeys = Object.keys(timeData);
        const timeSpan = timeKeys.length;
        
        // Check if it's national data
        const isNational = this.isNationalDataset(datasetTitle, datasetId);
        
        // Calculate quality score (0-100)
        let qualityScore = 100;
        
        if (dataPoints < CHART_FILTER_CONFIG.minDataPoints) {
            qualityScore -= 30;
        }
        
        if (nullPercentage > CHART_FILTER_CONFIG.maxNullPercentage) {
            qualityScore -= 25;
        }
        
        if (timeSpan < CHART_FILTER_CONFIG.minTimeSpan) {
            qualityScore -= 20;
        }
        
        if (!isNational) {
            qualityScore -= 15;
        }
        
        // Determine if chart should be displayed
        const shouldDisplay = qualityScore >= 70 && isNational;
        
        return {
            shouldDisplay,
            reason: shouldDisplay ? 'High quality national data' : this.getRejectionReason(dataPoints, nullPercentage, timeSpan, isNational),
            quality: Math.max(0, qualityScore),
            metrics: {
                dataPoints,
                nullPercentage,
                timeSpan,
                isNational
            }
        };
    }
    
    /**
     * Get rejection reason for low-quality charts
     */
    static getRejectionReason(dataPoints, nullPercentage, timeSpan, isNational) {
        const reasons = [];
        
        if (dataPoints < CHART_FILTER_CONFIG.minDataPoints) {
            reasons.push(`Insufficient data points (${dataPoints}/${CHART_FILTER_CONFIG.minDataPoints})`);
        }
        
        if (nullPercentage > CHART_FILTER_CONFIG.maxNullPercentage) {
            reasons.push(`Too many null values (${nullPercentage.toFixed(1)}% > ${CHART_FILTER_CONFIG.maxNullPercentage}%)`);
        }
        
        if (timeSpan < CHART_FILTER_CONFIG.minTimeSpan) {
            reasons.push(`Insufficient time span (${timeSpan} months < ${CHART_FILTER_CONFIG.minTimeSpan} months)`);
        }
        
        if (!isNational) {
            reasons.push('Not national-level data');
        }
        
        return reasons.join(', ');
    }
    
    /**
     * Filter chart list to only include high-quality charts
     */
    static filterChartList(chartList, cachedData) {
        const filteredCharts = [];
        const excludedCharts = [];
        
        for (const chart of chartList) {
            const cacheName = chart.cacheName || chart.id;
            const data = cachedData[cacheName];
            
            if (data) {
                const quality = this.analyzeDataQuality(data, chart.title, chart.datasetId);
                
                if (quality.shouldDisplay) {
                    filteredCharts.push({
                        ...chart,
                        quality: quality.quality,
                        qualityMetrics: quality.metrics
                    });
                } else {
                    excludedCharts.push({
                        ...chart,
                        quality: quality.quality,
                        reason: quality.reason,
                        qualityMetrics: quality.metrics
                    });
                }
            } else {
                // If no cached data, exclude the chart
                excludedCharts.push({
                    ...chart,
                    quality: 0,
                    reason: 'No cached data available'
                });
            }
        }
        
        return {
            displayCharts: filteredCharts.sort((a, b) => b.quality - a.quality),
            excludedCharts: excludedCharts.sort((a, b) => b.quality - a.quality)
        };
    }
}

/**
 * Enhanced chart loading with quality filtering
 */
export async function loadChartDataWithQualityFilter(chartId, dataUrl, title, chartType = 'line', datasetId = null) {
    try {
        // Load the data
        const response = await fetch(dataUrl);
        const data = await response.json();
        
        // Analyze quality
        const quality = ChartQualityFilter.analyzeDataQuality(data, title, datasetId);
        
        if (!quality.shouldDisplay) {
            console.warn(`Chart ${chartId} excluded: ${quality.reason}`);
            return null; // Don't create chart
        }
        
        // If quality is good, proceed with chart creation
        return loadChartData(chartId, dataUrl, title, chartType);
        
    } catch (error) {
        console.error(`Error loading chart ${chartId}:`, error);
        return null;
    }
}

/**
 * Get chart quality report for all charts
 */
export async function generateQualityReport(chartList, cachedData) {
    const report = {
        total: chartList.length,
        display: 0,
        excluded: 0,
        byReason: {},
        byQuality: {
            excellent: 0, // 90-100
            good: 0,      // 80-89
            fair: 0,      // 70-79
            poor: 0       // 0-69
        }
    };
    
    for (const chart of chartList) {
        const cacheName = chart.cacheName || chart.id;
        const data = cachedData[cacheName];
        
        if (data) {
            const quality = ChartQualityFilter.analyzeDataQuality(data, chart.title, chart.datasetId);
            
            if (quality.shouldDisplay) {
                report.display++;
            } else {
                report.excluded++;
                report.byReason[quality.reason] = (report.byReason[quality.reason] || 0) + 1;
            }
            
            // Categorize by quality score
            if (quality.quality >= 90) report.byQuality.excellent++;
            else if (quality.quality >= 80) report.byQuality.good++;
            else if (quality.quality >= 70) report.byQuality.fair++;
            else report.byQuality.poor++;
        } else {
            report.excluded++;
            report.byReason['No cached data'] = (report.byReason['No cached data'] || 0) + 1;
        }
    }
    
    return report;
}

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
    // Find all skeleton elements dynamically instead of hardcoding IDs
    const skeletonElements = document.querySelectorAll('.skeleton-chart');
    skeletonElements.forEach(skeleton => {
        skeleton.style.display = 'block';
    });
}

/**
 * Hide skeleton loading
 */
export function hideSkeletonLoading() {
    // Find all skeleton elements dynamically instead of hardcoding IDs
    const skeletonElements = document.querySelectorAll('.skeleton-chart');
    skeletonElements.forEach(skeleton => {
        skeleton.style.display = 'none';
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

/**
 * Hide regional-level cards (municipalities, counties, districts, regions)
 */
export function hideRegionalCards() {
    try {
        const terms = ['municipal', 'counties', 'county', 'district', 'regions', 'by county', 'by region'];
        document.querySelectorAll('.chart-card').forEach(card => {
            const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
            if (terms.some(t => title.includes(t))) {
                card.style.display = 'none';
            }
        });
    } catch (_) {}
}

/**
 * Timeout wrapper for promises
 * @param {Promise} promise - Promise to wrap
 * @param {number} ms - Timeout in milliseconds
 * @returns {Promise} Promise with timeout
 */
export async function withTimeout(promise, ms = 15000) {
    let t;
    const timeout = new Promise((_, rej) => t = setTimeout(() => rej(new Error('timeout')), ms));
    try {
        return await Promise.race([promise, timeout]);
    } finally {
        clearTimeout(t);
    }
}

/**
 * Check if a file exists at the given URL
 * @param {string} url - URL to check
 * @returns {Promise<boolean>} True if file exists
 */
export async function fileExists(url) {
    try {
        const response = await fetch(url, { 
            method: 'HEAD',
            cache: 'no-store'
        });
        return response.ok;
    } catch (error) {
        console.warn(`Failed to check if file exists at ${url}:`, error);
        return false;
    }
}

/**
 * Show a user-friendly error message
 * @param {string} message - Error message
 * @param {HTMLElement} element - Optional element to show error near
 */
export function showUserError(message, element = null) {
    console.error('User Error:', message);
    
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-family: Inter, sans-serif;
        font-size: 14px;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
    
    // Allow manual dismissal
    errorDiv.addEventListener('click', () => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    });
}
