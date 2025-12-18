// ============================================================================
// RIKSDATA UTILITIES
// ============================================================================

import { POLITICAL_PERIODS } from './config.js';

/**
 * Get political period for a given date based on Norwegian political history
 * @param {Date|string} date - The date to check
 * @returns {{name: string, start: string, end: string, color: string, backgroundColor: string}|null} Political period object with party colors, or null if not found
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
 * Supports formats: Monthly (2023M01), Quarterly (2023K1), Yearly (2023), Weekly (2025U30), Year ranges (2007-2008)
 * @param {string} timeLabel - The time label to parse
 * @returns {Date|null} Parsed date or null if invalid format
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
 * Aggregate data by month for bar charts (calculates monthly averages)
 * @param {Array<{date: Date, value: number}>} data - Array of data points with date and value
 * @returns {Array<{date: Date, value: number}>} Aggregated data by month with averaged values
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
 * Debounce function to limit function calls (prevents excessive execution)
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds before execution
 * @returns {Function} Debounced function that delays execution
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
 * Timeout wrapper for promises to prevent hanging operations
 * @param {Promise} promise - Promise to wrap with timeout
 * @param {number} [ms=15000] - Timeout in milliseconds (default 15 seconds)
 * @returns {Promise} Promise that rejects with timeout error if not resolved in time
 * @throws {Error} Throws 'timeout' error if promise doesn't resolve within specified time
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

/**
 * Download chart as image or HTML file
 * @param {HTMLElement} cardEl - Chart card element to download
 * @param {string} [format='png'] - Export format: 'png', 'html', 'pdf', or 'svg'
 * @returns {Promise<void>} Promise that resolves when download is complete
 */
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
            case 'png':
            default:
                await downloadAsPNG(cardEl, filename, chartTitle); // Back to original PNG approach
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
    console.log('[downloadAsPNG] Starting Instagram-friendly PNG download...');
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

    // Instagram Posts optimized dimensions - 14:9 landscape format
    const INSTAGRAM_WIDTH = 1385; // 14:9 format - WIDTH should be larger for landscape!
    const INSTAGRAM_HEIGHT = 1080;

    // Create a temporary container with extra safe padding to prevent Instagram cropping
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: ${INSTAGRAM_WIDTH}px;
        height: ${INSTAGRAM_HEIGHT}px;
        background: white;
        border-radius: 0;
        box-shadow: none;
        padding: 160px 200px;
        font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
        z-index: -1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        /* Add extra safe margins to prevent cropping */
        margin: 60px 40px;
        border: 2px solid #f8f9fa;
    `;

    // Clone the card and enhance it for export
    const cardClone = cardEl.cloneNode(true);

    // Remove action buttons and source link from the clone
    const actionButtons = cardClone.querySelectorAll('.chart-actions, .source-link');
    actionButtons.forEach(btn => btn.remove());

    // FORCE the chart to be narrower by modifying the canvas directly
    const clonedCanvas = cardClone.querySelector('canvas');
    if (clonedCanvas && originalChart) {
        // Set dimensions for export
        clonedCanvas.style.width = '1000px';
        clonedCanvas.style.height = '600px';
        clonedCanvas.width = 1000;
        clonedCanvas.height = 600;

        // Redraw with the same data but export-friendly options
        const exportOptions = JSON.parse(JSON.stringify(originalChart.options));
        exportOptions.responsive = false;
        exportOptions.animation = false;
        exportOptions.maintainAspectRatio = true;

        // MANUALLY restore political colors logic for export
        if (originalChart.options.plugins?.segment) {
            exportOptions.plugins.segment = originalChart.options.plugins.segment;
        }

        // Also check if segments are defined at dataset level
        const exportDatasets = originalChart.data.datasets.map(ds => {
            const newDs = { ...ds };
            if (ds.segment) newDs.segment = ds.segment;
            return newDs;
        });

        new Chart(clonedCanvas, {
            type: originalChart.config.type,
            data: { ...originalChart.data, datasets: exportDatasets },
            options: exportOptions
        });

        // Wait for next frame to ensure clone is ready
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Enhance the styling for Instagram export
    cardClone.style.cssText = `
        background: white;
        border: none;
        box-shadow: none;
        padding: 40px;
        margin: 0;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    `;

    // Enhance header styling with extra safe spacing for 4:5 format
    const header = cardClone.querySelector('.chart-header');
    if (header) {
        header.style.cssText = `
            margin-bottom: 80px;
            padding-bottom: 50px;
            border-bottom: 3px solid #e5e7eb;
            text-align: center;
            width: 100%;
            /* Extra safe spacing to prevent cropping */
            padding-top: 30px;
            padding-left: 80px;
            padding-right: 80px;
        `;
    }

    // Enhance title styling for 16:9 format
    const title = cardClone.querySelector('h3');
    if (title) {
        title.style.cssText = `
            font-size: 48px;
            font-weight: 800;
            color: #111827;
            margin: 0 0 24px 0;
            line-height: 1.1;
            letter-spacing: -0.02em;
            text-align: center;
        `;
    }

    // Enhance subtitle styling for 16:9 format
    const subtitle = cardClone.querySelector('.chart-subtitle');
    if (subtitle) {
        subtitle.style.cssText = `
            font-size: 28px;
            color: #6b7280;
            font-weight: 600;
            margin: 0;
            line-height: 1.3;
            text-align: center;
        `;
    }

    // Enhance chart container for 4:5 format with extra safe margins
    const chartContainer = cardClone.querySelector('.chart-container');
    if (chartContainer) {
        chartContainer.style.cssText = `
            width: 60%;
            height: 900px;
            position: relative;
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            /* Extra safe margins to prevent cropping */
            margin: 30px 80px;
            padding: 40px;
            border: 1px solid #f0f0f0;
            border-radius: 12px;
            background: #fafafa;
        `;
    }

    // Add a safe area indicator overlay to show Instagram-safe zones
    const safeAreaOverlay = document.createElement('div');
    safeAreaOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10;
        /* Instagram safe area guidelines */
        border: 2px dashed rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        /* Safe margins for Instagram 4:5 format */
        margin: 80px 100px;
        box-sizing: border-box;
    `;

    // Add the enhanced card to the temporary container
    tempContainer.appendChild(cardClone);
    tempContainer.appendChild(safeAreaOverlay);
    document.body.appendChild(tempContainer);

    // Wait a moment for the layout to settle
    await new Promise(resolve => setTimeout(resolve, 100));

    // Use html2canvas to capture the entire card with 16:9 optimization
    if (window.html2canvas) {
        const canvas = await html2canvas(tempContainer, {
            scale: 1, // Perfect resolution for 16:9 format (1920x1080)
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: INSTAGRAM_WIDTH,
            height: INSTAGRAM_HEIGHT,
            logging: false,
            imageTimeout: 15000,
            onclone: (clonedDoc) => {
                // Ensure the cloned chart renders properly for 16:9 format
                const clonedCanvas = clonedDoc.querySelector('canvas');
                if (clonedCanvas && clonedCanvas.chart) {
                    // Force the chart to render at the correct size
                    clonedCanvas.chart.resize();
                    clonedCanvas.chart.render();

                    // Set canvas dimensions for high quality
                    const ctx = clonedCanvas.getContext('2d');
                    if (ctx) {
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                    }
                }

                // Ensure the chart container has proper dimensions for 4:5 format
                const clonedChartContainer = clonedDoc.querySelector('.chart-container');
                if (clonedChartContainer) {
                    clonedChartContainer.style.height = '900px';
                    clonedChartContainer.style.width = '60%';
                    clonedChartContainer.style.margin = '30px 80px';
                    clonedChartContainer.style.padding = '40px';
                    clonedChartContainer.style.border = '1px solid #f0f0f0';
                    clonedChartContainer.style.borderRadius = '12px';
                    clonedChartContainer.style.background = '#fafafa';
                }

                // Ensure title and subtitle are visible and properly styled for 16:9 format
                const clonedTitle = clonedDoc.querySelector('h3');
                if (clonedTitle) {
                    clonedTitle.style.display = 'block';
                    clonedTitle.style.visibility = 'visible';
                    clonedTitle.style.fontSize = '48px';
                    clonedTitle.style.fontWeight = '800';
                    clonedTitle.style.textAlign = 'center';
                }
                const clonedSubtitle = clonedDoc.querySelector('.chart-subtitle');
                if (clonedSubtitle) {
                    clonedSubtitle.style.display = 'block';
                    clonedSubtitle.style.visibility = 'visible';
                    clonedSubtitle.style.fontSize = '28px';
                    clonedSubtitle.style.fontWeight = '600';
                    clonedSubtitle.style.textAlign = 'center';
                }
            }
        });

        // Convert to blob and download with Instagram-safe filename
        canvas.toBlob((blob) => {
            // Update filename to indicate Instagram 14:9 optimization
            const instagramSafeFilename = filename.replace('.png', '-instagram-14x9.png');
            download(blob, instagramSafeFilename);
            announce?.(`Chart "${chartTitle}" downloaded as Instagram 14:9 PNG - landscape format!`);
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

    // Extract serializable chart data (avoiding functions and callbacks)
    const chartType = originalChart.config.type || 'line';
    const chartLabels = originalChart.data.labels || [];
    const chartDatasets = (originalChart.data.datasets || []).map(dataset => ({
        label: dataset.label,
        data: dataset.data,
        borderColor: dataset.borderColor,
        backgroundColor: dataset.backgroundColor,
        borderWidth: dataset.borderWidth || 2,
        fill: dataset.fill || false,
        tension: dataset.tension || 0.1,
        // Preserve political colors if they exist
        segment: dataset.segment,
        pointBackgroundColor: dataset.pointBackgroundColor,
        pointBorderColor: dataset.pointBorderColor
    }));

    // Create a simple, serializable chart config (functions will be added back in the script)
    const chartConfig = {
        type: chartType,
        data: {
            datasets: chartDatasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: chartDatasets.length > 1,
                    position: 'top'
                },
                title: { display: false },
                tooltip: { enabled: true }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'year',
                        displayFormats: {
                            year: 'yyyy',
                            month: 'yyyy',
                            quarter: 'yyyy'
                        }
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 15,
                        maxRotation: 0,
                        font: { size: 12 }
                    },
                    grid: { display: false }
                },
                y: {
                    display: true,
                    beginAtZero: false,
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                }
            }
        }
    };

    // Create HTML content
    const htmlContent = `<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${chartTitle}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script>
    <style>
        body { font-family: 'Inter', sans-serif; margin: 0; padding: 40px; background: #f5f0e8; color: #020202; line-height: 1.6; }
        .chart-card { max-width: 1000px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid rgba(0,0,0,0.1); box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .chart-header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #09213C; }
        .chart-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #020202; margin: 0 0 8px 0; }
        .chart-subtitle { font-size: 16px; color: rgba(2,2,2,0.65); font-weight: 500; margin: 0; }
        .chart-container { position: relative; height: 400px; width: 100%; margin-top: 20px; }
        .footer { margin-top: 24px; font-size: 12px; color: rgba(2,2,2,0.45); border-top: 1px solid rgba(0,0,0,0.05); padding-top: 16px; display: flex; justify-content: space-between; }
        .footer a { color: #3b82f6; text-decoration: none; }
    </style>
</head>
<body>
    <div class="chart-card">
        <div class="chart-header">
            <h1 class="chart-title">${chartTitle}</h1>
            <p class="chart-subtitle">${cardEl.querySelector('.chart-subtitle')?.textContent || ''}</p>
        </div>
        <div class="chart-container">
            <canvas id="chart"></canvas>
        </div>
        <div class="footer">
            <span>Generert ${new Date().toLocaleDateString('no-NO')} &bull; riksdata.no</span>
            <span>Kilde: ${cardEl.querySelector('.source-link')?.textContent || 'Riksdata'}</span>
        </div>
    </div>
    <script>
        const POLITICAL_PERIODS = ${JSON.stringify(POLITICAL_PERIODS)};
        
        function getPoliticalPeriod(date) {
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

        const config = ${JSON.stringify(chartConfig)};
        
        // Restore dynamic functions lost in JSON serialization
        
        // 1. X-axis Year-only Formatting
        if (config.options.scales && config.options.scales.x) {
            config.options.scales.x.ticks.callback = function(value, index, values) {
                const date = new Date(value);
                if (isNaN(date.getTime())) return value;
                return date.getFullYear().toString();
            };
        }

        // 2. Political Color Segments
        if (config.type === 'line') {
            config.data.datasets.forEach(dataset => {
                dataset.segment = {
                    borderColor: (ctx) => {
                        if (!ctx || !ctx.p0 || !ctx.p0.parsed) return dataset.borderColor || '#3b82f6';
                        const xVal = ctx.p0.parsed.x;
                        const period = getPoliticalPeriod(xVal);
                        return period ? period.color : (dataset.borderColor || '#3b82f6');
                    }
                };
            });
        }

        window.onload = () => {
            const ctx = document.getElementById('chart').getContext('2d');
            new Chart(ctx, config);
        };
    </script>
</body>
</html>`;

    // Create and download the HTML file
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    download(blob, filename);
    announce?.(`Chart "${chartTitle}" downloaded as HTML!`);
}

