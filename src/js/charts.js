// ============================================================================
// RIKSDATA CHART RENDERING AND DATA PARSING
// ============================================================================

import { CHART_CONFIG, DATASET_MAPPINGS, API_CONFIG } from './config.js';
import { 
    getPoliticalPeriod, 
    parseTimeLabel, 
    aggregateDataByMonth, 
    showError,
    updateStaticTooltip,
    hideStaticTooltip
} from './utils.js';

// Helper function to normalize relative paths for GitHub Pages
function rel(p) {
    return new URL(p, document.baseURI).toString();
}

/**
 * Lazy load charts when they become visible (mobile optimization)
 * @param {string} chartId - Chart canvas ID
 * @param {Function} createChartFn - Function to create the chart
 */
export function initChartWhenVisible(chartId, createChartFn) {
    const el = document.getElementById(chartId);
    if (!el) return;
    
    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    createChartFn();
                    obs.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px' // Start loading 50px before chart becomes visible
        });
        observer.observe(el);
    } else {
        // Fallback for older browsers - load immediately
        createChartFn();
    }
}

/**
 * Optimize data for mobile devices
 * @param {Array} data - Chart data
 * @param {boolean} isMobile - Whether we're on mobile
 * @returns {Array} Optimized data
 */
function optimizeDataForMobile(data, isMobile = false) {
    if (!isMobile || !data || data.length <= 12) {
        return data;
    }
    
    // On mobile, limit to recent 12 months for better performance
    const recentData = data.slice(-12);
    console.log(`Mobile optimization: reduced ${data.length} data points to ${recentData.length}`);
    return recentData;
}

/**
 * Load and render chart data from cached files
 * @param {string} canvasId - Canvas element ID
 * @param {string} apiUrl - Original API URL
 * @param {string} chartTitle - Chart title
 * @param {string} chartType - Chart type (line, bar, etc.)
 */
