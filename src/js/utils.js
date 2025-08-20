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
        
        // Handle year interval format: "2007-2008" (use the first year)
        if (/^\d{4}-\d{4}$/.test(timeLabel)) {
            const [startYear] = timeLabel.split('-');
            return new Date(parseInt(startYear), 0, 1);
        }
        
        // Handle weekly format: "2025U30", "2025U31", etc.
        if (timeLabel.includes('U')) {
            const [year, week] = timeLabel.split('U');
            const yearNum = parseInt(year);
            const weekNum = parseInt(week);
            
            // Calculate the date of the first day of the week (Monday)
            // ISO week 1 is the week containing January 4th
            const jan4 = new Date(yearNum, 0, 4);
            const jan4Day = jan4.getDay(); // 0 = Sunday, 1 = Monday, etc.
            const week1Start = new Date(yearNum, 0, 4 - jan4Day + (jan4Day === 0 ? -6 : 1));
            const targetDate = new Date(week1Start);
            targetDate.setDate(week1Start.getDate() + (weekNum - 1) * 7);
            
            return targetDate;
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
        // Hide the canvas
        canvas.style.display = 'none';
        
        // Find the parent chart card and hide it completely
        const chartCard = canvas.closest('.chart-card');
        if (chartCard) {
            console.log(`Hiding chart card due to error: ${message}`);
            chartCard.style.display = 'none';
        } else {
            // Fallback: just show error message if we can't find the chart card
            const errorDiv = document.createElement('div');
            errorDiv.className = 'chart-error';
            errorDiv.innerHTML = `<p>${message}</p>`;
            canvas.parentNode.appendChild(errorDiv);
        }
    } else {
        console.error('Error:', message);
    }
}

/**
 * Show skeleton loading for all charts
 */
export function showSkeletonLoading() {
    console.log('Showing skeleton loading...');
    // Find all skeleton elements dynamically instead of hardcoding IDs
    const skeletonElements = document.querySelectorAll('.skeleton-chart');
    console.log(`Found ${skeletonElements.length} skeleton elements`);
    skeletonElements.forEach(skeleton => {
        skeleton.style.display = 'block';
    });
    console.log('Skeleton loading shown');
}

/**
 * Hide skeleton loading
 */
