// Political party periods for chart coloring (post-2000)
const POLITICAL_PERIODS = [
    {
        name: "Jens Stoltenberg I (Ap)",
        start: "2000-03-17",
        end: "2001-10-19",
        color: "#E03C31", // Ap red
        backgroundColor: "rgba(224, 60, 49, 0.1)"
    },
    {
        name: "Kjell Magne Bondevik II (KrF, H, V)",
        start: "2001-10-19",
        end: "2005-10-17",
        color: "#FFCC00", // KrF yellow
        backgroundColor: "rgba(255, 204, 0, 0.1)"
    },
    {
        name: "Jens Stoltenberg II (Ap, SV, Sp)",
        start: "2005-10-17",
        end: "2013-10-16",
        color: "#E03C31", // Ap red
        backgroundColor: "rgba(224, 60, 49, 0.1)"
    },
    {
        name: "Erna Solberg (H, FrP; later V, KrF)",
        start: "2013-10-16",
        end: "2021-10-14",
        color: "#005AA3", // H blue
        backgroundColor: "rgba(0, 90, 163, 0.1)"
    },
    {
        name: "Jonas Gahr Støre (Ap, Sp)",
        start: "2021-10-14",
        end: "2025-09-08", // Extended until next election
        color: "#E03C31", // Ap red
        backgroundColor: "rgba(224, 60, 49, 0.1)"
    }
];

// Ultra-compact chart configuration
const CHART_CONFIG = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: '#333',
            borderWidth: 0,
            cornerRadius: 3,
            padding: 6,
            titleFont: { size: 9, weight: '500' },
            bodyFont: { size: 8 },
            displayColors: false,
            callbacks: {
                title: function(context) {
                    const date = new Date(context[0].label);
                    return date.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short',
                        day: 'numeric'
                    });
                },
                label: function(context) {
                    return context.dataset.label + ': ' + context.parsed.y.toLocaleString();
                }
            }
        }
    },
    scales: {
        x: {
            type: 'time',
            time: {
                unit: 'month',
                displayFormats: { month: 'MMM yy' }
            },
            grid: { display: false },
            ticks: {
                maxTicksLimit: 2,
                font: { size: 7 },
                color: '#666'
            },
            border: { display: false }
        },
        y: {
            grid: {
                color: 'rgba(0, 0, 0, 0.02)',
                drawBorder: false
            },
            ticks: {
                callback: function(value) {
                    return value.toLocaleString();
                },
                font: { size: 7 },
                color: '#666',
                padding: 1
            },
            border: { display: false }
        }
    },
    elements: {
        point: {
            radius: 0,
            hoverRadius: 2,
            hoverBackgroundColor: '#1a1a1a'
        },
        line: {
            tension: 0.1,
            borderWidth: 1,
            fill: false
        },
        bar: {
            borderWidth: 0,
            borderRadius: 1
        }
    }
};

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
});