export async function loadChartData(canvasId, apiUrl, chartTitle, chartType = 'line') {
    try {
        // Proceed with all charts; filtering handled elsewhere if needed
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`Canvas with id '${canvasId}' not found - skipping chart`);
            return null;
        }

        // Determine cache file path based on API URL
        let cachePath;
        if (apiUrl.includes('ssb.no')) {
            // Extract dataset ID from SSB URL; allow alphanumeric IDs
            const datasetId = apiUrl.match(/dataset\/([\w\d]+)\.json/)?.[1];
            if (!datasetId) {
                console.warn(`Could not extract dataset ID from SSB URL: ${apiUrl}`);
                return null;
            }
            
            const cacheName = DATASET_MAPPINGS.ssb[datasetId];
            if (!cacheName) {
                console.warn(`No cache mapping found for dataset ID: ${datasetId}`);
                return null;
            }
            
            cachePath = rel(`${API_CONFIG.CACHE_BASE_PATH}/ssb/${cacheName}.json`);
            
        } else if (apiUrl.includes('norges-bank.no')) {
            // Map Norges Bank URLs to cache files (support both USD+EUR bundle and single-currency endpoints)
            if (apiUrl.includes('/EXR/')) {
                cachePath = rel(`${API_CONFIG.CACHE_BASE_PATH}/norges-bank/exchange-rates.json`);
            } else if (apiUrl.includes('/IR/')) {
                cachePath = rel(`${API_CONFIG.CACHE_BASE_PATH}/norges-bank/interest-rate.json`);
            } else if (apiUrl.includes('/GOVT_KEYFIGURES/')) {
                cachePath = rel(`${API_CONFIG.CACHE_BASE_PATH}/norges-bank/government-debt.json`);
            } else {
                console.warn(`Unknown Norges Bank API URL: ${apiUrl}`);
                return null;
            }
        } else if (apiUrl.startsWith('./data/cached/') || apiUrl.startsWith('data/cached/')) {
            // Handle static data files in cache directory
            cachePath = rel(apiUrl);
        } else if (apiUrl.startsWith('./data/') || apiUrl.startsWith('data/')) {
            // Handle static data files (legacy path)
            cachePath = rel(apiUrl.replace(/^\.?\/?data\//, './data/cached/'));
        } else {
            console.warn(`Unknown data source: ${apiUrl}`);
            return null;
        }

        // Fetch data from cache file with logging
        console.log(`Loading cached data from: ${cachePath}`);
        
        // Log fetch attempt to debug panel
        const li = document.createElement('li');
        li.textContent = `GET ${cachePath} ...`;
        document.getElementById('fetchStatus')?.appendChild(li);
        
        let response;
        try {
            response = await fetch(cachePath, { 
                cache: 'no-store',
                headers: {
                    'Accept': 'application/json'
                }
            });
            li.textContent = `GET ${cachePath} → ${response.status}`;
            
            if (!response.ok) {
                throw new Error(`Failed to load cached data: ${response.status} ${response.statusText} for ${cachePath}`);
            }
        } catch (error) {
            li.textContent = `GET ${cachePath} → ERROR: ${error.message}`;
            console.error(`Failed to load ${cachePath}:`, error);
            // Don't throw here, just return null to allow other charts to continue loading
            return null;
        }

        let data;
        try {
            data = await response.json();
            console.log(`Successfully loaded data for ${chartTitle}:`, data.dataset ? 'Dataset found' : 'No dataset');
        } catch (error) {
            console.error(`Failed to parse JSON for ${chartTitle}:`, error);
            // Don't throw here, just return null to allow other charts to continue loading
            return null;
        }
        
        // Parse data based on source
        let parsedData;
        let ssbSelectedContentLabel = null;
        try {
            if (apiUrl.includes('ssb.no')) {
                // Capture selected content label for subtitle if available
                const contentInfo = getSSBSelectedContentLabel(data, chartTitle);
                ssbSelectedContentLabel = contentInfo?.label || null;
                parsedData = parseSSBData(data, chartTitle);
            } else if (apiUrl.includes('norges-bank.no')) {
                // Choose parser based on endpoint
                if (apiUrl.includes('/EXR/')) {
                    // Try to pick series from title if specified (e.g., "USD/NOK" or "EUR/NOK")
                    let preferredBaseCur = null;
                    if (/USD/i.test(chartTitle)) preferredBaseCur = 'USD';
                    if (/EUR/i.test(chartTitle)) preferredBaseCur = 'EUR';
                    parsedData = parseExchangeRateData(data, preferredBaseCur);
                } else if (apiUrl.includes('/IR/')) {
                    parsedData = parseInterestRateData(data);
                } else if (apiUrl.includes('/GOVT_KEYFIGURES/')) {
                    parsedData = parseGovernmentDebtData(data);
                } else {
                    console.warn(`Unknown Norges Bank endpoint in URL: ${apiUrl}`);
                    return null;
                }
            } else if (apiUrl.startsWith('./data/cached/') || apiUrl.startsWith('data/cached/') || apiUrl.startsWith('./data/') || apiUrl.startsWith('data/')) {
                // Handle static data files
                parsedData = parseStaticData(data, chartTitle);
            } else {
                console.warn(`Unknown data source: ${apiUrl}`);
                return null;
            }
        } catch (error) {
            console.error(`Failed to parse data for ${chartTitle}:`, error);
            return null;
        }
        
        if (!parsedData || parsedData.length < 2) {
            console.warn(`No sufficient data points after parsing for ${chartTitle}`);
            return null;
        }
        
        console.log(`Parsed ${parsedData.length} data points for ${chartTitle}`);
        
        // Filter data from 2000 onwards, but be more lenient for charts with limited data
        const filteredData = parsedData.filter(item => {
            const year = new Date(item.date).getFullYear();
            return year >= 2000;
        });

        // If we have very few data points, use all data regardless of year
        // This helps with charts that only have recent data (like weekly salmon exports)
        const finalFiltered = filteredData.length >= 2 ? filteredData : 
                             parsedData.length >= 2 ? parsedData : 
                             filteredData;

        // Aggregate by month for bar charts
        const finalData = chartType === 'bar' ? aggregateDataByMonth(finalFiltered) : finalFiltered;

        // Mobile optimization - limit data points on mobile for better performance
        const isMobile = window.innerWidth < 768;
        const optimizedData = optimizeDataForMobile(finalData, isMobile);

        // Optional subtitle from SSB content label (e.g., "(2015=100)")
        if (ssbSelectedContentLabel && ssbSelectedContentLabel.includes('(')) {
            const paren = ssbSelectedContentLabel.match(/\([^\)]*\)/);
            if (paren && paren[0]) {
                setChartSubtitle(canvas, paren[0]);
            }
        }

        // Render the chart
        renderChart(canvas, optimizedData, chartTitle, chartType);
        
        return true; // Indicate success

    } catch (error) {
        console.error(`Error loading data for ${canvasId} (${chartTitle}):`, error);
        // Don't show error for individual chart failures, just log them
        // showError(`Failed to load ${chartTitle} data: ${error.message}`, canvas);
        return null; // Return null to indicate failure
    }
}