export function hideSkeletonLoading() {
    console.log('Hiding skeleton loading...');
    // Find all skeleton elements dynamically instead of hardcoding IDs
    const skeletonElements = document.querySelectorAll('.skeleton-chart');
    console.log(`Found ${skeletonElements.length} skeleton elements`);
    skeletonElements.forEach(skeleton => {
        skeleton.style.display = 'none';
    });
    console.log('Skeleton loading hidden');
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
    
    // Safety checks for context data
    if (!context || !context.parsed || !context.dataset) return;
    
    const value = context.parsed.y;
    const date = new Date(context.parsed.x);
    const label = context.dataset.label || 'Unknown';
    
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

// --- Export helpers for SVG & Canvas ---
export async function downloadChartForCard(cardEl, format = 'png') {
    try {
        console.log('[downloadChartForCard] Starting download process...', format);
        console.log('[downloadChartForCard] Card element:', cardEl);
        
        // Get chart title for filename
        const chartTitle = cardEl?.querySelector?.('h3')?.textContent?.trim() || 'chart';
        console.log('[downloadChartForCard] Chart title:', chartTitle);
        
        const sanitizedTitle = chartTitle.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
        const date = new Date().toISOString().slice(0, 10);
        const filename = `${sanitizedTitle}-${date}.${format}`;
        console.log('[downloadChartForCard] Filename:', filename);
        
        // Check if html2canvas is available
        if (!window.html2canvas) {
            console.error('[downloadChartForCard] html2canvas not available');
            announce?.('Download library not loaded. Please refresh the page.');
            return;
        }
        
        // Handle different formats
        switch (format) {
            case 'html':
                await downloadAsHTML(cardEl, filename, chartTitle);
                break;
            case 'pdf':
                await downloadAsPDF(cardEl, filename, chartTitle);
                break;
            case 'svg':
                await downloadAsSVG(cardEl, filename);
                break;
            case 'png':
            default:
                await downloadAsPNG(cardEl, filename, chartTitle);
                break;
        }
        
    } catch (error) {
        console.error('[downloadChartForCard] Error:', error);
        announce?.('Failed to download chart.');
        
        // Fallback to PNG
        const canvas = cardEl.querySelector('canvas');
        if (canvas) {
            downloadPNG(canvas, getSuggestedFilename(cardEl, 'png'));
        }
    }
}

async function downloadAsPNG(cardEl, filename, chartTitle) {
    console.log('[downloadAsPNG] Starting PNG download...');
    console.log('[downloadAsPNG] Card element:', cardEl);
    
    // Get the original chart instance
    const chartId = cardEl.getAttribute('data-chart-id');
    const originalCanvas = cardEl.querySelector('canvas');
    const originalChart = originalCanvas?.chart;
    
    if (!originalChart) {
        console.error('[downloadAsPNG] No chart instance found');
        announce?.('Chart not ready for download. Please wait a moment and try again.');
        return;
    }
    
    // Create a temporary container for the card with enhanced styling
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 1200px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        padding: 40px;
        font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
        z-index: -1;
    `;
    
    // Clone the card and enhance it for export
    const cardClone = cardEl.cloneNode(true);
    
    // Remove action buttons and source link from the clone
    const actionButtons = cardClone.querySelectorAll('.chart-actions, .source-link');
    actionButtons.forEach(btn => btn.remove());
    
    // Enhance the styling for export
    cardClone.style.cssText = `
        background: white;
        border: none;
        box-shadow: none;
        padding: 0;
        margin: 0;
        width: 100%;
        max-width: none;
    `;
    
    // Enhance header styling
    const header = cardClone.querySelector('.chart-header');
    if (header) {
        header.style.cssText = `
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 2px solid #e5e7eb;
        `;
    }
    
    // Enhance title styling
    const title = cardClone.querySelector('h3');
    if (title) {
        title.style.cssText = `
            font-size: 32px;
            font-weight: 700;
            color: #111827;
            margin: 0 0 16px 0;
            line-height: 1.2;
            letter-spacing: -0.025em;
        `;
    }
    
    // Enhance subtitle styling
    const subtitle = cardClone.querySelector('.chart-subtitle');
    if (subtitle) {
        subtitle.style.cssText = `
            font-size: 20px;
            color: #6b7280;
            font-weight: 500;
            margin: 0;
            line-height: 1.4;
        `;
    }
    
    // Enhance chart container
    const chartContainer = cardClone.querySelector('.chart-container');
    if (chartContainer) {
        chartContainer.style.cssText = `
            width: 100%;
            height: 500px;
            position: relative;
        `;
    }
    
    // Add the enhanced card to the temporary container
    tempContainer.appendChild(cardClone);
    document.body.appendChild(tempContainer);
    
    // Wait a moment for the layout to settle
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Use html2canvas to capture the entire card
    if (window.html2canvas) {
        const canvas = await html2canvas(tempContainer, {
            scale: 3, // Ultra high resolution for better quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 1200, // Increased width for better quality
            height: tempContainer.scrollHeight,
            logging: false,
            imageTimeout: 15000, // Longer timeout for high-res rendering
            onclone: (clonedDoc) => {
                // Ensure the cloned chart renders properly
                const clonedCanvas = clonedDoc.querySelector('canvas');
                if (clonedCanvas && clonedCanvas.chart) {
                    // Force the chart to render at the correct size with high DPI
                    clonedCanvas.chart.resize();
                    clonedCanvas.chart.render();
                    
                    // Set canvas dimensions for high quality
                    const ctx = clonedCanvas.getContext('2d');
                    if (ctx) {
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                    }
                }
                
                // Also ensure the chart container has proper dimensions
                const clonedChartContainer = clonedDoc.querySelector('.chart-container');
                if (clonedChartContainer) {
                    clonedChartContainer.style.height = '600px'; // Increased height
                    clonedChartContainer.style.width = '100%';
                }
            }
        });
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
            download(blob, filename);
            announce?.(`Chart "${chartTitle}" downloaded as PNG!`);
        }, 'image/png', 1.0); // Maximum quality
        
    } else {
        // Fallback to original method if html2canvas is not available
        console.warn('html2canvas not available, falling back to canvas-only download');
        const canvas = cardEl.querySelector('canvas');
        if (canvas) {
            downloadPNG(canvas, filename);
        } else {
            announce?.('Could not download chart.');
        }
    }
    
    // Clean up
    document.body.removeChild(tempContainer);
}

async function downloadAsHTML(cardEl, filename, chartTitle) {
    // Create a standalone HTML file with the chart
    const chartCanvas = cardEl.querySelector('canvas');
    if (!chartCanvas) {
        announce?.('No chart canvas found.');
        return;
    }
    
    // Get the original chart instance
    const originalChart = chartCanvas.chart;
    if (!originalChart) {
        console.error('[downloadAsHTML] No chart instance found');
        announce?.('Chart not ready for download. Please wait a moment and try again.');
        return;
    }
    
    // Get chart data for recreation
    const chartId = cardEl.getAttribute('data-chart-id');
    const chartData = window.getDataById?.(chartId);
    
    // Get political periods data if available
    const politicalPeriods = window.POLITICAL_PERIODS || [];
    
    // Serialize chart data
    const chartConfig = {
        type: originalChart.config.type,
        data: originalChart.data,
        options: {
            ...originalChart.options,
            responsive: true,
            maintainAspectRatio: false,
            animation: false
        }
    };
    
    // Build political periods HTML
    let politicalPeriodsHTML = '';
    if (politicalPeriods.length > 0) {
        politicalPeriodsHTML = '<div class="political-legend">' +
            '<h4>Political Periods</h4>' +
            '<div class="political-periods">';
        
        for (let i = 0; i < politicalPeriods.length; i++) {
            const period = politicalPeriods[i];
            politicalPeriodsHTML += '<div class="political-period">' +
                '<div class="political-color" style="background-color: ' + period.color + '"></div>' +
                '<span>' + period.name + ' (' + period.start + ' - ' + period.end + ')</span>' +
                '</div>';
        }
        
        politicalPeriodsHTML += '</div></div>';
    }
    
    // Create HTML content
    const htmlContent = '<!DOCTYPE html>' +
        '<html lang="en">' +
        '<head>' +
            '<meta charset="UTF-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
            '<title>' + chartTitle + '</title>' +
            '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>' +
            '<script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script>' +
            '<style>' +
                'body { font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 20px; background: #f8fafc; min-height: 100vh; }' +
                '.chart-container { max-width: 1000px; margin: 0 auto; background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); min-height: 600px; }' +
                '.chart-header { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #e5e7eb; }' +
                '.chart-title { font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 8px 0; }' +
                '.chart-subtitle { font-size: 16px; color: #6b7280; font-weight: 500; margin: 0; }' +
                '.chart-wrapper { position: relative; height: 400px; width: 100%; }' +
                '.chart-canvas { width: 100% !important; height: 100% !important; }' +
                '.chart-meta { margin-top: 16px; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 16px; }' +
                '.political-legend { margin-top: 16px; padding: 12px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #3b82f6; }' +
                '.political-legend h4 { margin: 0 0 8px 0; font-size: 14px; color: #374151; }' +
                '.political-periods { display: flex; flex-wrap: wrap; gap: 8px; }' +
                '.political-period { display: flex; align-items: center; gap: 4px; font-size: 12px; }' +
                '.political-color { width: 12px; height: 12px; border-radius: 2px; }' +
            '</style>' +
        '</head>' +
        '<body>' +
            '<div class="chart-container">' +
                '<div class="chart-header">' +
                    '<h1 class="chart-title">' + chartTitle + '</h1>' +
                    '<p class="chart-subtitle">' + (cardEl.querySelector('.chart-subtitle')?.textContent || 'Data visualization') + '</p>' +
                '</div>' +
                '<div class="chart-wrapper">' +
                    '<canvas id="chart" class="chart-canvas"></canvas>' +
                '</div>' +
                '<div class="chart-meta">' +
                    '<p>Generated on ' + new Date().toLocaleDateString() + ' from Riksdata</p>' +
                    '<p>Data source: ' + (cardEl.querySelector('.source-link')?.textContent || 'Unknown') + '</p>' +
                '</div>' +
                politicalPeriodsHTML +
            '</div>' +
            '<script>' +
                'const politicalPeriods = ' + JSON.stringify(politicalPeriods, null, 2) + ';' +
                'const chartConfig = ' + JSON.stringify(chartConfig, null, 2) + ';' +
                'document.addEventListener("DOMContentLoaded", function() {' +
                    'const ctx = document.getElementById("chart").getContext("2d");' +
                    'if (politicalPeriods.length > 0 && chartConfig.data.labels) {' +
                        'chartConfig.options.plugins = chartConfig.options.plugins || {};' +
                        'chartConfig.options.plugins.annotation = { annotations: {} };' +
                        'for (let i = 0; i < politicalPeriods.length; i++) {' +
                            'const period = politicalPeriods[i];' +
                            'const startDate = new Date(period.start);' +
                            'const endDate = new Date(period.end);' +
                            'const startIndex = chartConfig.data.labels.findIndex(function(label) {' +
                                'const labelDate = new Date(label);' +
                                'return labelDate >= startDate;' +
                            '});' +
                            'const endIndex = chartConfig.data.labels.findIndex(function(label) {' +
                                'const labelDate = new Date(label);' +
                                'return labelDate > endDate;' +
                            '});' +
                            'if (startIndex !== -1) {' +
                                'chartConfig.options.plugins.annotation.annotations["period-" + i] = {' +
                                    'type: "box",' +
                                    'xMin: startIndex,' +
                                    'xMax: endIndex !== -1 ? endIndex : chartConfig.data.labels.length - 1,' +
                                    'backgroundColor: period.color + "20",' +
                                    'borderColor: period.color,' +
                                    'borderWidth: 1,' +
                                    'label: {' +
                                        'content: period.name,' +
                                        'position: "start",' +
                                        'color: period.color,' +
                                        'font: { size: 10 }' +
                                    '}' +
                                '};' +
                            '}' +
                        '}' +
                    '}' +
                    'new Chart(ctx, chartConfig);' +
                '});' +
            '</script>' +
        '</body>' +
        '</html>';
    
    // Create and download the HTML file
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    download(blob, filename);
    announce?.(`Chart "${chartTitle}" downloaded as HTML!`);
}

async function downloadAsPDF(cardEl, filename, chartTitle) {
    // For PDF generation, we'll use html2canvas to create an image first
    // then convert it to PDF using jsPDF
    if (typeof window.jspdf === 'undefined') {
        // If jsPDF is not available, fallback to PNG
        console.warn('jsPDF not available, falling back to PNG');
        await downloadAsPNG(cardEl, filename.replace('.pdf', '.png'), chartTitle);
        return;
    }
    
    // Get the original chart instance
    const originalCanvas = cardEl.querySelector('canvas');
    const originalChart = originalCanvas?.chart;
    
    if (!originalChart) {
        console.error('[downloadAsPDF] No chart instance found');
        announce?.('Chart not ready for download. Please wait a moment and try again.');
        return;
    }
    
    // Create the same enhanced card as PNG
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 800px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        padding: 24px;
        font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
        z-index: -1;
    `;
    
    const cardClone = cardEl.cloneNode(true);
    const actionButtons = cardClone.querySelectorAll('.chart-actions, .source-link');
    actionButtons.forEach(btn => btn.remove());
    
    cardClone.style.cssText = `
        background: white;
        border: none;
        box-shadow: none;
        padding: 0;
        margin: 0;
        width: 100%;
        max-width: none;
    `;
    
    const header = cardClone.querySelector('.chart-header');
    if (header) {
        header.style.cssText = `
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 2px solid #e5e7eb;
        `;
    }
    
    const title = cardClone.querySelector('h3');
    if (title) {
        title.style.cssText = `
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            margin: 0 0 8px 0;
            line-height: 1.2;
        `;
    }
    
    const subtitle = cardClone.querySelector('.chart-subtitle');
    if (subtitle) {
        subtitle.style.cssText = `
            font-size: 16px;
            color: #6b7280;
            font-weight: 500;
            margin: 0;
        `;
    }
    
    const chartContainer = cardClone.querySelector('.chart-container');
    if (chartContainer) {
        chartContainer.style.cssText = `
            width: 100%;
            height: 400px;
            position: relative;
        `;
    }
    
    tempContainer.appendChild(cardClone);
    document.body.appendChild(tempContainer);
    
    // Wait a moment for the layout to settle
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (window.html2canvas) {
        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 800,
            height: tempContainer.scrollHeight,
            logging: false,
            onclone: (clonedDoc) => {
                // Ensure the cloned chart renders properly
                const clonedCanvas = clonedDoc.querySelector('canvas');
                if (clonedCanvas && clonedCanvas.chart) {
                    clonedCanvas.chart.resize();
                    clonedCanvas.chart.render();
                }
            }
        });
        
        // Convert canvas to PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        pdf.save(filename);
        announce?.(`Chart "${chartTitle}" downloaded as PDF!`);
    }
    
    // Clean up
    document.body.removeChild(tempContainer);
}

