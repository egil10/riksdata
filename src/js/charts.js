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

/**
 * Load and render chart data from cached files
 * @param {string} canvasId - Canvas element ID
 * @param {string} apiUrl - Original API URL
 * @param {string} chartTitle - Chart title
 * @param {string} chartType - Chart type (line, bar, etc.)
 */
export async function loadChartData(canvasId, apiUrl, chartTitle, chartType = 'line') {
    try {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            throw new Error(`Canvas with id '${canvasId}' not found`);
        }

        // Determine cache file path based on API URL
        let cachePath;
        if (apiUrl.includes('ssb.no')) {
            // Extract dataset ID from SSB URL
            const datasetId = apiUrl.match(/dataset\/(\d+)\.json/)?.[1];
            if (!datasetId) {
                throw new Error('Could not extract dataset ID from SSB URL');
            }
            
            const cacheName = DATASET_MAPPINGS.ssb[datasetId];
            if (!cacheName) {
                throw new Error(`No cache mapping found for dataset ID: ${datasetId}`);
            }
            
            cachePath = `${API_CONFIG.CACHE_BASE_PATH}/ssb/${cacheName}.json`;
            
        } else if (apiUrl.includes('norges-bank.no')) {
            // Map Norges Bank URLs to cache files
            if (apiUrl.includes('EXR/M.USD+EUR.NOK.SP')) {
                cachePath = `${API_CONFIG.CACHE_BASE_PATH}/norges-bank/exchange-rates.json`;
            } else if (apiUrl.includes('IR/M.KPRA')) {
                cachePath = `${API_CONFIG.CACHE_BASE_PATH}/norges-bank/interest-rate.json`;
            } else if (apiUrl.includes('GOVT_KEYFIGURES')) {
                cachePath = `${API_CONFIG.CACHE_BASE_PATH}/norges-bank/government-debt.json`;
            } else {
                throw new Error(`Unknown Norges Bank API URL: ${apiUrl}`);
            }
        } else if (apiUrl.startsWith('data/')) {
            // Handle static data files
            cachePath = apiUrl;
        } else {
            throw new Error(`Unknown data source: ${apiUrl}`);
        }

        // Fetch data from cache file
        console.log(`Loading cached data from: ${cachePath}`);
        const response = await fetch(cachePath);
        if (!response.ok) {
            throw new Error(`Failed to load cached data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Successfully loaded data for ${chartTitle}:`, data.dataset ? 'Dataset found' : 'No dataset');
        
        // Parse data based on source
        let parsedData;
        if (apiUrl.includes('ssb.no')) {
            parsedData = parseSSBData(data, chartTitle);
        } else if (apiUrl.includes('norges-bank.no')) {
            if (chartTitle.includes('Exchange Rate')) {
                parsedData = parseExchangeRateData(data);
            } else if (chartTitle.includes('Interest Rate')) {
                parsedData = parseInterestRateData(data);
            } else if (chartTitle.includes('Government Debt')) {
                parsedData = parseGovernmentDebtData(data);
            } else {
                throw new Error(`Unknown Norges Bank chart type: ${chartTitle}`);
            }
        } else if (apiUrl.startsWith('data/')) {
            // Handle static data files
            parsedData = parseStaticData(data, chartTitle);
        } else {
            throw new Error(`Unknown data source: ${apiUrl}`);
        }
        
        if (!parsedData || parsedData.length === 0) {
            throw new Error('No data points after parsing');
        }
        
        console.log(`Parsed ${parsedData.length} data points for ${chartTitle}`);
        
        // Filter data from 2000 onwards
        const filteredData = parsedData.filter(item => {
            const year = new Date(item.date).getFullYear();
            return year >= 2000;
        });

        if (filteredData.length === 0) {
            throw new Error('No data available from 2000 onwards');
        }

        // Aggregate by month for bar charts
        const finalData = chartType === 'bar' ? aggregateDataByMonth(filteredData) : filteredData;

        // Render the chart
        renderChart(canvas, finalData, chartTitle, chartType);

    } catch (error) {
        console.error(`Error loading data for ${canvasId} (${chartTitle}):`, error);
        showError(`Failed to load ${chartTitle} data: ${error.message}`, canvas);
    }
}