/**
 * Parse SSB PXWeb JSON format into usable data
 * @param {Object} ssbData - SSB data object
 * @param {string} chartTitle - Chart title for content code selection
 * @returns {Array} Parsed data points
 */
function parseSSBDataGeneric(ssbData, chartTitle) {
    try {
        const dataset = ssbData.dataset;
        const dimByName = dataset.dimension;
        const values = dataset.value;

        if (!dimByName || !values) throw new Error('Invalid SSB dataset');

        const dims = Array.isArray(dataset.id) ? dataset.id : Object.keys(dimByName);
        const sizes = Array.isArray(dataset.size) ? dataset.size : dims.map(d => {
            const idx = dimByName[d]?.category?.index || {};
            return Object.keys(idx).length || 1;
        });

        const timeDimName = 'Tid';
        const timeDim = dimByName[timeDimName];
        if (!timeDim) throw new Error('Time dimension not found in SSB data');
        const timeLabels = timeDim.category.label;
        const timeIndexMap = timeDim.category.index;

        // Pick content code index if present
        let contentsIndex = 0;
        if (dimByName.ContentsCode) {
            const contentLabels = dimByName.ContentsCode.category.label;
            const contentIndices = dimByName.ContentsCode.category.index;
            const preferred = Object.entries(contentLabels).find(([_, lbl]) =>
                lbl.toLowerCase().includes('index') ||
                lbl.toLowerCase().includes('total') ||
                lbl.toLowerCase().includes('rate') ||
                lbl.toLowerCase().includes('main')
            );
            const key = preferred ? preferred[0] : Object.keys(contentIndices)[0];
            contentsIndex = contentIndices[key] ?? 0;
        }

        // Choose default category index for non-time, non-contents dims
        function pickDefaultIndexForDim(dimName) {
            const dim = dimByName[dimName];
            if (!dim?.category?.index) return 0;
            const labels = dim.category.label || {};
            const indices = dim.category.index || {};
            // Prefer labels implying totals/national
            const preferredKey = Object.keys(labels).find(k => {
                const lbl = (labels[k] + '').toLowerCase();
                return lbl.includes('total') || lbl.includes('the whole country') || lbl.includes('hele landet') || k === '0' || k === '99';
            });
            if (preferredKey && typeof indices[preferredKey] === 'number') return indices[preferredKey];
            const firstKey = Object.keys(indices)[0];
            return typeof indices[firstKey] === 'number' ? indices[firstKey] : 0;
        }

        // Precompute multipliers for flatten index
        const multipliers = new Array(dims.length).fill(1);
        for (let i = 0; i < dims.length - 1; i++) {
            let prod = 1;
            for (let j = i + 1; j < dims.length; j++) prod *= sizes[j];
            multipliers[i] = prod;
        }
        multipliers[dims.length - 1] = 1;

        const timePos = dims.findIndex(d => d === timeDimName);
        const contentsPos = dims.findIndex(d => d === 'ContentsCode');

        const dataPoints = [];
        Object.keys(timeLabels).forEach(timeKey => {
            const timeLabel = timeLabels[timeKey];
            const tIdx = timeIndexMap[timeKey];
            const date = parseTimeLabel(timeLabel);
            if (!date) return;

            const idxPerDim = new Array(dims.length).fill(0);
            for (let k = 0; k < dims.length; k++) {
                const dn = dims[k];
                if (k === timePos) {
                    idxPerDim[k] = tIdx;
                } else if (k === contentsPos) {
                    idxPerDim[k] = contentsIndex;
                } else {
                    idxPerDim[k] = pickDefaultIndexForDim(dn);
                }
            }
            // Flatten index
            let flat = 0;
            for (let k = 0; k < dims.length; k++) {
                flat += idxPerDim[k] * multipliers[k];
            }
            if (flat < values.length) {
                const v = values[flat];
                if (v !== null && v !== undefined) {
                    dataPoints.push({ date, value: Number(v) });
                }
            }
        });

        dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
        return dataPoints;
    } catch (error) {
        console.error('Error parsing SSB data:', error);
        throw new Error('Invalid SSB data format');
    }
}

