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
import { registerChartData } from './registry.js';

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
    // Return full data for both mobile and desktop to show complete historical data
    return data;
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
        console.log(`Loading chart: ${canvasId} - ${chartTitle}`);
        // Proceed with all charts; filtering handled elsewhere if needed
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`Canvas with id '${canvasId}' not found - skipping chart`);
            return null;
        }
        console.log(`Found canvas for ${canvasId}:`, canvas);
        console.log(`Canvas display style:`, canvas.style.display);
        console.log(`Canvas parent display style:`, canvas.parentElement.style.display);

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
            // Extract the API endpoint from the URL for mapping
            const urlMatch = apiUrl.match(/\/api\/data\/([^?]+)/);
            if (urlMatch) {
                const endpoint = urlMatch[1];
                const cacheName = DATASET_MAPPINGS.norges_bank[endpoint];
                if (cacheName) {
                    cachePath = rel(`${API_CONFIG.CACHE_BASE_PATH}/norges-bank/${cacheName}.json`);
                } else {
                    console.warn(`No cache mapping found for Norges Bank endpoint: ${endpoint}`);
                    return null;
                }
            } else {
                console.warn(`Could not extract endpoint from Norges Bank URL: ${apiUrl}`);
                return null;
            }
        } else if (apiUrl.startsWith('nve://')) {
            // Handle NVE charts - these are rendered directly from API
            return await loadNVEChart(canvasId, apiUrl, chartTitle, chartType);
        } else if (chartType === 'statnett-production-consumption') {
            // Handle Statnett production and consumption charts
            return await loadStatnettChart(canvasId, apiUrl, chartTitle, chartType);
        } else if (chartType === 'stortinget-women-count' || chartType === 'stortinget-women-percentage') {
            // Handle Stortinget women representation charts
            return await loadStortingetChart(canvasId, apiUrl, chartTitle, chartType);
        } else if (chartType.startsWith('norway-')) {
            // Handle all Norway charts using the main data loading pipeline
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.warn(`Canvas with id '${canvasId}' not found`);
                return null;
            }

            console.log(`Loading Norway chart: ${chartTitle} from ${apiUrl}`);
            
            // Fetch data using the main pipeline
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`Raw data for ${chartTitle}:`, data);
            
            const { parsedData, sourceInfo } = parseStaticData(data, chartTitle);
            console.log(`Parsed data for ${chartTitle}:`, parsedData);
            console.log(`Source info for ${chartTitle}:`, sourceInfo);
            
            if (!parsedData || parsedData.length === 0) {
                console.warn(`No data available for ${chartTitle}`);
                showNoDataState(canvasId);
                return null;
            }

            // Filter data from 1945 onwards for Norway charts
            const filteredData = parsedData.filter(item => {
                const year = new Date(item.date).getFullYear();
                return year >= 1945;
            });
            
            console.log(`Filtered data for ${chartTitle} (1945 onwards):`, filteredData.length, 'data points');

            // Register data for export
            const exportData = filteredData.map(d => ({
                date: d.date,
                value: d.value,
                series: chartTitle
            }));
            registerChartData(canvasId, exportData);

            // Render the chart using the main renderChart function
            renderChart(canvas, filteredData, chartTitle, 'line');
            
            // Check if chart was created successfully by looking at the canvas.chart property
            if (canvas.chart) {
                console.log(`Successfully rendered ${chartTitle}: ${canvasId}`);
                hideSkeleton(canvasId);
                return canvas.chart;
            } else {
                console.warn(`Failed to render ${chartTitle}: ${canvasId}`);
                showNoDataState(canvasId);
                return null;
            }
        } else if (apiUrl.startsWith('./data/static/') || apiUrl.startsWith('data/static/')) {
            // Handle OWID static data files
            cachePath = rel(apiUrl);
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
            if (!data.dataset) {
                console.warn(`No dataset found in data for ${chartTitle}:`, data);
            }
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
            } else if (apiUrl.startsWith('./data/static/') || apiUrl.startsWith('data/static/')) {
                // Handle OWID static data files
                parsedData = parseStaticData(data, chartTitle);
            } else if (apiUrl.startsWith('./data/cached/') || apiUrl.startsWith('data/cached/') || apiUrl.startsWith('./data/') || apiUrl.startsWith('data/')) {
                // Handle static data files
                if (apiUrl.includes('oseax-osebx.json')) {
                    // Handle Oslo indices data with new format
                    parsedData = parseOsloIndicesData(data, chartTitle);
                } else if (apiUrl.includes('exchange-rates/')) {
                    // Handle cached exchange rate data from Norges Bank
                    let preferredBaseCur = null;
                    if (/USD/i.test(chartTitle)) preferredBaseCur = 'USD';
                    if (/EUR/i.test(chartTitle)) preferredBaseCur = 'EUR';
                    if (/GBP/i.test(chartTitle)) preferredBaseCur = 'GBP';
                    if (/CHF/i.test(chartTitle)) preferredBaseCur = 'CHF';
                    if (/SEK/i.test(chartTitle)) preferredBaseCur = 'SEK';
                    if (/CNY/i.test(chartTitle)) preferredBaseCur = 'CNY';
                    if (/I44/i.test(chartTitle)) preferredBaseCur = 'I44';
                    parsedData = parseExchangeRateData(data, preferredBaseCur);
                } else {
                    parsedData = parseStaticData(data, chartTitle);
                }
            } else {
                console.warn(`Unknown data source: ${apiUrl}`);
                return null;
            }
        } catch (error) {
            console.error(`Failed to parse data for ${chartTitle}:`, error);
            return null;
        }
        
        if (!parsedData || parsedData.length < 1) {
            console.warn(`No data points after parsing for ${chartTitle}`);
            return null;
        }
        
        console.log(`Parsed ${parsedData.length} data points for ${chartTitle}`);
        console.log(`Sample data for ${chartTitle}:`, parsedData.slice(0, 3));
        
        // Filter data from 1945 onwards for all charts
        const filteredData = parsedData.filter(item => {
            const year = new Date(item.date).getFullYear();
            return year >= 1945;
        });

        // Use filtered data (1945 onwards) for all charts
        const finalFiltered = filteredData;

        // Aggregate by month for bar charts
        const finalData = chartType === 'bar' ? aggregateDataByMonth(finalFiltered) : finalFiltered;

        // Mobile optimization - limit data points on mobile for better performance
        const isMobile = window.innerWidth < 768;
        const optimizedData = optimizeDataForMobile(finalData, isMobile);

            // Optional subtitle from SSB content label (e.g., "(2015=100)")
    if (ssbSelectedContentLabel) {
        if (ssbSelectedContentLabel.includes('(')) {
            const paren = ssbSelectedContentLabel.match(/\([^\)]*\)/);
            if (paren && paren[0]) {
                setChartSubtitle(canvas, paren[0]);
            }
        } else if (ssbSelectedContentLabel.toLowerCase().includes('confidence indicator')) {
            // For Business Tendency Survey, show that it's a balance indicator
            setChartSubtitle(canvas, '(Balance indicator)');
        }
    }
    
    // Special subtitle for bankruptcies
    if (chartTitle.toLowerCase().includes('bankruptcies') && !chartTitle.toLowerCase().includes('total')) {
        setChartSubtitle(canvas, '(Total of all types)');
    }

        // Render the chart
        renderChart(canvas, optimizedData, chartTitle, chartType);
        
        return true; // Indicate success

    } catch (error) {
        console.error(`Error loading data for ${canvasId} (${chartTitle}):`, error);
        // Show error and hide the chart card when chart fails to load
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            showError(`Failed to load ${chartTitle} data: ${error.message}`, canvas);
        }
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
            
            // Special handling for Business Tendency Survey - prefer "Confidence Indicator"
            let preferred;
            if (chartTitle.toLowerCase().includes('business tendency') || chartTitle.toLowerCase().includes('business confidence')) {
                preferred = Object.entries(contentLabels).find(([_, lbl]) =>
                    lbl.toLowerCase().includes('confidence indicator') ||
                    lbl.toLowerCase().includes('sammensattkonj')
                );
            }
            
            // Fallback to general preferences
            if (!preferred) {
                preferred = Object.entries(contentLabels).find(([_, lbl]) =>
                    lbl.toLowerCase().includes('index') ||
                    lbl.toLowerCase().includes('total') ||
                    lbl.toLowerCase().includes('rate') ||
                    lbl.toLowerCase().includes('main')
                );
            }
            
            const key = preferred ? preferred[0] : Object.keys(contentIndices)[0];
            contentsIndex = contentIndices[key] ?? 0;
        }

        // Choose default category index for non-time, non-contents dims
        function pickDefaultIndexForDim(dimName) {
            const dim = dimByName[dimName];
            if (!dim?.category?.index) return 0;
            const labels = dim.category.label || {};
            const indices = dim.category.index || {};
            
            // Special handling for trade balance - select the main trade balance category
            if (dimName === 'HovedVareStrommer' && chartTitle.toLowerCase().includes('trade balance')) {
                // Look for "Hbtot" which is the main trade balance category
                const tradeBalanceKey = Object.keys(labels).find(k => {
                    const lbl = (labels[k] + '').toLowerCase();
                    return lbl.includes('trade balance') && lbl.includes('total exports - total imports') || k === 'Hbtot';
                });
                if (tradeBalanceKey && typeof indices[tradeBalanceKey] === 'number') {
                    console.log(`Selected trade balance category: ${labels[tradeBalanceKey]} (index: ${indices[tradeBalanceKey]})`);
                    return indices[tradeBalanceKey];
                }
            }
            
            // Special handling for household consumption - select the total consumption category
            if (dimName === 'Varer' && chartTitle.toLowerCase().includes('household consumption')) {
                // Look for "VAREKONSUM" which is the total household consumption
                const totalConsumptionKey = Object.keys(labels).find(k => {
                    const lbl = (labels[k] + '').toLowerCase();
                    return lbl.includes('household consumption of all goods') || k === 'VAREKONSUM';
                });
                if (totalConsumptionKey && typeof indices[totalConsumptionKey] === 'number') {
                    console.log(`Selected household consumption category: ${labels[totalConsumptionKey]} (index: ${indices[totalConsumptionKey]})`);
                    return indices[totalConsumptionKey];
                }
            }
            
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
        
        // Debug logging for trade balance
        if (chartTitle.toLowerCase().includes('trade balance')) {
            console.log(`Trade balance data parsing: Found ${dataPoints.length} data points`);
            if (dataPoints.length > 0) {
                console.log(`Date range: ${dataPoints[0].date} to ${dataPoints[dataPoints.length - 1].date}`);
                console.log(`Sample values: ${dataPoints.slice(0, 5).map(d => d.value).join(', ')}`);
            }
        }
        
        // Debug logging for household consumption
        if (chartTitle.toLowerCase().includes('household consumption')) {
            console.log(`Household consumption data parsing: Found ${dataPoints.length} data points`);
            if (dataPoints.length > 0) {
                console.log(`Date range: ${dataPoints[0].date} to ${dataPoints[dataPoints.length - 1].date}`);
                console.log(`Sample values: ${dataPoints.slice(0, 5).map(d => d.value).join(', ')}`);
            }
        }
        
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

/**
 * Parse oil price data by extracting oil and gas extraction data from PPI dataset
 */
function parseOilPriceData(ssbData) {
    try {
        const dataset = ssbData.dataset;
        const dimension = dataset.dimension;
        const value = dataset.value;
        
        if (!dimension || !dimension.Tid || !dimension.NaringUtenriks) {
            console.warn('Oil price data: Missing required dimensions');
            return [];
        }
        
        const timeLabels = dimension.Tid.category.label;
        const timeIndex = dimension.Tid.category.index;
        const industryLabels = dimension.NaringUtenriks.category.label;
        const industryIndices = dimension.NaringUtenriks.category.index;
        
        // Find the oil and gas extraction category (SNN06_TOT)
        const oilGasKey = Object.keys(industryLabels).find(key => 
            industryLabels[key].toLowerCase().includes('extraction of oil and natural gas') ||
            key === 'SNN06_TOT'
        );
        
        if (!oilGasKey) {
            console.warn('Oil price data: Could not find oil and gas extraction category');
            return [];
        }
        
        const oilGasIndex = industryIndices[oilGasKey];
        console.log(`Oil price data: Using category "${industryLabels[oilGasKey]}" (index: ${oilGasIndex})`);
        
        // Calculate the number of industries and markets
        const numIndustries = Object.keys(industryIndices).length;
        const numMarkets = dimension.Marked ? Object.keys(dimension.Marked.category.index).length : 1;
        
        // Use total market (00) if available, otherwise use first market
        let marketIndex = 0;
        if (dimension.Marked) {
            const marketLabels = dimension.Marked.category.label;
            const marketIndices = dimension.Marked.category.index;
            const totalMarketKey = Object.keys(marketLabels).find(key => 
                marketLabels[key].toLowerCase().includes('total') ||
                key === '00'
            );
            if (totalMarketKey) {
                marketIndex = marketIndices[totalMarketKey];
            }
        }
        
        const dataPoints = [];
        Object.keys(timeLabels).forEach(timeKey => {
            const timeLabel = timeLabels[timeKey];
            const timeIndexValue = timeIndex[timeKey];
            const date = parseTimeLabel(timeLabel);
            if (!date) return;
            
            // Calculate the value index: time * (industries * markets) + market * industries + industry
            const valueIndex = timeIndexValue * (numIndustries * numMarkets) + marketIndex * numIndustries + oilGasIndex;
            
            if (valueIndex < value.length) {
                const v = value[valueIndex];
                if (v !== undefined && v !== null && v !== '..') {
                    dataPoints.push({ date, value: Number(v) });
                }
            }
        });
        
        dataPoints.sort((a, b) => a.date - b.date);
        console.log(`Oil price data: Extracted ${dataPoints.length} data points`);
        console.log(`Sample oil price data:`, dataPoints.slice(0, 5));
        
        // Validate data quality
        if (dataPoints.length > 0) {
            const values = dataPoints.map(p => p.value);
            const min = Math.min(...values);
            const max = Math.max(...values);
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            console.log(`Oil price data validation: min=${min}, max=${max}, avg=${avg.toFixed(2)}`);
        }
        
        return dataPoints;
    } catch (error) {
        console.error('Error parsing oil price data:', error);
        return [];
    }
}

/**
 * Parse producer prices data by extracting total PPI data from PPI dataset
 */
function parseProducerPricesData(ssbData) {
    try {
        const dataset = ssbData.dataset;
        const dimension = dataset.dimension;
        const value = dataset.value;

        if (!dimension || !dimension.Tid || !dimension.NaringUtenriks) {
            console.warn('Producer prices data: Missing required dimensions');
            return [];
        }

        const timeLabels = dimension.Tid.category.label;
        const timeIndex = dimension.Tid.category.index;
        const industryLabels = dimension.NaringUtenriks.category.label;
        const industryIndices = dimension.NaringUtenriks.category.index;

        // Find the total PPI category (SNN0)
        const totalPPIKey = Object.keys(industryLabels).find(key =>
            industryLabels[key].toLowerCase().includes('ppi total') ||
            key === 'SNN0'
        );

        if (!totalPPIKey) {
            console.warn('Producer prices data: Could not find total PPI category');
            return [];
        }

        const totalPPIIndex = industryIndices[totalPPIKey];
        console.log(`Producer prices data: Using category "${industryLabels[totalPPIKey]}" (index: ${totalPPIIndex})`);

        // Calculate the number of industries and markets
        const numIndustries = Object.keys(industryIndices).length;
        const numMarkets = dimension.Marked ? Object.keys(dimension.Marked.category.index).length : 1;

        // Use total market (00) if available, otherwise use first market
        let marketIndex = 0;
        if (dimension.Marked) {
            const marketLabels = dimension.Marked.category.label;
            const marketIndices = dimension.Marked.category.index;
            const totalMarketKey = Object.keys(marketLabels).find(key =>
                marketLabels[key].toLowerCase().includes('total') ||
                key === '00'
            );
            if (totalMarketKey) {
                marketIndex = marketIndices[totalMarketKey];
            }
        }

        const dataPoints = [];
        Object.keys(timeLabels).forEach(timeKey => {
            const timeLabel = timeLabels[timeKey];
            const timeIndexValue = timeIndex[timeKey];
            const date = parseTimeLabel(timeLabel);
            if (!date) return;

            // Calculate the value index: time * (industries * markets) + market * industries + industry
            const valueIndex = timeIndexValue * (numIndustries * numMarkets) + marketIndex * numIndustries + totalPPIIndex;

            if (valueIndex < value.length) {
                const v = value[valueIndex];
                if (v !== undefined && v !== null && v !== '..') {
                    dataPoints.push({ date, value: Number(v) });
                }
            }
        });

        dataPoints.sort((a, b) => a.date - b.date);
        console.log(`Producer prices data: Extracted ${dataPoints.length} data points`);
        return dataPoints;
    } catch (error) {
        console.error('Error parsing producer prices data:', error);
        return [];
    }
}

/**
 * Parse static oil fund data from JSON file
 */
function parseStaticOilFundData(staticData) {
    try {
        if (!staticData || !staticData.data || !Array.isArray(staticData.data)) {
            console.warn('Oil fund data: Invalid data format');
            return [];
        }

        const dataPoints = [];
        staticData.data.forEach(item => {
            if (item.year && item.total !== undefined) {
                // Create date for January 1st of each year
                const date = new Date(item.year, 0, 1);
                dataPoints.push({ 
                    date, 
                    value: Number(item.total),
                    // Store all asset classes for potential future use
                    equity: Number(item.equity),
                    fixed_income: Number(item.fixed_income),
                    real_estate: Number(item.real_estate),
                    renewable_energy: Number(item.renewable_energy)
                });
            }
        });

        dataPoints.sort((a, b) => a.date - b.date);
        console.log(`Oil fund data: Extracted ${dataPoints.length} data points`);
        console.log(`Sample oil fund data:`, dataPoints.slice(0, 3));
        
        return dataPoints;
    } catch (error) {
        console.error('Error parsing oil fund data:', error);
        return [];
    }
}

export function parseSSBData(ssbData, chartTitle) {
    // Special handling for bankruptcies - sum all bankruptcy types
    if (chartTitle.toLowerCase().includes('bankruptcies') && !chartTitle.toLowerCase().includes('total')) {
        return parseBankruptciesData(ssbData);
    }
    
    // Special handling for Credit Indicator C2 - filter for LTOT (Total loan debt) only
    if (chartTitle.toLowerCase().includes('credit indicator c2')) {
        return parseCreditIndicatorC2Data(ssbData);
    }
    
    // Special handling for Housing Starts - use "BoligIgang" (Building permits dwellings)
    if (chartTitle.toLowerCase().includes('housing starts')) {
        return parseHousingStartsData(ssbData);
    }
    
    // Special handling for Job Vacancies - use "LedigeStillinger" (Job vacancies) and filter negative values
    if (chartTitle.toLowerCase().includes('job vacancies')) {
        return parseJobVacanciesData(ssbData);
    }
    
    // Special handling for Oil Price - extract oil and gas extraction data from PPI
    if (chartTitle.toLowerCase().includes('oil price')) {
        return parseOilPriceData(ssbData);
    }
    
    // Special handling for Producer Prices - extract total PPI data from PPI dataset
    if (chartTitle.toLowerCase().includes('producer prices')) {
        return parseProducerPricesData(ssbData);
    }
    
    // Special handling for Oil Fund - parse static data
    if (chartTitle.toLowerCase().includes('oil fund')) {
        return parseStaticOilFundData(ssbData);
    }
    
    // Special handling for Crime Rate - filter for total crimes only
    if (chartTitle.toLowerCase().includes('crime rate')) {
        return parseCrimeRateData(ssbData);
    }
    
    // Special handling for Life Expectancy - filter for both sexes, age 0
    if (chartTitle.toLowerCase().includes('life expectancy')) {
        return parseLifeExpectancyData(ssbData);
    }
    
    // Special handling for Living Arrangements National - filter for total
    if (chartTitle.toLowerCase().includes('living arrangements national')) {
        return parseLivingArrangementsData(ssbData);
    }
    
    // Special handling for Trade Balance - use generic parsing with automatic content selection
    if (chartTitle.toLowerCase().includes('trade balance')) {
        const tradeBalanceData = parseSSBDataGeneric(ssbData, chartTitle) || [];
        return tradeBalanceData;
    }
    
    // Special handling for GDP Growth - use generic parsing with automatic content selection
    if (chartTitle.toLowerCase().includes('gdp growth')) {
        const gdpData = parseSSBDataGeneric(ssbData, chartTitle) || [];
        return gdpData;
    }
    
    // Special handling for Housing Starts - use generic parsing with automatic content selection
    if (chartTitle.toLowerCase().includes('housing starts')) {
        const housingData = parseSSBDataGeneric(ssbData, chartTitle) || [];
        return housingData;
    }
    
    // Special handling for Job Vacancies - use generic parsing with automatic content selection
    if (chartTitle.toLowerCase().includes('job vacancies')) {
        const jobVacancyData = parseSSBDataGeneric(ssbData, chartTitle) || [];
        return jobVacancyData;
    }
    
    // Default: try generic parsing first, then legacy if needed
    const generic = parseSSBDataGeneric(ssbData, chartTitle) || [];
    const sufficient = generic.length >= 3 && new Set(generic.map(p => p.value)).size > 1;
    if (sufficient) return generic;
    const legacy = parseSSBDataLegacy(ssbData, chartTitle) || [];
    return legacy.length ? legacy : generic;
}

/**
 * Parse bankruptcies data by summing all bankruptcy types
 */
function parseBankruptciesData(ssbData) {
    try {
        const dataset = ssbData.dataset;
        const dimension = dataset.dimension;
        const value = dataset.value;
        
        if (!dimension || !dimension.Tid || !dimension.ContentsCode) {
            return [];
        }
        
        const timeLabels = dimension.Tid.category.label;
        const timeIndex = dimension.Tid.category.index;
        const contentIndices = dimension.ContentsCode.category.index;
        const numContentTypes = Object.keys(contentIndices).length;
        
        const dataPoints = [];
        Object.keys(timeLabels).forEach(timeKey => {
            const timeLabel = timeLabels[timeKey];
            const timeIndexValue = timeIndex[timeKey];
            const date = parseTimeLabel(timeLabel);
            if (!date) return;
            
            // Sum all bankruptcy types for this time period
            let totalBankruptcies = 0;
            let hasValidData = false;
            
            for (let i = 0; i < numContentTypes; i++) {
                const valueIndex = timeIndexValue * numContentTypes + i;
                if (valueIndex < value.length) {
                    const v = value[valueIndex];
                    if (v !== undefined && v !== null) {
                        totalBankruptcies += Number(v);
                        hasValidData = true;
                    }
                }
            }
            
            if (hasValidData) {
                dataPoints.push({ date, value: totalBankruptcies });
            }
        });
        
        dataPoints.sort((a, b) => a.date - b.date);
        return dataPoints;
    } catch (error) {
        console.error('Error parsing bankruptcies data:', error);
        return [];
    }
}

/**
 * Parse Credit Indicator C2 data by filtering for LTOT (Total loan debt) only
 */
function parseCreditIndicatorC2Data(ssbData) {
    try {
        const dataset = ssbData.dataset;
        const dimension = dataset.dimension;
        const value = dataset.value;
        
        if (!dimension || !dimension.Tid || !dimension.Kredittkilde || !dimension.ContentsCode) {
            return [];
        }
        
        const timeLabels = dimension.Tid.category.label;
        const timeIndex = dimension.Tid.category.index;
        const creditSourceIndices = dimension.Kredittkilde.category.index;
        const contentIndices = dimension.ContentsCode.category.index;
        const numCreditSources = Object.keys(creditSourceIndices).length;
        const numContentTypes = Object.keys(contentIndices).length;
        
        // Find the index for LTOT (Total loan debt) and Bruttogjeld (stock value)
        const ltotIndex = creditSourceIndices['LTOT'];
        const bruttogjeldIndex = contentIndices['Bruttogjeld'];
        
        if (ltotIndex === undefined) {
            console.error('LTOT category not found in Credit Indicator data');
            return [];
        }
        
        if (bruttogjeldIndex === undefined) {
            console.error('Bruttogjeld category not found in Credit Indicator data');
            return [];
        }
        
        const dataPoints = [];
        Object.keys(timeLabels).forEach(timeKey => {
            const timeLabel = timeLabels[timeKey];
            const timeIndexValue = timeIndex[timeKey];
            const date = parseTimeLabel(timeLabel);
            if (!date) return;
            
            // Get the value for LTOT category and Bruttogjeld content type only
            const valueIndex = (timeIndexValue * numCreditSources + ltotIndex) * numContentTypes + bruttogjeldIndex;
            if (valueIndex < value.length) {
                const v = value[valueIndex];
                if (v !== undefined && v !== null) {
                    dataPoints.push({ date, value: Number(v) });
                }
            }
        });
        
        dataPoints.sort((a, b) => a.date - b.date);
        return dataPoints;
    } catch (error) {
        console.error('Error parsing Credit Indicator C2 data:', error);
        return [];
    }
}

/**
 * Parse GDP Growth data by filtering for GDP growth rate
 */
function parseGDPGrowthData(ssbData) {
    try {
        const dataset = ssbData.dataset;
        const dimension = dataset.dimension;
        const value = dataset.value;
        
        if (!dimension || !dimension.Tid || !dimension.ContentsCode || !dimension.Makrost) {
            return [];
        }
        
        const timeLabels = dimension.Tid.category.label;
        const timeIndex = dimension.Tid.category.index;
        const contentIndices = dimension.ContentsCode.category.index;
        const macroIndices = dimension.Makrost.category.index;
        const numContentTypes = Object.keys(contentIndices).length;
        const numMacroTypes = Object.keys(macroIndices).length;
        
        // Find the index for GDP growth rate (VolumEndrSesJust - quarter-over-quarter change)
        const gdpGrowthIndex = contentIndices['VolumEndrSesJust'];
        
        if (gdpGrowthIndex === undefined) {
            console.error('VolumEndrSesJust category not found in GDP data');
            return [];
        }
        
        // Find the index for Mainland Norway GDP (bnpb.nr23_9fn - Gross domestic product Mainland Norway, market values)
        const totalGDPIndex = macroIndices['bnpb.nr23_9fn'];
        
        if (totalGDPIndex === undefined) {
            console.error('bnpb.nr23_9fn category not found in GDP data');
            return [];
        }
        
        const dataPoints = [];
        Object.keys(timeLabels).forEach(timeKey => {
            const timeLabel = timeLabels[timeKey];
            const timeIndexValue = timeIndex[timeKey];
            const date = parseTimeLabel(timeLabel);
            if (!date) return;
            
            // Get the value for total GDP and quarterly growth rate
            const valueIndex = (timeIndexValue * numMacroTypes + totalGDPIndex) * numContentTypes + gdpGrowthIndex;
            if (valueIndex < value.length) {
                const v = value[valueIndex];
                if (v !== undefined && v !== null) {
                    dataPoints.push({ date, value: Number(v) });
                }
            }
        });
        
        dataPoints.sort((a, b) => a.date - b.date);
        return dataPoints;
    } catch (error) {
        console.error('Error parsing GDP Growth data:', error);
        return [];
    }
}

/**
 * Parse Housing Starts data by filtering for "BoligIgang" (Building permits dwellings)
 */
function parseHousingStartsData(ssbData) {
    try {
        const dataset = ssbData.dataset;
        const dimension = dataset.dimension;
        const value = dataset.value;
        
        if (!dimension || !dimension.Tid || !dimension.ContentsCode) {
            return [];
        }
        
        const timeLabels = dimension.Tid.category.label;
        const timeIndex = dimension.Tid.category.index;
        const contentIndices = dimension.ContentsCode.category.index;
        
        // Find the index for "BoligIgang" (Building permits dwellings)
        const boligIgangIndex = contentIndices['BoligIgang'];
        
        if (boligIgangIndex === undefined) {
            console.error('BoligIgang category not found in Housing Starts data');
            return [];
        }
        
        const dataPoints = [];
        Object.keys(timeLabels).forEach(timeKey => {
            const timeLabel = timeLabels[timeKey];
            const timeIndexValue = timeIndex[timeKey];
            const date = parseTimeLabel(timeLabel);
            if (!date) return;
            
            // Get the value for BoligIgang (Building permits dwellings)
            const valueIndex = timeIndexValue * Object.keys(contentIndices).length + boligIgangIndex;
            if (valueIndex < value.length) {
                const v = value[valueIndex];
                if (v !== undefined && v !== null) {
                    dataPoints.push({ date, value: Number(v) });
                }
            }
        });
        
        dataPoints.sort((a, b) => a.date - b.date);
        return dataPoints;
    } catch (error) {
        console.error('Error parsing Housing Starts data:', error);
        return [];
    }
}

/**
 * Parse Job Vacancies data by filtering for "LedigeStillinger" (Job vacancies) and filtering negative values
 */
function parseJobVacanciesData(ssbData) {
    try {
        const dataset = ssbData.dataset;
        const dimension = dataset.dimension;
        const value = dataset.value;
        
        if (!dimension || !dimension.Tid || !dimension.ContentsCode || !dimension.NACE2007) {
            return [];
        }
        
        const timeLabels = dimension.Tid.category.label;
        const timeIndex = dimension.Tid.category.index;
        const contentIndices = dimension.ContentsCode.category.index;
        const industryIndices = dimension.NACE2007.category.index;
        
        // Find the index for "LedigeStillinger" (Job vacancies)
        const ledigeStillingerIndex = contentIndices['LedigeStillinger'];
        
        if (ledigeStillingerIndex === undefined) {
            console.error('LedigeStillinger category not found in Job Vacancies data');
            return [];
        }
        
        // Find the index for "All industries" (01-96)
        const allIndustriesIndex = industryIndices['01-96'];
        
        if (allIndustriesIndex === undefined) {
            console.error('All industries category not found in Job Vacancies data');
            return [];
        }
        
        const numIndustries = Object.keys(industryIndices).length;
        const numContentTypes = Object.keys(contentIndices).length;
        
        const dataPoints = [];
        Object.keys(timeLabels).forEach(timeKey => {
            const timeLabel = timeLabels[timeKey];
            const timeIndexValue = timeIndex[timeKey];
            const date = parseTimeLabel(timeLabel);
            if (!date) return;
            
            // Get the value for All industries and LedigeStillinger content type
            const valueIndex = (timeIndexValue * numIndustries + allIndustriesIndex) * numContentTypes + ledigeStillingerIndex;
            if (valueIndex < value.length) {
                const v = value[valueIndex];
                if (v !== undefined && v !== null && v >= 0) { // Filter out negative values
                    dataPoints.push({ date, value: Number(v) });
                }
            }
        });
        
        dataPoints.sort((a, b) => a.date - b.date);
        return dataPoints;
    } catch (error) {
        console.error('Error parsing Job Vacancies data:', error);
        return [];
    }
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
                label.toLowerCase().includes('total') ||
                label.toLowerCase().includes('confidence indicator')) {
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
        const structure = data.data.structure;
        const points = [];
        
        // Get time dimension from structure
        const timeDimension = structure?.dimensions?.observation?.find(d => d.id === 'TIME_PERIOD');
        if (!timeDimension || !timeDimension.values) {
            console.error('Time dimension not found in government debt data');
            return [];
        }
        
        // Create time mapping: index -> date
        const timeMapping = {};
        timeDimension.values.forEach((timeValue, index) => {
            const timeStr = timeValue.id;
            // Parse date format like "2020-03-31" or "2020-06-30"
            const date = new Date(timeStr);
            if (!isNaN(date.getTime())) {
                timeMapping[index] = date;
            }
        });
        
        // Get unit multiplier from attributes
        let unitMultiplier = 1;
        if (structure?.attributes?.series) {
            const unitMultAttr = structure.attributes.series.find(attr => attr.id === 'UNIT_MULT');
            if (unitMultAttr && unitMultAttr.values && unitMultAttr.values.length > 0) {
                // Use the first unit multiplier value (usually 6 for millions or 9 for billions)
                unitMultiplier = Math.pow(10, parseInt(unitMultAttr.values[0].id));
            }
        }
        
        console.log(`Government debt unit multiplier: ${unitMultiplier} (${unitMultiplier === 1000000 ? 'millions' : unitMultiplier === 1000000000 ? 'billions' : 'units'})`);
        
        // Parse series data
        Object.keys(series).forEach(seriesKey => {
            const observations = series[seriesKey].observations;
            
            Object.keys(observations).forEach(timeIndex => {
                const value = observations[timeIndex][0];
                if (value !== null && value !== undefined) {
                    const numValue = Number(value) * unitMultiplier;
                    
                    // Get the date from mapping
                    const date = timeMapping[parseInt(timeIndex)];
                    if (date && !isNaN(numValue)) {
                        points.push({ 
                            date: date, 
                            value: numValue 
                        });
                    }
                }
            });
        });
        
        // Sort by date and remove duplicates
        const sortedPoints = points.sort((a, b) => a.date - b.date);
        const uniquePoints = [];
        const seenDates = new Set();
        
        sortedPoints.forEach(point => {
            const dateKey = point.date.toISOString().split('T')[0];
            if (!seenDates.has(dateKey)) {
                seenDates.add(dateKey);
                uniquePoints.push(point);
            }
        });
        
        console.log(`Government debt data: Extracted ${uniquePoints.length} unique data points`);
        if (uniquePoints.length > 0) {
            console.log(`Date range: ${uniquePoints[0].date.toISOString().split('T')[0]} to ${uniquePoints[uniquePoints.length - 1].date.toISOString().split('T')[0]}`);
            console.log(`Sample values: ${uniquePoints.slice(0, 5).map(p => (p.value / 1000000000).toFixed(1) + 'B').join(', ')}`);
        }
        
        return uniquePoints;

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
 * @param {Object} sourceInfo - Source information object
 */
export function renderChart(canvas, data, title, chartType = 'line') {
    console.log(`Rendering chart: ${title} with ${data.length} data points`);
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
                                spanGaps: false,
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
                    console.log(`Chart data for ${title}:`, {
                        labels: chartData.labels.length,
                        dataPoints: chartData.datasets[0].data.length,
                        sampleData: chartData.datasets[0].data.slice(0, 3)
                    });
    } else {
        // Bar charts: color each bar individually by political party
        let chartData;
        
        // Special styling for Housing Starts chart
        if (title === 'Housing Starts') {
            chartData = {
                labels: data.map(item => item.date),
                datasets: [
                    {
                        label: title,
                        data: data.map(item => ({ x: item.date, y: item.value })),
                        backgroundColor: data.map(item => {
                            const period = getPoliticalPeriod(item.date);
                            return period ? period.backgroundColor : `${accentColor}cc`; // Theme color with opacity
                        }),
                        borderColor: data.map(item => {
                            const period = getPoliticalPeriod(item.date);
                            return period ? period.color : accentColor; // Theme color
                        }),
                        borderWidth: 2,
                        borderRadius: 4,
                        borderSkipped: false
                    }
                ]
            };
        } else if (title === 'Job Vacancies') {
            // Special styling for Job Vacancies chart
            chartData = {
                labels: data.map(item => item.date),
                datasets: [
                    {
                        label: title,
                        data: data.map(item => ({ x: item.date, y: item.value })),
                        backgroundColor: data.map(item => {
                            const period = getPoliticalPeriod(item.date);
                            return period ? period.backgroundColor : `${accentColor}cc`; // Theme color with opacity
                        }),
                        borderColor: data.map(item => {
                            const period = getPoliticalPeriod(item.date);
                            return period ? period.color : accentColor; // Theme color
                        }),
                        borderWidth: 2,
                        borderRadius: 4,
                        borderSkipped: false
                    }
                ]
            };
        } else {
            // Default bar chart styling - improved with better colors and styling
            chartData = {
                labels: data.map(item => item.date),
                datasets: [
                    {
                        label: title,
                        data: data.map(item => ({ x: item.date, y: item.value })),
                        backgroundColor: data.map(item => {
                            const period = getPoliticalPeriod(item.date);
                            return period ? period.backgroundColor : `${accentColor}cc`; // Theme color with opacity
                        }),
                        borderColor: data.map(item => {
                            const period = getPoliticalPeriod(item.date);
                            return period ? period.color : accentColor; // Theme color
                        }),
                        borderWidth: 2,
                        borderRadius: 3,
                        borderSkipped: false
                    }
                ]
            };
        }
        
        console.log(`Bar chart data for ${title}:`, {
            labels: chartData.labels.length,
            dataPoints: chartData.datasets[0].data.length,
            sampleData: chartData.datasets[0].data.slice(0, 3)
        });
    }

    // Get current theme colors from CSS variables
    const textMuted = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim();
    const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--grid').trim();
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    
    // Create chart options with theme-aware colors
    let chartOptions = {
        ...CHART_CONFIG,
        scales: {
            ...CHART_CONFIG.scales,
            x: {
                ...CHART_CONFIG.scales?.x,
                ticks: {
                    ...CHART_CONFIG.scales?.x?.ticks,
                    color: textMuted
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
                    color: textMuted
                },
                grid: {
                    ...CHART_CONFIG.scales?.y?.grid,
                    color: gridColor
                }
            }
        }
    };
    
    // Special options for Government Debt chart
    if (title === 'Government Debt' && chartType === 'line') {
        chartOptions = {
            ...chartOptions,
            plugins: {
                ...CHART_CONFIG.plugins,
                tooltip: {
                    ...CHART_CONFIG.plugins?.tooltip,
                    callbacks: {
                        label: function(context) {
                            const valueInBillions = context.parsed.y / 1000000000;
                            return `${context.dataset.label}: ${valueInBillions.toFixed(1)} billion NOK`;
                        }
                    }
                }
            },
            scales: {
                ...chartOptions.scales,
                y: {
                    ...chartOptions.scales.y,
                    ticks: {
                        ...chartOptions.scales.y.ticks,
                        callback: function(value) {
                            return (value / 1000000000).toFixed(0) + 'B';
                        }
                    }
                }
            }
        };
    } else if (title === 'Housing Starts' && chartType === 'bar') {
        chartOptions = {
            ...chartOptions,
            plugins: {
                ...CHART_CONFIG.plugins,
                tooltip: {
                    ...CHART_CONFIG.plugins?.tooltip,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} dwellings`;
                        }
                    }
                }
            },
            elements: {
                ...CHART_CONFIG.elements,
                bar: {
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false,
                    backgroundColor: `${accentColor}cc`,
                    borderColor: accentColor
                }
            }
        };
    } else if (title === 'Job Vacancies' && chartType === 'bar') {
        // Special options for Job Vacancies chart
        chartOptions = {
            ...chartOptions,
            plugins: {
                ...CHART_CONFIG.plugins,
                tooltip: {
                    ...CHART_CONFIG.plugins?.tooltip,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} positions`;
                        }
                    }
                }
            },
            elements: {
                ...CHART_CONFIG.elements,
                bar: {
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false,
                    backgroundColor: `${accentColor}cc`,
                    borderColor: accentColor
                }
            }
        };
    } else if (chartType === 'bar') {
        // Default bar chart options - improved styling
        chartOptions = {
            ...chartOptions,
            plugins: {
                ...CHART_CONFIG.plugins,
                tooltip: {
                    ...CHART_CONFIG.plugins?.tooltip,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            },
            elements: {
                ...CHART_CONFIG.elements,
                bar: {
                    borderWidth: 2,
                    borderRadius: 3,
                    borderSkipped: false,
                    backgroundColor: `${accentColor}cc`,
                    borderColor: accentColor
                }
            }
        };
    }
    
    // Skip work when a dataset is missing
    if (!data || data.length === 0) {
        console.warn(`No data available for chart: ${title}`);
        hideSkeleton(canvas.id);
        showNoDataState(canvas.id);
        return;
    }
    
    // Create the chart
    console.log(`Creating Chart.js instance for ${title}...`);
    try {
        canvas.chart = new Chart(canvas, {
            type: chartType,
            data: chartData,
            options: chartOptions
        });
        console.log(`Chart created successfully for ${title}`);
        
        // Register chart data for download/copy functionality
        const chartCard = canvas.closest('.chart-card');
        if (chartCard) {
            const chartId = chartCard.getAttribute('data-chart-id');
            if (chartId) {
                // Convert chart data to the format expected by the export functions
                const exportData = data.map((item, index) => ({
                    date: item.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
                    value: item.value,
                    index: index + 1
                }));
                registerChartData(chartId, exportData);
                console.log(`Registered data for chart: ${chartId}`);
            }
        }
    } catch (error) {
        console.error(`Error creating chart for ${title}:`, error);
        throw error;
    }

    // Make sure the chart container is visible
    const chartContainer = canvas.closest('.chart-container');
    if (chartContainer) {
        chartContainer.style.display = 'block';
        chartContainer.style.visibility = 'visible';
        console.log(`Chart container display set to block for ${title}`);
    }

    // Hide the skeleton for this specific chart
    const skeletonId = canvas.id.replace('-chart', '-skeleton');
    const skeleton = document.getElementById(skeletonId);
    if (skeleton) {
        skeleton.style.display = 'none';
        console.log(`Skeleton hidden for ${title}`);
    }

    // Force a chart update to ensure it's visible
    setTimeout(() => {
        if (canvas.chart) {
            canvas.chart.update();
            console.log(`Chart updated for ${title}`);
            

        }
    }, 100);

    // Add static tooltip functionality
    const tooltipId = canvas.id.replace('-chart', '-tooltip');
    const tooltipElement = document.getElementById(tooltipId);
    
    if (tooltipElement) {
        // Add throttled mouse move event listener to canvas for better performance
        let tooltipTimeout;
        canvas.addEventListener('mousemove', function(event) {
            // Throttle tooltip updates to improve performance
            clearTimeout(tooltipTimeout);
            tooltipTimeout = setTimeout(() => {
                const points = canvas.chart.getElementsAtEventForMode(event, 'index', { intersect: false });
                if (points.length > 0) {
                    const firstPoint = points[0];
                    const context = canvas.chart.getDatasetMeta(firstPoint.datasetIndex).data[firstPoint.index];
                    updateStaticTooltip(canvas.chart, tooltipId, context);
                }
            }, 16); // ~60fps throttling
        });
        
        // Hide tooltip when mouse leaves canvas
        canvas.addEventListener('mouseleave', function() {
            clearTimeout(tooltipTimeout);
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
 * @returns {Object} Object containing parsedData array and sourceInfo
 */
export function parseStaticData(data, chartTitle) {
    try {
        // Normalize incoming shape: either {data: [...]} or just [...]
        const rows = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        if (!rows.length) return { parsedData: [], sourceInfo: null };

        // Extract source information from OWID data
        let sourceInfo = null;
        if (data.metadata && data.metadata.source_and_citation) {
            sourceInfo = {
                text: data.metadata.source_and_citation,
                url: data.metadata.dataPublishedBy?.url || null
            };
        }

        // Special case: Oil Fund cached shape (kept for compatibility)
        if (chartTitle.includes('Oil Fund')) {
            const parsedData = rows
                .map(item => {
                    const k = Object.fromEntries(Object.entries(item).map(([kk, vv]) => [kk.toLowerCase(), vv]));
                    const y = Number(k.year ?? k['år'] ?? k.date);
                    const date = Number.isFinite(y) ? new Date(y, 0, 1) : (k.date ? new Date(k.date) : null);
                    const value = Number(k.total ?? k.value ?? k.amount);
                    return { date, value };
                })
                .filter(d => d.date instanceof Date && !isNaN(d.date) && Number.isFinite(d.value));
            return { parsedData, sourceInfo };
        }

        // Generic static data parser (OWID etc.)
        const preferredNumericKeys = new Set(['value', 'total', 'amount']);
        const skipKeys = new Set(['year', 'date', 'entity', 'code', 'country', 'location', 'is_missing']);

        const parsedData = rows
            .map(item => {
                const k = Object.fromEntries(Object.entries(item).map(([kk, vv]) => [kk.toLowerCase(), vv]));

                // Build date
                let date = null;
                if (k.date) {
                    date = new Date(k.date);
                } else if (k.year) {
                    const y = Number(k.year);
                    if (Number.isFinite(y)) date = new Date(y, 0, 1);
                }

                // Find value
                let value = null;
                for (const key of preferredNumericKeys) {
                    if (k[key] != null && k[key] !== '') {
                        value = Number(k[key]);
                        break;
                    }
                }
                if (value == null || !Number.isFinite(value)) {
                    // Fallback: first numeric field that isn't a known meta key
                    for (const [key, v] of Object.entries(k)) {
                        if (skipKeys.has(key)) continue;
                        const num = Number(v);
                        if (Number.isFinite(num)) { value = num; break; }
                    }
                }

                return { date, value };
            })
            .filter(d => d.date instanceof Date && !isNaN(d.date) && Number.isFinite(d.value))
            .sort((a, b) => a.date - b.date);

        return { parsedData, sourceInfo };
    } catch (error) {
        console.error('Error parsing static data:', error);
        return { parsedData: [], sourceInfo: null };
    }
}

/**
 * Parse Oslo indices data from the new combined format
 * @param {Object} data - Oslo indices data object
 * @param {string} chartTitle - Chart title to determine which index to extract
 * @returns {Array} Parsed data points
 */
export function parseOsloIndicesData(data, chartTitle) {
    try {
        // Check if data has the new format with metadata and data properties
        if (data.metadata && data.data) {
            // New format: { metadata: {...}, data: [...] }
            return data.data.map(item => ({
                date: new Date(item.date),
                value: Number(item.value)
            })).sort((a, b) => a.date - b.date);
        } else if (data.indices) {
            // Old format: { indices: { OSEAX: {...}, OSEBX: {...} } }
            // Determine which index to extract based on chart title
            let indexKey = null;
            if (chartTitle.includes('OSEAX')) {
                indexKey = 'OSEAX';
            } else if (chartTitle.includes('OSEBX')) {
                indexKey = 'OSEBX';
            } else {
                console.error('Could not determine index type from chart title:', chartTitle);
                return [];
            }

            const indexData = data.indices[indexKey];
            if (!indexData || !indexData.data) {
                console.error(`No data found for index: ${indexKey}`);
                return [];
            }

            // Parse the data points
            return indexData.data.map(item => ({
                date: new Date(item.date),
                value: Number(item.value)
            })).sort((a, b) => a.date - b.date);
        } else {
            console.error('No valid data structure found in Oslo indices data');
            return [];
        }

    } catch (error) {
        console.error('Error parsing Oslo indices data:', error);
        return [];
    }
}

/**
 * Parse crime rate data - filter for total crimes only
 */
function parseCrimeRateData(ssbData) {
    try {
        const dataset = ssbData.dataset;
        const dimension = dataset.dimension;
        const value = dataset.value;
        
        if (!dimension || !dimension.Tid || !dimension.LovbruddKrim || !dimension.Gjerningssted) {
            return [];
        }
        
        const timeLabels = dimension.Tid.category.label;
        const timeIndex = dimension.Tid.category.index;
        const crimeTypeLabels = dimension.LovbruddKrim.category.label;
        const crimeTypeIndex = dimension.LovbruddKrim.category.index;
        const sceneLabels = dimension.Gjerningssted.category.label;
        const sceneIndex = dimension.Gjerningssted.category.index;
        
        // Find the index for "All groups of offences" and "Total" scene
        let totalCrimeIndex = null;
        let totalSceneIndex = null;
        
        Object.keys(crimeTypeLabels).forEach(key => {
            if (crimeTypeLabels[key].includes('All groups of offences')) {
                totalCrimeIndex = crimeTypeIndex[key];
            }
        });
        
        Object.keys(sceneLabels).forEach(key => {
            if (sceneLabels[key].includes('Total')) {
                totalSceneIndex = sceneIndex[key];
            }
        });
        
        if (totalCrimeIndex === null || totalSceneIndex === null) {
            console.warn('Could not find required categories in crime rate data');
            return [];
        }
        
        const dataPoints = [];
        Object.keys(timeLabels).forEach(timeKey => {
            const timeLabel = timeLabels[timeKey];
            const timeIndexValue = timeIndex[timeKey];
            const date = parseTimeLabel(timeLabel);
            if (!date) return;
            
            // Calculate value index: time * scenes * crimes + scene * crimes + crime
            const numScenes = Object.keys(sceneIndex).length;
            const numCrimes = Object.keys(crimeTypeIndex).length;
            const valueIndex = timeIndexValue * numScenes * numCrimes + totalSceneIndex * numCrimes + totalCrimeIndex;
            
            if (valueIndex < value.length) {
                const v = value[valueIndex];
                if (v !== undefined && v !== null) {
                    dataPoints.push({ date, value: Number(v) });
                }
            }
        });
        
        dataPoints.sort((a, b) => a.date - b.date);
        return dataPoints;
    } catch (error) {
        console.error('Error parsing crime rate data:', error);
        return [];
    }
}

/**
 * Parse life expectancy data - filter for both sexes, age 0
 */
function parseLifeExpectancyData(ssbData) {
    try {
        const dataset = ssbData.dataset;
        const dimension = dataset.dimension;
        const value = dataset.value;
        
        if (!dimension || !dimension.Tid || !dimension.Kjonn || !dimension.AlderX) {
            return [];
        }
        
        const timeLabels = dimension.Tid.category.label;
        const timeIndex = dimension.Tid.category.index;
        const sexLabels = dimension.Kjonn.category.label;
        const sexIndex = dimension.Kjonn.category.index;
        const ageLabels = dimension.AlderX.category.label;
        const ageIndex = dimension.AlderX.category.index;
        
        // Find the index for "Both sexes" and age "000" (0 years)
        let bothSexesIndex = null;
        let ageZeroIndex = null;
        
        Object.keys(sexLabels).forEach(key => {
            if (sexLabels[key].includes('Both sexes')) {
                bothSexesIndex = sexIndex[key];
            }
        });
        
        Object.keys(ageLabels).forEach(key => {
            if (ageLabels[key] === '000') {
                ageZeroIndex = ageIndex[key];
            }
        });
        
        if (bothSexesIndex === null || ageZeroIndex === null) {
            console.warn('Could not find "Both sexes" or age "000" in life expectancy data');
            return [];
        }
        
        const dataPoints = [];
        Object.keys(timeLabels).forEach(timeKey => {
            const timeLabel = timeLabels[timeKey];
            const timeIndexValue = timeIndex[timeKey];
            const date = parseTimeLabel(timeLabel);
            if (!date) return;
            
            // Calculate the value index based on the dimensions
            const numSexes = Object.keys(sexIndex).length;
            const numAges = Object.keys(ageIndex).length;
            const valueIndex = timeIndexValue * numSexes * numAges + bothSexesIndex * numAges + ageZeroIndex;
            
            if (valueIndex < value.length) {
                const v = value[valueIndex];
                if (v !== undefined && v !== null) {
                    dataPoints.push({ date, value: Number(v) });
                }
            }
        });
        
        dataPoints.sort((a, b) => a.date - b.date);
        return dataPoints;
    } catch (error) {
        console.error('Error parsing life expectancy data:', error);
        return [];
    }
}

/**
 * Parse living arrangements national data - filter for total
 */
function parseLivingArrangementsData(ssbData) {
    try {
        const dataset = ssbData.dataset;
        const dimension = dataset.dimension;
        const value = dataset.value;
        
        if (!dimension || !dimension.Tid || !dimension.Samlivsform || !dimension.Region) {
            return [];
        }
        
        const timeLabels = dimension.Tid.category.label;
        const timeIndex = dimension.Tid.category.index;
        const arrangementLabels = dimension.Samlivsform.category.label;
        const arrangementIndex = dimension.Samlivsform.category.index;
        const regionLabels = dimension.Region.category.label;
        const regionIndex = dimension.Region.category.index;
        
        // Find the index for "In couples, married" and "The whole country"
        let marriedIndex = null;
        let countryIndex = null;
        
        Object.keys(arrangementLabels).forEach(key => {
            if (arrangementLabels[key].includes('married')) {
                marriedIndex = arrangementIndex[key];
            }
        });
        
        Object.keys(regionLabels).forEach(key => {
            if (regionLabels[key].includes('whole country')) {
                countryIndex = regionIndex[key];
            }
        });
        
        if (marriedIndex === null || countryIndex === null) {
            console.warn('Could not find required categories in living arrangements data');
            return [];
        }
        
        const dataPoints = [];
        Object.keys(timeLabels).forEach(timeKey => {
            const timeLabel = timeLabels[timeKey];
            const timeIndexValue = timeIndex[timeKey];
            const date = parseTimeLabel(timeLabel);
            if (!date) return;
            
            // Calculate value index: time * regions * arrangements + region * arrangements + arrangement
            const numRegions = Object.keys(regionIndex).length;
            const numArrangements = Object.keys(arrangementIndex).length;
            const valueIndex = timeIndexValue * numRegions * numArrangements + countryIndex * numArrangements + marriedIndex;
            
            if (valueIndex < value.length) {
                const v = value[valueIndex];
                if (v !== undefined && v !== null) {
                    dataPoints.push({ date, value: Number(v) });
                }
            }
        });
        
        dataPoints.sort((a, b) => a.date - b.date);
        return dataPoints;
    } catch (error) {
        console.error('Error parsing living arrangements data:', error);
        return [];
    }
}

/**
 * Hide skeleton loading for a chart
 * @param {string} chartId - Chart ID
 */
function hideSkeleton(chartId) {
    const skeletonId = chartId.replace('-chart', '-skeleton');
    const skeleton = document.getElementById(skeletonId);
    if (skeleton) {
        skeleton.style.display = 'none';
        console.log(`Skeleton hidden for ${chartId}`);
    }
}

/**
 * Show no data state for a chart
 * @param {string} chartId - Chart ID
 */
function showNoDataState(chartId) {
    const canvas = document.getElementById(chartId);
    if (!canvas) return;
    
    const chartContainer = canvas.closest('.chart-container');
    if (chartContainer) {
        // Create a no data message
        const noDataDiv = document.createElement('div');
        noDataDiv.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: var(--text-muted);
            font-size: 0.875rem;
            text-align: center;
            padding: 1rem;
        `;
        noDataDiv.textContent = 'No data available';
        
        // Clear the container and add the message
        chartContainer.innerHTML = '';
        chartContainer.appendChild(noDataDiv);
    }
}

/**
 * Load and render NVE reservoir charts
 * @param {string} canvasId - Canvas element ID
 * @param {string} apiUrl - NVE API URL (e.g., nve://magasins/norge)
 * @param {string} chartTitle - Chart title
 * @param {string} chartType - Chart type
 * @returns {Promise<Chart|null>} Chart.js instance or null
 */
async function loadNVEChart(canvasId, apiUrl, chartTitle, chartType) {
    try {
        console.log(`Loading NVE chart: ${canvasId} - ${chartTitle}`);
        
        // Extract area and metric from URL (e.g., nve://magasins/norge/fillPct -> norge, fillPct)
        const urlMatch = apiUrl.match(/nve:\/\/magasins\/([^\/]+)(?:\/(.+))?/);
        if (!urlMatch) {
            console.warn(`Invalid NVE URL format: ${apiUrl}`);
            return null;
        }
        
        let area = urlMatch[1].toUpperCase();
        if (area === 'NORGE') {
            area = 'Norge'; // Special case for Norway
        }
        
        const metric = urlMatch[2] || 'fillPct'; // Default to fillPct if not specified
        
        // Load the cached NVE data
        const response = await fetch('./data/cached/nve/all-series.json');
        if (!response.ok) {
            throw new Error(`Failed to load NVE data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`Loaded NVE data for ${area}:`, data.data ? data.data.length : 'No data');
        
        if (!data.data || !Array.isArray(data.data)) {
            console.warn('Invalid NVE data format');
            return null;
        }
        
        // Filter data for the specified area and metric
        const filteredData = data.data
            .filter(item => item.area === area)
            .map(item => {
                // Convert ISO week to date
                const date = isoWeekToDate(item.year, item.week);
                const value = item[metric];
                return { date, value };
            })
            .filter(item => item.value !== null && item.value !== undefined)
            .sort((a, b) => a.date - b.date);
        
        console.log(`Filtered ${filteredData.length} data points for ${area} ${metric}`);
        
        if (filteredData.length === 0) {
            console.warn(`No data available for ${area} ${metric}`);
            showNoDataState(canvasId);
            return null;
        }
        
        // Register data for export
        const exportData = filteredData.map(d => ({
            date: d.date,
            value: d.value,
            series: `${area} ${metric}`
        }));
        registerChartData(canvasId, exportData);
        
        // Render the chart
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`Canvas with id '${canvasId}' not found`);
            return null;
        }
        
        renderChart(canvas, filteredData, chartTitle, 'line');
        
        if (canvas.chart) {
            console.log(`Successfully rendered NVE chart: ${canvasId}`);
            hideSkeleton(canvasId);
            return canvas.chart;
        } else {
            console.warn(`Failed to render NVE chart: ${canvasId}`);
            showNoDataState(canvasId);
            return null;
        }
        
    } catch (error) {
        console.error(`Failed to load NVE chart ${canvasId}:`, error);
        showNoDataState(canvasId);
        return null;
    }
}

/**
 * Convert ISO week to Date (Monday of that week)
 * @param {number} year - Year
 * @param {number} week - ISO week number
 * @returns {Date} Monday of the specified week
 */
function isoWeekToDate(year, week) {
    const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
    const dow = simple.getUTCDay(); // 0..6
    const ISOweekStart = dow <= 4 ? 
        new Date(simple.setUTCDate(simple.getUTCDate() - (dow || 7) + 1)) :
        new Date(simple.setUTCDate(simple.getUTCDate() + (8 - dow)));
    return ISOweekStart; // Mon 00:00 UTC
}

/**
 * Load and render Statnett production and consumption charts
 * @param {string} canvasId - Canvas element ID
 * @param {string} apiUrl - Statnett data file URL
 * @param {string} chartTitle - Chart title
 * @param {string} chartType - Chart type
 * @returns {Promise<Chart|null>} Chart.js instance or null
 */
async function loadStatnettChart(canvasId, apiUrl, chartTitle, chartType) {
    try {
        console.log(`Loading Statnett chart: ${canvasId} - ${chartTitle}`);
        
        // Import and render the Statnett chart
        const { createStatnettProductionConsumptionChart } = await import('./charts/statnett-production-consumption.js');
        const chart = await createStatnettProductionConsumptionChart(canvasId, apiUrl, chartTitle);
        
        if (chart) {
            console.log(`Successfully rendered Statnett chart: ${canvasId}`);
            hideSkeleton(canvasId);
        } else {
            console.warn(`Failed to render Statnett chart: ${canvasId}`);
            showNoDataState(canvasId);
        }
        
        return chart;
        
    } catch (error) {
        console.error(`Failed to load Statnett chart ${canvasId}:`, error);
        showNoDataState(canvasId);
        return null;
    }
}

/**
 * Load and render Stortinget women representation charts
 * @param {string} canvasId - Canvas element ID
 * @param {string} apiUrl - Stortinget data file URL
 * @param {string} chartTitle - Chart title
 * @param {string} chartType - Chart type
 * @returns {Promise<Chart|null>} Chart.js instance or null
 */
async function loadStortingetChart(canvasId, apiUrl, chartTitle, chartType) {
    try {
        console.log(`Loading Stortinget chart: ${canvasId} - ${chartTitle}`);
        
        // Import and render the appropriate Stortinget chart
        const { renderWomenCountChart, renderWomenPercentageChart } = await import('./charts/stortinget-women-representation.js');
        
        let chart;
        if (chartType === 'stortinget-women-count') {
            chart = await renderWomenCountChart(canvasId);
        } else if (chartType === 'stortinget-women-percentage') {
            chart = await renderWomenPercentageChart(canvasId);
        } else {
            console.warn(`Unknown Stortinget chart type: ${chartType}`);
            return null;
        }
        
        if (chart) {
            console.log(`Successfully rendered Stortinget chart: ${canvasId}`);
            hideSkeleton(canvasId);
        } else {
            console.warn(`Failed to render Stortinget chart: ${canvasId}`);
            showNoDataState(canvasId);
        }
        
        return chart;
        
    } catch (error) {
        console.error(`Failed to load Stortinget chart ${canvasId}:`, error);
        showNoDataState(canvasId);
        return null;
    }
}