/**
 * Parse SSB PXWeb JSON format into usable data
 * @param {Object} ssbData - SSB data object
 * @param {string} chartTitle - Chart title for content code selection
 * @returns {Array} Parsed data points
 */
export function parseSSBData(ssbData, chartTitle) {
    try {
        const dataset = ssbData.dataset;
        const dimension = dataset.dimension;
        const value = dataset.value; // This is a list, not an object

        // Find time dimension
        const timeDimension = dimension.Tid;
        if (!timeDimension) {
            throw new Error('Time dimension not found in SSB data');
        }

        // Get time labels and indices
        const timeLabels = timeDimension.category.label;
        const timeIndex = timeDimension.category.index;

        // Find the main data series
        let targetSeriesIndex = 0;
        let numSeries = 1;
        
        if (dimension.ContentsCode) {
            const contentLabels = dimension.ContentsCode.category.label;
            const contentIndices = dimension.ContentsCode.category.index;
            
            // Find the right content code based on the data type
            let found = false;
            for (const [key, label] of Object.entries(contentLabels)) {
                if (label.includes('Consumer Price Index (2015=100)') || 
                    label.includes('Unemployment rate (LFS)') ||
                    label.includes('Producer Price Index') ||
                    label.includes('House Price Index') ||
                    label.includes('Wage Index') ||
                    label.includes('GDP') ||
                    label.includes('Trade balance') ||
                    label.includes('Bankruptcies') ||
                    label.includes('Population') ||
                    label.includes('Construction cost') ||
                    label.includes('Industrial production') ||
                    label.includes('Retail sales') ||
                    label.includes('Export') ||
                    label.includes('Import') ||
                    label.includes('Employment') ||
                    label.includes('Business confidence') ||
                    label.includes('Consumer confidence') ||
                    label.includes('Housing starts') ||
                    label.includes('Oil price') ||
                    label.includes('Monetary aggregates') ||
                    label.includes('Job vacancies') ||
                    label.includes('Household consumption') ||
                    label.includes('Credit indicator') ||
                    label.includes('Energy consumption') ||
                    label.includes('Government revenue') ||
                    label.includes('International accounts') ||
                    label.includes('Labour cost') ||
                    label.includes('R&D') ||
                    label.includes('Salmon export') ||
                    label.includes('Oil & gas investment') ||
                    label.includes('Immigration') ||
                    label.includes('Household income') ||
                    label.includes('Life expectancy') ||
                    label.includes('Crime rate') ||
                    label.includes('Education level') ||
                    label.includes('Holiday property') ||
                    label.includes('Greenhouse gas') ||
                    label.includes('Economic forecasts') ||
                    label.includes('New dwellings') ||
                    label.includes('Lifestyle habits') ||
                    label.includes('Long-term illness') ||
                    label.includes('Births and deaths') ||
                    label.includes('CPI-ATE') ||
                    label.includes('Basic salary') ||
                    label.includes('Export by country') ||
                    label.includes('Import by country') ||
                    label.includes('Export by commodity') ||
                    label.includes('Import by commodity') ||
                    label.includes('Construction cost wood') ||
                    label.includes('Construction cost multi') ||
                    label.includes('Wholesale retail') ||
                    label.includes('Household types') ||
                    label.includes('Population by age') ||
                    label.includes('CPI Coicop') ||
                    label.includes('CPI Sub-groups') ||
                    label.includes('CPI Items') ||
                    label.includes('CPI Delivery') ||
                    label.includes('Household income size') ||
                    label.includes('Cohabiting arrangements') ||
                    label.includes('Utility floor space') ||
                    label.includes('Oil gas turnover') ||
                    label.includes('Trade volume price') ||
                    label.includes('Producer price industry') ||
                    label.includes('Deaths by age') ||
                    label.includes('Energy accounts') ||
                    label.includes('Monetary M3') ||
                    label.includes('Business tendency')) {
                    targetSeriesIndex = contentIndices[key];
                    found = true;
                    break;
                }
            }
            
            // If no specific content code found, use the first one
            if (!found && Object.keys(contentIndices).length > 0) {
                const firstKey = Object.keys(contentIndices)[0];
                targetSeriesIndex = contentIndices[firstKey];
                console.log(`Using first content code for ${chartTitle}: ${contentLabels[firstKey]}`);
            }
            
            numSeries = Object.keys(contentIndices).length;
        }

        // Parse data points
        const dataPoints = [];
        
        // Iterate through the time periods
        Object.keys(timeLabels).forEach(timeKey => {
            const timeLabel = timeLabels[timeKey];
            const timeIndexValue = timeIndex[timeKey];
            
            // Parse the time label (format: "2023M01" for monthly data)
            const date = parseTimeLabel(timeLabel);
            
            if (date) {
                // Calculate the correct index in the value array
                // The array is organized by: [series1_time1, series2_time1, series3_time1, series1_time2, series2_time2, ...]
                const valueIndex = timeIndexValue * numSeries + targetSeriesIndex;
                
                if (valueIndex < value.length) {
                    const dataValue = value[valueIndex];
                    
                    // Skip null, undefined, or zero values
                    if (dataValue !== undefined && dataValue !== null && dataValue !== 0) {
                        dataPoints.push({
                            date: date,
                            value: parseFloat(dataValue)
                        });
                    }
                }
            }
        });

        // Sort by date
        dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        return dataPoints;

    } catch (error) {
        console.error('Error parsing SSB data:', error);
        throw new Error('Invalid SSB data format');
    }
}