function parseSSBDataLegacy(ssbData, chartTitle) {
    try {
        const dataset = ssbData.dataset;
        const dimension = dataset.dimension;
        const value = dataset.value;

        const timeDimension = dimension.Tid;
        if (!timeDimension) {
            throw new Error('Time dimension not found in SSB data');
        }

        const timeLabels = timeDimension.category.label;
        const timeIndex = timeDimension.category.index;

        let targetSeriesIndex = 0;
        let numSeries = 1;

        if (dimension.ContentsCode) {
            const contentLabels = dimension.ContentsCode.category.label;
            const contentIndices = dimension.ContentsCode.category.index;
            let found = false;
            for (const [key, label] of Object.entries(contentLabels)) {
                const l = String(label).toLowerCase();
                if (
                    l.includes('index') ||
                    l.includes('total') ||
                    l.includes('rate') ||
                    l.includes('main')
                ) {
                    targetSeriesIndex = contentIndices[key];
                    found = true;
                    break;
                }
            }
            if (!found && Object.keys(contentIndices).length > 0) {
                const firstKey = Object.keys(contentIndices)[0];
                targetSeriesIndex = contentIndices[firstKey];
            }
            numSeries = Object.keys(contentIndices).length || 1;
        }

        const dataPoints = [];
        Object.keys(timeLabels).forEach(timeKey => {
            const timeLabel = timeLabels[timeKey];
            const timeIndexValue = timeIndex[timeKey];
            const date = parseTimeLabel(timeLabel);
            if (!date) return;

            const valueIndex = timeIndexValue * numSeries + targetSeriesIndex;
            if (valueIndex < value.length) {
                const v = value[valueIndex];
                if (v !== undefined && v !== null) {
                    dataPoints.push({ date, value: Number(v) });
                }
            }
        });

        dataPoints.sort((a, b) => a.date - b.date);
        return dataPoints;
    } catch (e) {
        return [];
    }
}

export function parseSSBData(ssbData, chartTitle) {
    const generic = parseSSBDataGeneric(ssbData, chartTitle) || [];
    const sufficient = generic.length >= 3 && new Set(generic.map(p => p.value)).size > 1;
    if (sufficient) return generic;
    const legacy = parseSSBDataLegacy(ssbData, chartTitle) || [];
    return legacy.length ? legacy : generic;
}

/**
 * Determine selected SSB content label (e.g., for index base like (2015=100))
 */