async function downloadAsPDF(cardEl, filename, chartTitle) {
    if (typeof window.jspdf === 'undefined') {
        console.warn('jsPDF not available, falling back to PNG');
        await downloadAsPNG(cardEl, filename.replace('.pdf', '.png'), chartTitle);
        return;
    }

    const { jsPDF } = window.jspdf;
    const originalCanvas = cardEl.querySelector('canvas');
    const originalChart = originalCanvas?.chart;

    if (!originalChart) {
        console.error('[downloadAsPDF] No chart instance found');
        return;
    }

    // High DPI export scaling & 12:6 cinematic ratio
    const SCALE = 4;
    const PDF_WIDTH = 1200;
    const PDF_HEIGHT = 600;

    const pdf = new jsPDF({
        orientation: 'l',
        unit: 'px',
        format: [PDF_WIDTH, PDF_HEIGHT]
    });

    // 1. Draw Background
    pdf.setFillColor(245, 240, 232); // #f5f0e8
    pdf.rect(0, 0, PDF_WIDTH, PDF_HEIGHT, 'F');

    // 2. Add Vector Text (Selectable and perfectly sharp)
    pdf.setTextColor(2, 2, 2);
    pdf.setFont('times', 'bold');
    pdf.setFontSize(32);
    pdf.text(chartTitle, 40, 65);

    const subtitleText = cardEl.querySelector('.chart-subtitle')?.textContent || '';
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(14);
    pdf.setTextColor(107, 114, 128);
    pdf.text(subtitleText, 40, 88);

    // 3. Branding Accent
    pdf.setDrawColor(9, 33, 60);
    pdf.setLineWidth(3);
    pdf.line(40, 110, PDF_WIDTH - 40, 110);

    // 4. Render High-Resolution Chart (Scale: 4x)
    const shadowCanvas = document.createElement('canvas');
    const chartAreaWidth = PDF_WIDTH - 80;
    const chartAreaHeight = PDF_HEIGHT - 210; // Reserve space for header/footer

    shadowCanvas.width = chartAreaWidth * SCALE;
    shadowCanvas.height = chartAreaHeight * SCALE;
    const ctx = shadowCanvas.getContext('2d');

    const exportDatasets = originalChart.data.datasets.map(ds => {
        const newDs = { ...ds };
        if (ds.segment) newDs.segment = ds.segment;
        // Increase line thickness for high-res PDF
        newDs.borderWidth = 2.5 * SCALE;
        return newDs;
    });

    const exportOptions = {
        ...JSON.parse(JSON.stringify(originalChart.options)),
        responsive: false,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            ...originalChart.options.plugins,
            legend: {
                display: exportDatasets.length > 1,
                position: 'top',
                labels: { font: { size: 11 * SCALE, weight: '600' } }
            }
        },
        scales: {
            x: {
                ...originalChart.options.scales?.x,
                grid: {
                    ...originalChart.options.scales?.x?.grid,
                    lineWidth: 0.5 * SCALE
                },
                ticks: {
                    ...originalChart.options.scales?.x?.ticks,
                    font: { size: 10 * SCALE, weight: '600' },
                    callback: function (value) {
                        const date = new Date(value);
                        return isNaN(date.getTime()) ? value : date.getFullYear().toString();
                    }
                }
            },
            y: {
                ...originalChart.options.scales?.y,
                grid: {
                    ...originalChart.options.scales?.y?.grid,
                    lineWidth: 0.5 * SCALE
                },
                ticks: { ...originalChart.options.scales?.y?.ticks, font: { size: 10 * SCALE, weight: '600' } }
            }
        }
    };

    if (originalChart.options.plugins?.segment) {
        exportOptions.plugins.segment = originalChart.options.plugins.segment;
    }

    new Chart(ctx, {
        type: originalChart.config.type,
        data: { ...originalChart.data, datasets: exportDatasets },
        options: exportOptions
    });

    // Wait for ultra-high-res render to complete
    await new Promise(resolve => setTimeout(resolve, 600));

    const imgData = shadowCanvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', 40, 140, chartAreaWidth, chartAreaHeight);

    // 5. Vector Footer
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    const dateStr = new Date().toLocaleDateString('no-NO');
    pdf.text(`Generert fra riksdata.no • ${dateStr}`, 40, PDF_HEIGHT - 40);

    const sourceText = cardEl.querySelector('.source-link')?.textContent || 'Riksdata';
    pdf.text(`Kilde: ${sourceText}`, PDF_WIDTH - 40, PDF_HEIGHT - 40, { align: 'right' });

    pdf.save(filename);
    announce?.(`PDF eksportert: ${filename}`);
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
            <text x="${width / 2}" y="${height / 2}" text-anchor="middle" fill="#666">No data available</text>
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
        <text x="${width / 2}" y="20" text-anchor="middle" class="chart-title">${title}</text>
        
        <!-- Grid lines -->
        ${Array.from({ length: 5 }, (_, i) => {
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
        ${Array.from({ length: 5 }, (_, i) => {
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
    const date = new Date().toISOString().slice(0, 10);
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

/**
 * Copy chart data to clipboard in TSV format
 * @param {HTMLElement} cardEl - Chart card element containing the chart
 * @param {Function} getDataById - Function to retrieve chart data by ID
 * @returns {Promise<void>} Promise that resolves when data is copied
 */
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

// JPEG download function
async function downloadAsJPEG(cardEl, filename, chartTitle, announce) {
    console.log('[downloadAsJPEG] Starting JPEG download...');

    const canvas = cardEl.querySelector('canvas');
    if (!canvas) {
        console.error('[downloadAsJPEG] No canvas found in card');
        announce?.('No chart found to download');
        return;
    }

    // Get the chart instance
    const chartId = canvas.id;
    const chartInstance = window.chartInstances?.[chartId];
    if (!chartInstance) {
        console.error('[downloadAsJPEG] No chart instance found');
        announce?.('Chart not ready for download. Please wait a moment and try again.');
        return;
    }

    // Instagram Posts optimized dimensions - 14:9 format (less wide than 16:9)
    const INSTAGRAM_WIDTH = 1385; // 14:9 format - WIDTH should be larger for landscape!
    const INSTAGRAM_HEIGHT = 1080;

    // Create a temporary container optimized for JPEG
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: ${INSTAGRAM_WIDTH}px;
        height: ${INSTAGRAM_HEIGHT}px;
        background: white;
        border-radius: 0;
        box-shadow: none;
        padding: 160px 200px;
        font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
        z-index: -1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        margin: 60px 40px;
        border: 2px solid #f8f9fa;
    `;

    // Clone the card and enhance it for export
    const cardClone = cardEl.cloneNode(true);

    // Remove action buttons and source link from the clone
    const actionButtons = cardClone.querySelectorAll('.chart-actions, .source-link');
    actionButtons.forEach(btn => btn.remove());

    // FORCE the chart to be narrower by modifying the canvas directly
    const clonedCanvas = cardClone.querySelector('canvas');
    if (clonedCanvas && chartInstance) {
        // Set the canvas to be much narrower
        clonedCanvas.style.width = '400px';
        clonedCanvas.style.height = '600px';
        clonedCanvas.width = 400;
        clonedCanvas.height = 600;

        // Force the chart to redraw with new dimensions
        chartInstance.options.maintainAspectRatio = false;
        chartInstance.options.aspectRatio = 0.67;

        // Hide y-axis labels to save horizontal space
        if (chartInstance.options.scales && chartInstance.options.scales.y) {
            chartInstance.options.scales.y.display = false;
        }

        // Make x-axis labels smaller to fit better
        if (chartInstance.options.scales && chartInstance.options.scales.x) {
            chartInstance.options.scales.x.ticks = {
                ...chartInstance.options.scales.x.ticks,
                maxRotation: 45,
                minRotation: 45,
                font: {
                    size: 10
                }
            };
        }

        chartInstance.resize(400, 600);
    }

    // Enhance the styling for Instagram export
    cardClone.style.cssText = `
        background: white;
        border: none;
        box-shadow: none;
        padding: 0;
        margin: 0;
        width: 100%;
        max-width: none;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
    `;

    // Enhance header styling with extra safe spacing for 2:3 format
    const header = cardClone.querySelector('.chart-header');
    if (header) {
        header.style.cssText = `
            margin-bottom: 80px;
            padding-bottom: 50px;
            border-bottom: 3px solid #e5e7eb;
            text-align: center;
            width: 100%;
            padding-top: 30px;
            padding-left: 80px;
            padding-right: 80px;
        `;
    }

    // Enhance title styling
    const title = cardClone.querySelector('h3');
    if (title) {
        title.style.cssText = `
            font-size: 48px;
            font-weight: 800;
            color: #111827;
            margin: 0 0 24px 0;
            line-height: 1.1;
            letter-spacing: -0.02em;
            text-align: center;
        `;
    }

    // Enhance subtitle styling
    const subtitle = cardClone.querySelector('.chart-subtitle');
    if (subtitle) {
        subtitle.style.cssText = `
            font-size: 28px;
            color: #6b7280;
            font-weight: 600;
            margin: 0;
            line-height: 1.3;
            text-align: center;
        `;
    }

    // Enhance chart container for JPEG format
    const chartContainer = cardClone.querySelector('.chart-container');
    if (chartContainer) {
        chartContainer.style.cssText = `
            width: 60%;
            height: 900px;
            position: relative;
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 30px 80px;
            padding: 40px;
            border: 1px solid #f0f0f0;
            border-radius: 12px;
            background: #fafafa;
        `;
    }

    // Add safe area indicator overlay
    const safeAreaOverlay = document.createElement('div');
    safeAreaOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10;
        border: 2px dashed rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        margin: 80px 100px;
        box-sizing: border-box;
    `;

    // Add the enhanced card to the temporary container
    tempContainer.appendChild(cardClone);
    tempContainer.appendChild(safeAreaOverlay);
    document.body.appendChild(tempContainer);

    // Wait a moment for the layout to settle
    await new Promise(resolve => setTimeout(resolve, 100));

    // Use html2canvas to capture and convert to JPEG
    if (window.html2canvas) {
        const canvas = await html2canvas(tempContainer, {
            scale: 1,
            backgroundColor: '#ffffff',
            width: INSTAGRAM_WIDTH,
            height: INSTAGRAM_HEIGHT,
            useCORS: true,
            allowTaint: true,
            onclone: (clonedDoc) => {
                // Enhance chart container for JPEG format
                const clonedChartContainer = clonedDoc.querySelector('.chart-container');
                if (clonedChartContainer) {
                    clonedChartContainer.style.height = '900px';
                    clonedChartContainer.style.width = '60%';
                    clonedChartContainer.style.margin = '30px 80px';
                    clonedChartContainer.style.padding = '40px';
                    clonedChartContainer.style.border = '1px solid #f0f0f0';
                    clonedChartContainer.style.borderRadius = '12px';
                    clonedChartContainer.style.background = '#fafafa';
                }

                // Ensure title and subtitle are visible and properly styled
                const clonedTitle = clonedDoc.querySelector('h3');
                if (clonedTitle) {
                    clonedTitle.style.display = 'block';
                    clonedTitle.style.fontSize = '48px';
                    clonedTitle.style.fontWeight = '800';
                    clonedTitle.style.color = '#111827';
                    clonedTitle.style.textAlign = 'center';
                }

                const clonedSubtitle = clonedDoc.querySelector('.chart-subtitle');
                if (clonedSubtitle) {
                    clonedSubtitle.style.display = 'block';
                    clonedSubtitle.style.fontSize = '28px';
                    clonedSubtitle.style.color = '#6b7280';
                    clonedSubtitle.style.textAlign = 'center';
                }
            }
        });

        // Convert to PNG blob and download with 14:9 format
        canvas.toBlob((blob) => {
            const pngFilename = filename.replace('.png', '-instagram-14x9.png');
            download(blob, pngFilename);
            announce?.(`Chart "${chartTitle}" downloaded as Instagram 14:9 PNG - perfect aspect ratio!`);
        }, 'image/png', 1.0); // Maximum quality

    } else {
        console.warn('html2canvas not available, falling back to canvas-only download');
        const canvas = cardEl.querySelector('canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = filename.replace('.png', '.jpeg');
            link.href = canvas.toDataURL('image/jpeg', 0.9);
            link.click();
            announce?.(`Chart "${chartTitle}" downloaded as JPEG!`);
        }
    }

    // Clean up
    document.body.removeChild(tempContainer);
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