// Initialize all charts
async function initializeCharts() {
    try {
        // Show loading screen
        const loadingScreen = document.getElementById('loading-screen');
        
        // Load all charts in parallel
        const chartPromises = [
            // Original charts
            loadChartData('cpi-chart', 'https://data.ssb.no/api/v0/dataset/1086.json?lang=en', 'CPI'),
            loadChartData('unemployment-chart', 'https://data.ssb.no/api/v0/dataset/1054.json?lang=en', 'Unemployment Rate'),
            loadChartData('house-prices-chart', 'https://data.ssb.no/api/v0/dataset/1060.json?lang=en', 'House Price Index'),
            loadChartData('ppi-chart', 'https://data.ssb.no/api/v0/dataset/26426.json?lang=en', 'Producer Price Index'),
            loadChartData('wage-chart', 'https://data.ssb.no/api/v0/dataset/1124.json?lang=en', 'Wage Index'),
            loadOilFundData('oil-fund-chart', 'data/oil-fund.json', 'Oil Fund Value'),
            loadExchangeRateData('exchange-chart', 'https://data.norges-bank.no/api/data/EXR/M.USD+EUR.NOK.SP?format=sdmx-json&startPeriod=2015-08-11&endPeriod=2025-08-01&locale=no', 'USD/NOK'),
            loadInterestRateData('interest-rate-chart', 'https://data.norges-bank.no/api/data/IR/M.KPRA..?format=sdmx-json&startPeriod=2000-01-01&endPeriod=2025-08-01&locale=no', 'Key Policy Rate'),
            loadGovernmentDebtData('govt-debt-chart', 'https://data.norges-bank.no/api/data/GOVT_KEYFIGURES/V_O+N_V+V_I+ATRI+V_IRS..B.GBON?endPeriod=2025-08-01&format=sdmx-json&locale=no&startPeriod=2000-01-01', 'Government Debt'),
            
            // New charts
            loadChartData('gdp-growth-chart', 'https://data.ssb.no/api/v0/dataset/59012.json?lang=en', 'GDP Growth', 'bar'),
            loadChartData('trade-balance-chart', 'https://data.ssb.no/api/v0/dataset/58962.json?lang=en', 'Trade Balance', 'bar'),
            loadChartData('bankruptcies-chart', 'https://data.ssb.no/api/v0/dataset/95265.json?lang=en', 'Bankruptcies', 'bar'),
            loadChartData('population-growth-chart', 'https://data.ssb.no/api/v0/dataset/49626.json?lang=en', 'Population Growth'),
            loadChartData('construction-costs-chart', 'https://data.ssb.no/api/v0/dataset/26944.json?lang=en', 'Construction Costs')
        ];
        
        // Wait for all charts to load
        await Promise.allSettled(chartPromises);
        
        // Hide loading screen with fade out
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 500);
        
    } catch (error) {
        console.error('Error initializing charts:', error);
        showError('Failed to load chart data. Please try again later.');
        
        // Hide loading screen even if there's an error
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

// Load and render chart data
async function loadChartData(canvasId, apiUrl, chartTitle, chartType = 'line') {
    try {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas with id '${canvasId}' not found`);
            return;
        }

        // Fetch data from SSB API
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Parse SSB PXWeb JSON format
        const parsedData = parseSSBData(data, chartTitle);
        
        // Filter data from 2000 onwards
        const filteredData = parsedData.filter(item => {
            const year = new Date(item.date).getFullYear();
            return year >= 2000;
        });

        if (filteredData.length === 0) {
            throw new Error('No data available for the specified period');
        }

        // Render the chart
        renderChart(canvas, filteredData, chartTitle, chartType);

    } catch (error) {
        console.error(`Error loading data for ${canvasId}:`, error);
        showError(`Failed to load ${chartTitle} data. Please try again later.`, canvas);
    }
}

// Parse SSB PXWeb JSON format into usable data
function parseSSBData(ssbData, chartTitle) {
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
                    label.includes('Construction cost')) {
                    targetSeriesIndex = contentIndices[key];
                    break;
                }
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

// Parse SSB time labels (e.g., "2023M01" -> Date object)
function parseTimeLabel(timeLabel) {
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

// Render Chart.js chart with political party colored lines
function renderChart(canvas, data, title, chartType = 'line') {
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
}

// Create modern datasets with political period colors
function createPoliticalDatasets(data, title, chartType = 'line') {
    const dataset = {
        label: title,
        data: data.map(item => item.value),
        borderColor: '#1a1a1a',
        backgroundColor: chartType === 'bar' ? 'rgba(26, 26, 26, 0.1)' : 'rgba(26, 26, 26, 0.05)',
        borderWidth: chartType === 'bar' ? 0 : 1.2,
        fill: chartType === 'bar' ? true : false,
        tension: 0.2,
        segment: chartType === 'line' ? {
            borderColor: ctx => {
                const dataIndex = ctx.p1DataIndex;
                const itemDate = new Date(data[dataIndex].date);
                
                for (const period of POLITICAL_PERIODS) {
                    const startDate = new Date(period.start);
                    const endDate = new Date(period.end);
                    
                    if (itemDate >= startDate && itemDate <= endDate) {
                        return period.color;
                    }
                }
                
                return '#1a1a1a';
            }
        } : undefined
    };
    
    return [dataset];
}

// Show error state
function showError(message, canvas = null) {
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#c33';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Error loading data', canvas.width / 2, canvas.height / 2 - 8);
        ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 8);
    } else {
        // Show global error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        document.querySelector('main').prepend(errorDiv);
    }
}

// Load and render oil fund data
async function loadOilFundData(canvasId, dataUrl, chartTitle) {
    try {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas with id '${canvasId}' not found`);
            return;
        }



        // Fetch data from local JSON file
        const response = await fetch(dataUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Parse oil fund data
        const parsedData = parseOilFundData(data);
        
        // Filter data from 2000 onwards
        const filteredData = parsedData.filter(item => {
            const year = new Date(item.date).getFullYear();
            return year >= 2000;
        });

        if (filteredData.length === 0) {
            throw new Error('No data available for the specified period');
        }

        // Render the chart
        renderChart(canvas, filteredData, chartTitle);

    } catch (error) {
        console.error(`Error loading data for ${canvasId}:`, error);
        showError(`Failed to load ${chartTitle} data. Please try again later.`, canvas);
    }
}