export function getSSBSelectedContentLabel(ssbData, chartTitle) {
    try {
        const dataset = ssbData.dataset;
        const dimension = dataset.dimension;
        if (!dimension || !dimension.ContentsCode) return null;
        const contentLabels = dimension.ContentsCode.category.label;
        const contentIndices = dimension.ContentsCode.category.index;

        for (const [key, label] of Object.entries(contentLabels)) {
            if (label.includes('Consumer Price Index') ||
                label.toLowerCase().includes('index') ||
                label.toLowerCase().includes('rate') ||
                label.toLowerCase().includes('total')) {
                return { key, index: contentIndices[key], label };
            }
        }
        const firstKey = Object.keys(contentIndices)[0];
        return firstKey ? { key: firstKey, index: contentIndices[firstKey], label: contentLabels[firstKey] } : null;
    } catch (e) {
        return null;
    }
}

function setChartSubtitle(canvas, text) {
    try {
        const card = canvas.closest('.chart-card');
        const subtitle = card?.querySelector('.chart-subtitle');
        if (subtitle && !subtitle.textContent) {
            subtitle.textContent = text;
        }
    } catch(_) {}
}

/**
 * Parse Norges Bank exchange rate data
 * @param {Object} data - Norges Bank data object
 * @returns {Array} Parsed data points
 */
export function parseExchangeRateData(data, preferredBaseCurrency = null) {
    try {
        const structure = data.data.structure;
        const timeDim = structure.dimensions.observation.find(d => d.id === 'TIME_PERIOD');
        const timeValues = timeDim?.values || [];
        const seriesMap = data.data.dataSets[0].series;

        // Determine series keys and optionally filter by base currency if requested
        const seriesKeys = Object.keys(seriesMap).filter(sk => {
            if (!preferredBaseCurrency) return true;
            // Series key format: "FREQ_INDEX:BASE_CUR_INDEX:QUOTE_CUR_INDEX:TENOR_INDEX"
            const parts = sk.split(':');
            const baseIndex = parseInt(parts[1], 10);
            const baseCur = structure.dimensions.series[1].values[baseIndex].id;
            return baseCur === preferredBaseCurrency;
        });

        const allPoints = [];
        seriesKeys.forEach(sk => {
            const observations = seriesMap[sk].observations;
            Object.keys(observations).forEach(obsIdxStr => {
                const obsIdx = parseInt(obsIdxStr, 10);
                const timeObj = timeValues[obsIdx];
                const timeId = (typeof timeObj === 'string') ? timeObj : timeObj?.id; // NB sometimes uses plain strings
                const val = observations[obsIdxStr][0];
                if (timeId && val !== null && val !== undefined) {
                    const [y, m] = timeId.split('-');
                    const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
                    allPoints.push({ date, value: parseFloat(val) });
                }
            });
        });

        return allPoints.sort((a, b) => new Date(a.date) - new Date(b.date));

    } catch (error) {
        console.error('Error parsing exchange rate data:', error);
        throw new Error('Invalid exchange rate data format');
    }
}

/**
 * Parse Norges Bank interest rate data
 * @param {Object} data - Norges Bank data object
 * @returns {Array} Parsed data points
 */
export function parseInterestRateData(data) {
    try {
        // Handle SDMX-JSON format from Norges Bank
        const dataSet = data.data.dataSets[0];
        const series = dataSet.series;
        const points = [];
        
        // Get time dimension from structure
        const structure = data.data.structure;
        const timeDim = structure.dimensions.observation.find(d => d.id === 'TIME_PERIOD');
        const timeValues = timeDim?.values || [];
        
        // Extract data from series
        Object.keys(series).forEach(seriesKey => {
            const observations = series[seriesKey].observations;
            Object.keys(observations).forEach(timeIndex => {
                const value = observations[timeIndex][0];
                if (value !== null && value !== undefined) {
                    // Get the actual time period from the time dimension
                    const timeObj = timeValues[parseInt(timeIndex)];
                    if (timeObj) {
                        const timeId = timeObj.id || timeObj;
                        // Parse the time period (format: "YYYY-MM")
                        const [year, month] = timeId.split('-');
                        if (year && month) {
                            const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
                            points.push({ 
                                date: date, 
                                value: Number(value) 
                            });
                        }
                    }
                }
            });
        });
        
        return points.sort((a, b) => new Date(a.date) - new Date(b.date));

    } catch (error) {
        console.error('Error parsing interest rate data:', error);
        throw new Error('Invalid interest rate data format');
    }
}