async function downloadAsSVG(cardEl, filename) {
    // Get the original chart instance
    const originalCanvas = cardEl.querySelector('canvas');
    const originalChart = originalCanvas?.chart;
    
    if (!originalChart) {
        console.error('[downloadAsSVG] No chart instance found');
        announce?.('Chart not ready for download. Please wait a moment and try again.');
        return;
    }
    
    // For Chart.js, we'll create an SVG wrapper with the chart data
    // Since Chart.js doesn't natively support SVG export, we'll create a data-driven SVG
    const chartTitle = cardEl?.querySelector?.('h3')?.textContent?.trim() || 'Chart';
    
    // Get chart data
    const chartData = originalChart.data;
    const chartOptions = originalChart.options;
    
    // Create SVG content with chart data
    const svgContent = createChartSVG(chartData, chartOptions, chartTitle);
    
    // Create and download the SVG file
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    download(blob, filename);
    announce?.(`Chart "${chartTitle}" downloaded as SVG!`);
}

function createChartSVG(chartData, chartOptions, title) {
    const width = 800;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Get data points
    const labels = chartData.labels || [];
    const datasets = chartData.datasets || [];
    
    if (datasets.length === 0 || labels.length === 0) {
        return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <text x="${width/2}" y="${height/2}" text-anchor="middle" fill="#666">No data available</text>
        </svg>`;
    }
    
    // Calculate scales
    const allValues = datasets.flatMap(dataset => dataset.data || []);
    const minValue = Math.min(...allValues.filter(v => v !== null && v !== undefined));
    const maxValue = Math.max(...allValues.filter(v => v !== null && v !== undefined));
    const valueRange = maxValue - minValue;
    
    const xScale = (i) => margin.left + (i / (labels.length - 1)) * chartWidth;
    const yScale = (value) => margin.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;
    
    // Create SVG content
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <style>
                .chart-title { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #333; }
                .axis-label { font-family: Arial, sans-serif; font-size: 12px; fill: #666; }
                .grid-line { stroke: #eee; stroke-width: 1; }
                .data-line { fill: none; stroke-width: 2; }
                .data-point { fill: white; stroke-width: 2; }
            </style>
        </defs>
        
        <!-- Title -->
        <text x="${width/2}" y="20" text-anchor="middle" class="chart-title">${title}</text>
        
        <!-- Grid lines -->
        ${Array.from({length: 5}, (_, i) => {
            const y = margin.top + (i / 4) * chartHeight;
            return `<line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" class="grid-line"/>`;
        }).join('')}
        
        <!-- Chart data -->
        ${datasets.map((dataset, datasetIndex) => {
            const color = dataset.borderColor || `hsl(${datasetIndex * 60}, 70%, 50%)`;
            const data = dataset.data || [];
            
            // Create path for line
            const points = data.map((value, i) => {
                if (value === null || value === undefined) return null;
                return `${xScale(i)},${yScale(value)}`;
            }).filter(p => p !== null);
            
            if (points.length < 2) return '';
            
            const pathData = `M ${points.join(' L ')}`;
            
            return `
                <path d="${pathData}" class="data-line" stroke="${color}"/>
                ${points.map(point => {
                    const [x, y] = point.split(',');
                    return `<circle cx="${x}" cy="${y}" r="3" class="data-point" stroke="${color}"/>`;
                }).join('')}
            `;
        }).join('')}
        
        <!-- X-axis labels -->
        ${labels.map((label, i) => {
            const x = xScale(i);
            const y = height - margin.bottom + 15;
            return `<text x="${x}" y="${y}" text-anchor="middle" class="axis-label">${label}</text>`;
        }).join('')}
        
        <!-- Y-axis labels -->
        ${Array.from({length: 5}, (_, i) => {
            const value = minValue + (i / 4) * valueRange;
            const y = margin.top + (i / 4) * chartHeight;
            return `<text x="${margin.left - 10}" y="${y + 4}" text-anchor="end" class="axis-label">${value.toFixed(1)}</text>`;
        }).join('')}
    </svg>`;
    
    return svg;
}

function getSuggestedFilename(cardEl, ext) {
    const id = cardEl.getAttribute('data-chart-id') || 'chart';
    const titleEl = cardEl.querySelector('.chart-header h3');
    const base = (titleEl?.textContent || id).trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const date = new Date().toISOString().slice(0,10);
    return `${base}-${date}.${ext}`;
}

function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadSVG(svgEl, filename = 'chart.svg') {
    // Inline computed styles for portability (minimal subset)
    const clone = svgEl.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('version', '1.1');
    
    // Ensure width/height attributes exist
    const bbox = svgEl.getBBox?.();
    if (!clone.getAttribute('width') && bbox) {
        clone.setAttribute('width', Math.ceil(bbox.width) + 'px');
    }
    if (!clone.getAttribute('height') && bbox) {
        clone.setAttribute('height', Math.ceil(bbox.height) + 'px');
    }
    
    // Serialize
    const svgData = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    download(blob, filename);
}

export function downloadPNG(canvasEl, filename = 'chart.png') {
    // Scale up for crisper PNG (2x)
    const scale = 2;
    const w = canvasEl.width;
    const h = canvasEl.height;
    
    try {
        // If original canvas already high-res, use it directly
        const url = canvasEl.toDataURL('image/png');
        fetch(url).then(res => res.blob()).then(blob => download(blob, filename));
    } catch (e) {
        console.error('Canvas export failed, trying rasterize fallback', e);
        // Fallback: draw onto a second canvas
        const off = document.createElement('canvas');
        off.width = w * scale;
        off.height = h * scale;
        const ctx = off.getContext('2d');
        ctx.scale(scale, scale);
        ctx.drawImage(canvasEl, 0, 0);
        off.toBlob(blob => download(blob, filename), 'image/png');
    }
}

import { updateActionButtonState } from './icons.js';

// --- Copy Data (TSV) ---
export async function copyChartDataTSV(cardEl, getDataById) {
  try {
    console.log('[copyChartDataTSV] Starting copy process...');
    const chartId = cardEl?.getAttribute?.('data-chart-id') || cardEl?.dataset?.chartId;
    console.log('[copyChartDataTSV] Chart ID:', chartId);
    console.log('[copyChartDataTSV] Card element:', cardEl);
    
    const data = typeof getDataById === 'function' ? getDataById(chartId) : null;
    console.log('[copyChartDataTSV] Retrieved data:', data);
    
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('[copyChartDataTSV] No data found for chart:', chartId);
      announce?.('No data available for this chart.');
      return;
    }

    // Validate data structure
    const firstItem = data[0];
    if (!firstItem || typeof firstItem !== 'object') {
      console.warn('[copyChartDataTSV] Invalid data structure for chart:', chartId);
      announce?.('Invalid data structure for this chart.');
      return;
    }

    // Get chart title for better filename
    const chartTitle = cardEl?.querySelector?.('h3')?.textContent?.trim() || 'chart-data';
    const sanitizedTitle = chartTitle.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase();

    // Stable column order and exact header wording
    const header = 'time\tvalue\tindex';
    const toDateStr = (d) => {
      if (d instanceof Date) return d.toISOString().slice(0, 10); // YYYY-MM-DD
      // strings like '2021-03-01' pass through unchanged
      return d == null ? '' : String(d);
    };

    const rows = data.map((r) => {
      // Handle different possible date field names
      const dateField = r.date || r.time || r.timestamp || r.period;
      const time = toDateStr(dateField);
      
      // Handle different possible value field names
      const valueField = r.value || r.amount || r.rate || r.index_value;
      const value = valueField == null ? '' : String(valueField);
      
      // Use index if available, otherwise use array position
      const index = r.index == null ? '' : String(r.index);
      return [time, value, index].join('\t');
    });

    const tsv = [header, ...rows].join('\n');
    const blob = new Blob([tsv], { type: 'text/tab-separated-values;charset=utf-8' });

    console.log(`[copyChartDataTSV] Prepared ${data.length} data points for copying`);

    // Try modern clipboard path first with a typed payload
    if (navigator?.clipboard && window?.ClipboardItem) {
      try {
        const item = new ClipboardItem({ 'text/plain': blob });
        await navigator.clipboard.write([item]);
        announce?.(`${data.length} data points copied to clipboard!`);
        return;
      } catch (clipboardError) {
        console.warn('[copyChartDataTSV] ClipboardItem failed, trying fallback:', clipboardError);
      }
    }
    
    // Fallback: best-effort text copy
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(tsv);
        announce?.(`${data.length} data points copied to clipboard!`);
        return;
      } catch (textError) {
        console.warn('[copyChartDataTSV] writeText failed:', textError);
      }
    }
    
    // Last resort: auto-download data.tsv
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${sanitizedTitle}-data.tsv`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    a.remove();
    announce?.('Clipboard blocked. Downloaded data file instead.');
    
  } catch (err) {
    console.error('[copyChartDataTSV] Unexpected error:', err);
    announce?.('Could not copy data.');
  }
}

function announce(msg) {
    // Simple polite ARIA live region
    let live = document.getElementById('aria-live-helper');
    if (!live) {
        live = document.createElement('div');
        live.id = 'aria-live-helper';
        live.setAttribute('aria-live', 'polite');
        live.style.position = 'absolute';
        live.style.left = '-9999px';
        document.body.appendChild(live);
    }
    live.textContent = msg;
}