// Parse oil fund JSON data into usable format
function parseOilFundData(oilFundData) {
    try {
        const dataPoints = [];
        
        oilFundData.data.forEach(item => {
            // Create date for January 1st of each year
            const date = new Date(item.year, 0, 1);
            
            dataPoints.push({
                date: date,
                value: item.total // Use total value in billions NOK
            });
        });

        // Sort by date
        dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        return dataPoints;

    } catch (error) {
        console.error('Error parsing oil fund data:', error);
        throw new Error('Invalid oil fund data format');
    }
}

// Load and render exchange rate data
async function loadExchangeRateData(canvasId, apiUrl, chartTitle) {
    try {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas with id '${canvasId}' not found`);
            return;
        }

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const parsedData = parseExchangeRateData(data);
        
        const filteredData = parsedData.filter(item => {
            const year = new Date(item.date).getFullYear();
            return year >= 2000;
        });

        if (filteredData.length === 0) {
            throw new Error('No data available for the specified period');
        }

        renderChart(canvas, filteredData, chartTitle);

    } catch (error) {
        console.error(`Error loading data for ${canvasId}:`, error);
        showError(`Failed to load ${chartTitle} data. Please try again later.`, canvas);
    }
}

// Load and render interest rate data
async function loadInterestRateData(canvasId, apiUrl, chartTitle) {
    try {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas with id '${canvasId}' not found`);
            return;
        }

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const parsedData = parseInterestRateData(data);
        
        const filteredData = parsedData.filter(item => {
            const year = new Date(item.date).getFullYear();
            return year >= 2000;
        });

        if (filteredData.length === 0) {
            throw new Error('No data available for the specified period');
        }

        renderChart(canvas, filteredData, chartTitle);

    } catch (error) {
        console.error(`Error loading data for ${canvasId}:`, error);
        showError(`Failed to load ${chartTitle} data. Please try again later.`, canvas);
    }
}