/**
 * Parse Norges Bank government debt data
 * @param {Object} data - Norges Bank data object
 * @returns {Array} Parsed data points
 */
export function parseGovernmentDebtData(data) {
    try {
        // Handle SDMX-JSON format from Norges Bank
        const dataSet = data.data.dataSets[0];
        const series = dataSet.series;
        const points = [];
        
        // Extract time periods from the series keys
        Object.keys(series).forEach(seriesKey => {
            const observations = series[seriesKey].observations;
            Object.keys(observations).forEach(timeIndex => {
                const value = observations[timeIndex][0];
                if (value !== null && value !== undefined) {
                    // Calculate the actual date based on the time index
                    // The time index corresponds to the position in the time series
                    const date = new Date(2000, 0, 1); // Start from 2000-01-01
                    date.setMonth(date.getMonth() + parseInt(timeIndex));
                    
                    points.push({ 
                        date: date, 
                        value: Number(value) 
                    });
                }
            });
        });
        
        return points.sort((a, b) => a.date - b.date);

    } catch (error) {
        console.error('Error parsing government debt data:', error);
        throw new Error('Invalid government debt data format');
    }
}

/**
 * Create political datasets for chart coloring
 * @param {Array} data - Data points
 * @param {string} title - Chart title
 * @param {string} chartType - Chart type
 * @returns {Array} Chart datasets
 */
export function createPoliticalDatasets(data, title, chartType = 'line') {
    const datasets = [];
    const periods = {};
    
    // Group data by political period
    data.forEach(item => {
        const period = getPoliticalPeriod(item.date);
        if (period) {
            if (!periods[period.name]) {
                periods[period.name] = {
                    label: period.name,
                    data: [],
                    borderColor: period.color,
                    backgroundColor: period.backgroundColor,
                    borderWidth: 2,
                    fill: false
                };
            }
            periods[period.name].data.push({
                x: item.date,
                y: item.value
            });
        }
    });
    
    // Convert to array and sort by start date to paint continuous segments without gaps
    const periodDatasets = Object.values(periods).map(ds => {
        ds.data.sort((a, b) => new Date(a.x) - new Date(b.x));
        return ds;
    });
    periodDatasets.sort((a, b) => new Date(a.data[0]?.x || 0) - new Date(b.data[0]?.x || 0));
    periodDatasets.forEach(ds => datasets.push(ds));
    
    return datasets;
}

/**
 * Render Chart.js chart with political party colored lines
 * @param {HTMLElement} canvas - Canvas element
 * @param {Array} data - Data points
 * @param {string} title - Chart title
 * @param {string} chartType - Chart type
 */
