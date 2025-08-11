// Political party periods for background shading (post-2000)
const POLITICAL_PERIODS = [
    {
        name: "Jens Stoltenberg I (Ap)",
        start: "2000-03-17",
        end: "2001-10-19",
        color: "rgba(224, 60, 49, 0.1)", // Ap red
        borderColor: "rgba(224, 60, 49, 0.3)"
    },
    {
        name: "Kjell Magne Bondevik II (KrF, H, V)",
        start: "2001-10-19",
        end: "2005-10-17",
        color: "rgba(255, 204, 0, 0.1)", // KrF yellow
        borderColor: "rgba(255, 204, 0, 0.3)"
    },
    {
        name: "Jens Stoltenberg II (Ap, SV, Sp)",
        start: "2005-10-17",
        end: "2013-10-16",
        color: "rgba(224, 60, 49, 0.1)", // Ap red
        borderColor: "rgba(224, 60, 49, 0.3)"
    },
    {
        name: "Erna Solberg (H, FrP; later V, KrF)",
        start: "2013-10-16",
        end: "2021-10-14",
        color: "rgba(0, 90, 163, 0.1)", // H blue
        borderColor: "rgba(0, 90, 163, 0.3)"
    },
    {
        name: "Jonas Gahr Støre (Ap, Sp)",
        start: "2021-10-14",
        end: "2025-01-04",
        color: "rgba(224, 60, 49, 0.1)", // Ap red
        borderColor: "rgba(224, 60, 49, 0.3)"
    }
];

// Chart configuration and styling
const CHART_CONFIG = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: '#667eea',
            borderWidth: 1
        }
    },
    scales: {
        x: {
            type: 'time',
            time: {
                unit: 'month',
                displayFormats: {
                    month: 'MMM yyyy'
                }
            },
            grid: {
                display: false
            },
            ticks: {
                maxTicksLimit: 12
            }
        },
        y: {
            grid: {
                color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
                callback: function(value) {
                    return value.toLocaleString();
                }
            }
        }
    },
    elements: {
        point: {
            radius: 3,
            hoverRadius: 6
        },
        line: {
            tension: 0.1
        }
    }
};

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    updateLastUpdated();
    initializeCharts();
});

// Update the last updated timestamp
function updateLastUpdated() {
    const now = new Date();
    const timeString = now.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('update-time').textContent = timeString;
}

// Initialize all charts
async function initializeCharts() {
    try {
        // Load CPI data
        await loadChartData('cpi-chart', 'https://data.ssb.no/api/v0/dataset/1086.json?lang=en', 'CPI');
        
        // For demonstration, we'll use the same CPI data for unemployment
        // In a real implementation, you'd use a different SSB endpoint
        await loadChartData('unemployment-chart', 'https://data.ssb.no/api/v0/dataset/1086.json?lang=en', 'Unemployment Rate');
        
    } catch (error) {
        console.error('Error initializing charts:', error);
        showError('Failed to load chart data. Please try again later.');
    }
}

// Load and render chart data
async function loadChartData(canvasId, apiUrl, chartTitle) {
    try {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas with id '${canvasId}' not found`);
            return;
        }

        // Show loading state
        showLoading(canvas);

        // Fetch data from SSB API
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Parse SSB PXWeb JSON format
        const parsedData = parseSSBData(data);
        
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

// Parse SSB PXWeb JSON format into usable data
function parseSSBData(ssbData) {
    try {
        const dataset = ssbData.dataset;
        const dimension = dataset.dimension;
        const value = dataset.value;

        // Find time dimension - it's an object, not an array
        const timeDimension = dimension.Tid;
        if (!timeDimension) {
            throw new Error('Time dimension not found in SSB data');
        }

        // Get time labels and indices
        const timeLabels = timeDimension.category.label;
        const timeIndex = timeDimension.category.index;

        // Parse data points
        const dataPoints = [];
        
        // Iterate through the time periods
        Object.keys(timeLabels).forEach(timeKey => {
            const timeLabel = timeLabels[timeKey];
            const timeIndexValue = timeIndex[timeKey];
            
            // Parse the time label (format: "2023M01" for monthly data)
            const date = parseTimeLabel(timeLabel);
            
            if (date) {
                // Get the value for this time period
                // In SSB data, values are indexed by the time index
                const dataValue = value[timeIndexValue];
                
                if (dataValue !== undefined && dataValue !== null) {
                    dataPoints.push({
                        date: date,
                        value: parseFloat(dataValue)
                    });
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

// Render Chart.js chart with political party shading
function renderChart(canvas, data, title) {
    // Clear any existing chart
    if (canvas.chart) {
        canvas.chart.destroy();
    }

    // Prepare data for Chart.js
    const chartData = {
        labels: data.map(item => item.date),
        datasets: [{
            label: title,
            data: data.map(item => item.value),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1
        }]
    };

    // Create political period annotations for background shading
    const annotations = createPoliticalAnnotations(data);

    // Merge chart config with annotations
    const config = {
        ...CHART_CONFIG,
        plugins: {
            ...CHART_CONFIG.plugins,
            annotation: {
                annotations: annotations
            }
        }
    };

    // Create the chart
    canvas.chart = new Chart(canvas, {
        type: 'line',
        data: chartData,
        options: config
    });
}

// Create political period annotations for background shading
function createPoliticalAnnotations(data) {
    const annotations = [];
    
    POLITICAL_PERIODS.forEach(period => {
        const startDate = new Date(period.start);
        const endDate = new Date(period.end);
        
        // Check if this period overlaps with our data
        const dataStart = new Date(data[0].date);
        const dataEnd = new Date(data[data.length - 1].date);
        
        if (endDate >= dataStart && startDate <= dataEnd) {
            annotations.push({
                type: 'box',
                xMin: Math.max(startDate, dataStart),
                xMax: Math.min(endDate, dataEnd),
                backgroundColor: period.color,
                borderColor: period.borderColor,
                borderWidth: 1,
                label: {
                    content: period.name,
                    position: 'start',
                    display: false
                }
            });
        }
    });
    
    return annotations;
}

// Show loading state
function showLoading(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#666';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Loading data...', canvas.width / 2, canvas.height / 2);
}

// Show error state
function showError(message, canvas = null) {
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#c33';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Error loading data', canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 10);
    } else {
        // Show global error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        document.querySelector('main').prepend(errorDiv);
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