// Load and render government debt data
async function loadGovernmentDebtData(canvasId, apiUrl, chartTitle) {
    try {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas with id '${canvasId}' not found`);
            return;
        }

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const parsedData = parseGovernmentDebtData(data);
        
        const filteredData = parsedData.filter(item => {
            const year = new Date(item.date).getFullYear();
            return year >= 2000;
        });

        if (filteredData.length === 0) {
            throw new Error('No data available for the specified period');
        }

        renderChart(canvas, filteredData, chartTitle);

    } catch (error) {
        console.error(`Error loading data for ${canvasId}:`, error);
        showError(`Failed to load ${chartTitle} data. Please try again later.`, canvas);
    }
}

// Parse Norges Bank exchange rate data
function parseExchangeRateData(data) {
    try {
        const dataPoints = [];
        const series = data.data.dataSets[0].series;
        
        // Parse USD/NOK (series 0:0:0:0)
        if (series['0:0:0:0'] && series['0:0:0:0'].observations) {
            Object.keys(series['0:0:0:0'].observations).forEach(key => {
                const value = series['0:0:0:0'].observations[key][0];
                // Calculate proper date from index (starting from 2015-09)
                const monthOffset = parseInt(key);
                const month = 9 + monthOffset;
                const year = 2015 + Math.floor((month - 1) / 12);
                const actualMonth = ((month - 1) % 12) + 1;
                const date = new Date(year, actualMonth - 1, 1);
                dataPoints.push({
                    date: date,
                    value: parseFloat(value)
                });
            });
        }

        dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
        return dataPoints;

    } catch (error) {
        console.error('Error parsing exchange rate data:', error);
        throw new Error('Invalid exchange rate data format');
    }
}

// Parse Norges Bank interest rate data
function parseInterestRateData(data) {
    try {
        const dataPoints = [];
        const series = data.data.dataSets[0].series;
        
        // Parse Key Policy Rate (series 0:0:0:0)
        if (series['0:0:0:0'] && series['0:0:0:0'].observations) {
            Object.keys(series['0:0:0:0'].observations).forEach(key => {
                const value = series['0:0:0:0'].observations[key][0];
                // Calculate proper date from index (starting from 2000-01)
                const monthOffset = parseInt(key);
                const month = 1 + monthOffset;
                const year = 2000 + Math.floor((month - 1) / 12);
                const actualMonth = ((month - 1) % 12) + 1;
                const date = new Date(year, actualMonth - 1, 1);
                dataPoints.push({
                    date: date,
                    value: parseFloat(value)
                });
            });
        }

        dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
        return dataPoints;

    } catch (error) {
        console.error('Error parsing interest rate data:', error);
        throw new Error('Invalid interest rate data format');
    }
}

// Parse Norges Bank government debt data
function parseGovernmentDebtData(data) {
    try {
        const dataPoints = [];
        const series = data.data.dataSets[0].series;
        
        // Find the series with the most observations (likely the main government debt series)
        let bestSeries = null;
        let maxObservations = 0;
        
        Object.keys(series).forEach(seriesKey => {
            const seriesData = series[seriesKey];
            if (seriesData.observations) {
                const observationCount = Object.keys(seriesData.observations).length;
                if (observationCount > maxObservations) {
                    maxObservations = observationCount;
                    bestSeries = seriesKey;
                }
            }
        });
        
        if (bestSeries && series[bestSeries].observations) {
            Object.keys(series[bestSeries].observations).forEach(key => {
                const value = series[bestSeries].observations[key][0];
                // Calculate proper date from index (starting from 2000-01)
                const monthOffset = parseInt(key);
                const month = 1 + monthOffset;
                const year = 2000 + Math.floor((month - 1) / 12);
                const actualMonth = ((month - 1) % 12) + 1;
                const date = new Date(year, actualMonth - 1, 1);
                dataPoints.push({
                    date: date,
                    value: parseFloat(value)
                });
            });
        }

        dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
        return dataPoints;

    } catch (error) {
        console.error('Error parsing government debt data:', error);
        throw new Error('Invalid government debt data format');
    }
}

// Utility function to add more charts easily
function addChart(canvasId, apiUrl, title) {
    return loadChartData(canvasId, apiUrl, title);
}

// Export functions for potential external use
window.NorwayDashboard = {
    addChart,
    POLITICAL_PERIODS,
    parseSSBData
};