export function renderChart(canvas, data, title, chartType = 'line') {
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded');
        showError('Chart.js library not loaded', canvas);
        return;
    }
    
    // Clear any existing chart
    if (canvas.chart) {
        canvas.chart.destroy();
    }

                    let chartData;
                if (chartType === 'line') {
                    // Single dataset with segment coloring for seamless line without gaps
                    chartData = {
                        labels: data.map(item => item.date),
                        datasets: [
                            {
                                label: title,
                                data: data.map(item => ({ x: item.date, y: item.value })),
                                borderWidth: 2,
                                borderColor: '#3b82f6',
                                fill: false,
                                segment: {
                                    borderColor: (ctx) => {
                                        const xVal = ctx.p0?.parsed?.x;
                                        const period = xVal ? getPoliticalPeriod(new Date(xVal)) : null;
                                        return period?.color || '#3b82f6';
                                    }
                                }
                            }
                        ]
                    };
    } else {
        // Bar charts: use single color for now (Chart.js bar charts don't support array colors easily)
        // We'll use the most common political period color or default
        const periods = data.map(item => getPoliticalPeriod(item.date)).filter(Boolean);
        const mostCommonPeriod = periods.length > 0 ? 
            periods.sort((a, b) => 
                periods.filter(p => p.name === a.name).length - 
                periods.filter(p => p.name === b.name).length
            ).pop() : null;
        
        chartData = {
            labels: data.map(item => item.date),
            datasets: [
                {
                    label: title,
                    data: data.map(item => ({ x: item.date, y: item.value })),
                    backgroundColor: mostCommonPeriod ? mostCommonPeriod.backgroundColor : 'rgba(59,130,246,0.2)',
                    borderColor: mostCommonPeriod ? mostCommonPeriod.color : '#3b82f6',
                    borderWidth: 1
                }
            ]
        };
    }

    // Get current theme colors from CSS variables
    const axisColor = getComputedStyle(document.documentElement).getPropertyValue('--axis-color').trim();
    const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--grid-color').trim();
    
    // Create chart options with theme-aware colors
    const chartOptions = {
        ...CHART_CONFIG,
        scales: {
            ...CHART_CONFIG.scales,
            x: {
                ...CHART_CONFIG.scales?.x,
                ticks: {
                    ...CHART_CONFIG.scales?.x?.ticks,
                    color: axisColor
                },
                grid: {
                    ...CHART_CONFIG.scales?.x?.grid,
                    color: gridColor
                }
            },
            y: {
                ...CHART_CONFIG.scales?.y,
                ticks: {
                    ...CHART_CONFIG.scales?.y?.ticks,
                    color: axisColor
                },
                grid: {
                    ...CHART_CONFIG.scales?.y?.grid,
                    color: gridColor
                }
            }
        }
    };
    
    // Create the chart
    canvas.chart = new Chart(canvas, {
        type: chartType,
        data: chartData,
        options: chartOptions
    });

    // Add static tooltip functionality
    const tooltipId = canvas.id.replace('-chart', '-tooltip');
    const tooltipElement = document.getElementById(tooltipId);
    
    if (tooltipElement) {
        // Add mouse move event listener to canvas
        canvas.addEventListener('mousemove', function(event) {
            const points = canvas.chart.getElementsAtEventForMode(event, 'index', { intersect: false });
            if (points.length > 0) {
                const firstPoint = points[0];
                const context = canvas.chart.getDatasetMeta(firstPoint.datasetIndex).data[firstPoint.index];
                updateStaticTooltip(canvas.chart, tooltipId, context);
            }
        });
        
        // Hide tooltip when mouse leaves canvas
        canvas.addEventListener('mouseleave', function() {
            hideStaticTooltip(tooltipId);
        });
    }

    // Store chart instance for filtering
    if (!window.chartInstances) {
        window.chartInstances = {};
    }
    window.chartInstances[canvas.id] = canvas.chart;
}

/**
 * Parse static data files (like oil fund data)
 * @param {Object} data - Static data object
 * @param {string} chartTitle - Chart title
 * @returns {Array} Parsed data points
 */
export function parseStaticData(data, chartTitle) {
    try {
        if (chartTitle.includes('Oil Fund')) {
            // Parse oil fund data
            return data.data.map(item => ({
                date: new Date(item.year, 0, 1), // January 1st of the year
                value: item.total
            }));
        } else {
            // Generic static data parser
            if (data.data && Array.isArray(data.data)) {
                return data.data.map(item => {
                    const date = item.date ? new Date(item.date) : 
                               item.year ? new Date(item.year, 0, 1) : 
                               new Date();
                    return {
                        date: date,
                        value: item.value || item.total || item.amount || 0
                    };
                });
            }
        }
        
        return [];
    } catch (error) {
        console.error('Error parsing static data:', error);
        return [];
    }
}