/**
 * Parse Norges Bank exchange rate data
 * @param {Object} data - Norges Bank data object
 * @returns {Array} Parsed data points
 */
export function parseExchangeRateData(data) {
    try {
        const dataSets = data.data.dataSets[0];
        const series = dataSets.series;
        const dataPoints = [];

        Object.keys(series).forEach(seriesKey => {
            const seriesData = series[seriesKey];
            const observations = seriesData.observations;
            
            Object.keys(observations).forEach(obsKey => {
                const value = observations[obsKey][0];
                if (value !== null && value !== undefined) {
                    // Parse observation key as date (format: "0" = first period, "1" = second period, etc.)
                    const periodIndex = parseInt(obsKey);
                    const date = new Date(2020 + periodIndex); // Simplified date mapping
                    
                    dataPoints.push({
                        date: date,
                        value: parseFloat(value)
                    });
                }
            });
        });

        return dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));

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
        const dataSets = data.data.dataSets[0];
        const series = dataSets.series;
        const dataPoints = [];

        Object.keys(series).forEach(seriesKey => {
            const seriesData = series[seriesKey];
            const observations = seriesData.observations;
            
            Object.keys(observations).forEach(obsKey => {
                const value = observations[obsKey][0];
                if (value !== null && value !== undefined) {
                    const periodIndex = parseInt(obsKey);
                    const date = new Date(2000 + periodIndex); // Simplified date mapping
                    
                    dataPoints.push({
                        date: date,
                        value: parseFloat(value)
                    });
                }
            });
        });

        return dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));

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
        const dataSets = data.data.dataSets[0];
        const series = dataSets.series;
        const dataPoints = [];

        Object.keys(series).forEach(seriesKey => {
            const seriesData = series[seriesKey];
            const observations = seriesData.observations;
            
            Object.keys(observations).forEach(obsKey => {
                const value = observations[obsKey][0];
                if (value !== null && value !== undefined) {
                    const periodIndex = parseInt(obsKey);
                    const date = new Date(2000 + periodIndex); // Simplified date mapping
                    
                    dataPoints.push({
                        date: date,
                        value: parseFloat(value)
                    });
                }
            });
        });

        return dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));

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
    
    // Convert to array and sort by date
    Object.values(periods).forEach(dataset => {
        dataset.data.sort((a, b) => new Date(a.x) - new Date(b.x));
        datasets.push(dataset);
    });
    
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
    // Clear any existing chart
    if (canvas.chart) {
        canvas.chart.destroy();
    }

    // Create datasets for each political period
    const datasets = createPoliticalDatasets(data, title, chartType);

    // Prepare data for Chart.js
    const chartData = {
        labels: data.map(item => item.date),
        datasets: datasets
    };

    // Create the chart
    canvas.chart = new Chart(canvas, {
        type: chartType,
        data: chartData,
        options: CHART_CONFIG
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
