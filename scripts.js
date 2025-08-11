// Political party periods for chart coloring (post-2000) with correct Norwegian colors
const POLITICAL_PERIODS = [
    {
        name: "Kjell Magne Bondevik I (KrF, Sp, V)",
        start: "1997-10-17",
        end: "2000-03-17",
        color: "#FDED34", // Kristelig Folkeparti yellow
        backgroundColor: "rgba(253, 237, 52, 0.7)"
    },
    {
        name: "Jens Stoltenberg I (Ap)",
        start: "2000-03-17",
        end: "2001-10-19",
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)"
    },
    {
        name: "Kjell Magne Bondevik II (KrF, H, V)",
        start: "2001-10-19",
        end: "2005-10-17",
        color: "#FDED34", // Kristelig Folkeparti yellow
        backgroundColor: "rgba(253, 237, 52, 0.7)"
    },
    {
        name: "Jens Stoltenberg II (Ap, SV, Sp)",
        start: "2005-10-17",
        end: "2013-10-16",
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)"
    },
    {
        name: "Erna Solberg (H, FrP; later V, KrF)",
        start: "2013-10-16",
        end: "2021-10-14",
        color: "#87add7", // Høyre light blue
        backgroundColor: "rgba(135, 173, 215, 0.7)"
    },
    {
        name: "Jonas Gahr Støre (Ap, Sp)",
        start: "2021-10-14",
        end: "2025-09-08", // Extended until next election
        color: "#E11926", // Arbeiderpartiet red
        backgroundColor: "rgba(225, 25, 38, 0.7)"
    }
];

// Get political period for a given date
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

// Ultra-compact chart configuration with enhanced tooltips
const CHART_CONFIG = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        duration: 800,
        easing: 'easeOutQuart'
    },
    interaction: {
        mode: 'index',
        intersect: false,
    },
    plugins: {
        legend: { display: false },
        tooltip: {
            enabled: false // Disable default tooltips
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
                maxTicksLimit: 3,
                font: { size: 11 },
                color: '#6B7280'
            },
            border: { display: false }
        },
        y: {
            grid: {
                color: 'rgba(0, 0, 0, 0.05)',
                drawBorder: false
            },
            ticks: {
                callback: function(value) {
                    return value.toLocaleString();
                },
                font: { size: 11 },
                color: '#6B7280',
                padding: 4
            },
            border: { display: false }
        }
    },
    elements: {
        point: {
            radius: 0,
            hoverRadius: 6,
            hoverBackgroundColor: function(context) {
                const period = getPoliticalPeriod(context.parsed.x);
                return period ? period.color : '#1F2937';
            },
            hoverBorderColor: '#FFFFFF',
            hoverBorderWidth: 2
        },
        line: {
            tension: 0.2,
            borderWidth: 2,
            fill: false
        },
        bar: {
            borderWidth: 0,
            borderRadius: 4
        }
    }
};

// Function to create static tooltip content
function createStaticTooltipContent(context) {
    const value = context.parsed.y;
    const period = getPoliticalPeriod(context.parsed.x);
    const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
    
    let tooltipContent = `${context.dataset.label}: ${formattedValue}`;
    
    if (period) {
        const partyColors = {
            'Ap': '#E11926',
            'KrF': '#FDED34', 
            'H': '#87add7',
            'V': '#006666',
            'Sp': '#00843D',
            'SV': '#B5317C',
            'FrP': '#004F80',
            'MDG': '#6A9325'
        };
        
        // Extract party abbreviations from period name
        const partyMatch = period.name.match(/\((.*?)\)/);
        if (partyMatch) {
            const parties = partyMatch[1].split(', ');
            const partyDisplay = parties.map(party => {
                const color = partyColors[party] || '#000000';
                return `<span style="color: ${color}; font-weight: bold;">${party}</span>`;
            }).join(', ');
            
            tooltipContent += ` (${partyDisplay})`;
        }
    }
    
    return tooltipContent;
}

// Function to update static tooltip
function updateStaticTooltip(chart, tooltipId, context) {
    const tooltipElement = document.getElementById(tooltipId);
    if (tooltipElement && context) {
        const content = createStaticTooltipContent(context);
        tooltipElement.innerHTML = content;
        tooltipElement.classList.add('visible');
    }
}

// Function to hide static tooltip
function hideStaticTooltip(tooltipId) {
    const tooltipElement = document.getElementById(tooltipId);
    if (tooltipElement) {
        tooltipElement.classList.remove('visible');
    }
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    setupLanguageToggle();
    setupThemeToggle();
});

// Setup language toggle
function setupLanguageToggle() {
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', toggleLanguage);
    }
}

// Setup theme toggle
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// Toggle theme
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    
    // Update theme toggle icon
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const themeIcon = themeToggle.querySelector('.theme-icon');
        if (themeIcon) {
            if (body.classList.contains('dark-mode')) {
                // Show sun icon for dark mode
                themeIcon.innerHTML = '<path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>';
            } else {
                // Show moon icon for light mode
                themeIcon.innerHTML = '<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/>';
            }
        }
    }
}

// Update language text
function updateLanguageText(lang) {
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.textContent = lang === 'no' ? 'EN' : 'NO';
    }
}

// Toggle language
function toggleLanguage() {
    const body = document.body;
    const isEnglish = body.classList.contains('lang-en');
    
    if (isEnglish) {
        body.classList.remove('lang-en');
        body.classList.add('lang-no');
        updateLanguageText('no');
    } else {
        body.classList.remove('lang-no');
        body.classList.add('lang-en');
        updateLanguageText('en');
    }
}



// Initialize all charts
async function initializeCharts() {
    try {
        // Show loading screen
        const loadingScreen = document.getElementById('loading-screen');
        
        // Show skeleton loading for all charts
        showSkeletonLoading();
        
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
        
        // Hide skeleton loading
        hideSkeletonLoading();
        
        // Hide loading screen with fade out
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            // Enable scrolling after loading screen is hidden
            document.body.classList.add('loaded');
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
        // Enable scrolling even if there's an error
        document.body.classList.add('loaded');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

// Show skeleton loading for all charts
function showSkeletonLoading() {
    const skeletonIds = [
        'cpi-skeleton', 'unemployment-skeleton', 'house-prices-skeleton', 'ppi-skeleton',
        'wage-skeleton', 'oil-fund-skeleton', 'exchange-skeleton', 'interest-rate-skeleton',
        'govt-debt-skeleton', 'gdp-growth-skeleton', 'trade-balance-skeleton', 'bankruptcies-skeleton',
        'population-growth-skeleton', 'construction-costs-skeleton'
    ];
    
    skeletonIds.forEach(id => {
        const skeleton = document.getElementById(id);
        if (skeleton) {
            skeleton.style.display = 'block';
        }
    });
}

// Hide skeleton loading
function hideSkeletonLoading() {
    const skeletonIds = [
        'cpi-skeleton', 'unemployment-skeleton', 'house-prices-skeleton', 'ppi-skeleton',
        'wage-skeleton', 'oil-fund-skeleton', 'exchange-skeleton', 'interest-rate-skeleton',
        'govt-debt-skeleton', 'gdp-growth-skeleton', 'trade-balance-skeleton', 'bankruptcies-skeleton',
        'population-growth-skeleton', 'construction-costs-skeleton'
    ];
    
    skeletonIds.forEach(id => {
        const skeleton = document.getElementById(id);
        if (skeleton) {
            skeleton.style.opacity = '0';
            setTimeout(() => {
                skeleton.style.display = 'none';
            }, 300);
        }
    });
}

// Aggregate data by month for bar charts
function aggregateDataByMonth(data) {
    const monthlyData = {};
    
    data.forEach(item => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                sum: 0,
                count: 0,
                date: new Date(date.getFullYear(), date.getMonth(), 1)
            };
        }
        
        monthlyData[monthKey].sum += item.value;
        monthlyData[monthKey].count += 1;
    });
    
    // Convert to array and sort by date
    const result = Object.values(monthlyData).map(item => ({
        date: item.date,
        value: item.sum / item.count // Average for the month
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // For quarterly data (like GDP Growth), we might want to keep quarterly structure
    // Check if we have quarterly data by looking at the original data frequency
    const originalDates = data.map(item => new Date(item.date));
    const isQuarterly = originalDates.some(date => 
        date.getMonth() % 3 === 0 && date.getDate() === 1
    );
    
    if (isQuarterly) {
        // For quarterly data, return quarterly averages instead of monthly
        const quarterlyData = {};
        data.forEach(item => {
            const date = new Date(item.date);
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            const quarterKey = `${date.getFullYear()}-Q${quarter}`;
            
            if (!quarterlyData[quarterKey]) {
                quarterlyData[quarterKey] = {
                    sum: 0,
                    count: 0,
                    date: new Date(date.getFullYear(), (quarter - 1) * 3, 1)
                };
            }
            
            quarterlyData[quarterKey].sum += item.value;
            quarterlyData[quarterKey].count += 1;
        });
        
        return Object.values(quarterlyData).map(item => ({
            date: item.date,
            value: item.sum / item.count
        })).sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    return result;
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

        // Aggregate by month for bar charts
        const finalData = chartType === 'bar' ? aggregateDataByMonth(filteredData) : filteredData;

        // Render the chart
        renderChart(canvas, finalData, chartTitle, chartType);

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

    // Store chart instance for filtering
    if (!window.chartInstances) {
        window.chartInstances = {};
    }
    window.chartInstances[canvas.id] = canvas.chart;

    // Add static tooltip functionality
    const tooltipId = canvas.id.replace('-chart', '-tooltip');
    const tooltipElement = document.getElementById(tooltipId);
    
    if (tooltipElement) {
        // Add mouse move event listener to canvas
        canvas.addEventListener('mousemove', function(event) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            const elements = canvas.chart.getElementsAtEventForMode(
                { x: x, y: y },
                'index',
                { intersect: false }
            );
            
            if (elements.length > 0) {
                const element = elements[0];
                const context = {
                    parsed: {
                        x: canvas.chart.data.labels[element.index],
                        y: canvas.chart.data.datasets[element.datasetIndex].data[element.index]
                    },
                    dataset: {
                        label: canvas.chart.data.datasets[element.datasetIndex].label
                    }
                };
                updateStaticTooltip(canvas.chart, tooltipId, context);
            } else {
                hideStaticTooltip(tooltipId);
            }
        });
        
        // Hide tooltip when mouse leaves canvas
        canvas.addEventListener('mouseleave', function() {
            hideStaticTooltip(tooltipId);
        });
    }
}

// Create modern datasets with political period colors
function createPoliticalDatasets(data, title, chartType = 'line') {
    const dataset = {
        label: title,
        data: data.map(item => item.value),
        borderColor: '#1a1a1a',
        backgroundColor: chartType === 'bar' ? data.map(item => {
            const itemDate = new Date(item.date);
            for (const period of POLITICAL_PERIODS) {
                const startDate = new Date(period.start);
                const endDate = new Date(period.end);
                if (itemDate >= startDate && itemDate <= endDate) {
                    return period.color;
                }
            }
            return '#1a1a1a';
        }) : 'rgba(26, 26, 26, 0.05)',
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

// Diagnostic script for Riksklokken data sources
async function runDiagnostics() {
    console.log('🔍 Starting Riksklokken Diagnostics...\n');

    const dataSources = [
        { name: 'CPI', url: 'https://data.ssb.no/api/v0/dataset/1086.json?lang=en' },
        { name: 'Unemployment', url: 'https://data.ssb.no/api/v0/dataset/1054.json?lang=en' },
        { name: 'House Prices', url: 'https://data.ssb.no/api/v0/dataset/1060.json?lang=en' },
        { name: 'Producer Price Index', url: 'https://data.ssb.no/api/v0/dataset/26426.json?lang=en' },
        { name: 'Wage Index', url: 'https://data.ssb.no/api/v0/dataset/1124.json?lang=en' },
        { name: 'GDP Growth', url: 'https://data.ssb.no/api/v0/dataset/59012.json?lang=en' },
        { name: 'Trade Balance', url: 'https://data.ssb.no/api/v0/dataset/58962.json?lang=en' },
        { name: 'Bankruptcies', url: 'https://data.ssb.no/api/v0/dataset/95265.json?lang=en' },
        { name: 'Population Growth', url: 'https://data.ssb.no/api/v0/dataset/49626.json?lang=en' },
        { name: 'Construction Costs', url: 'https://data.ssb.no/api/v0/dataset/26944.json?lang=en' },
        { name: 'Exchange Rate', url: 'https://data.norges-bank.no/api/data/EXR/M.USD+EUR.NOK.SP?format=sdmx-json&startPeriod=2015-08-11&endPeriod=2025-08-01&locale=no' },
        { name: 'Interest Rate', url: 'https://data.norges-bank.no/api/data/IR/M.KPRA..?format=sdmx-json&startPeriod=2000-01-01&endPeriod=2025-08-01&locale=no' },
        { name: 'Government Debt', url: 'https://data.norges-bank.no/api/data/GOVT_KEYFIGURES/V_O+N_V+V_I+ATRI+V_IRS..B.GBON?endPeriod=2025-08-01&format=sdmx-json&locale=no&startPeriod=2000-01-01' }
    ];

    let passedTests = 0;
    let totalTests = dataSources.length;

    for (const source of dataSources) {
        try {
            console.log(`Testing ${source.name}...`);
            const response = await fetch(source.url);
            
            if (!response.ok) {
                console.log(`❌ ${source.name}: HTTP ${response.status} - ${response.statusText}`);
                continue;
            }

            const data = await response.json();
            
            if (data && (data.dataset || data.data)) {
                console.log(`✅ ${source.name}: Data structure valid`);
                passedTests++;
            } else {
                console.log(`❌ ${source.name}: Invalid data structure`);
            }
        } catch (error) {
            console.log(`❌ ${source.name}: ${error.message}`);
        }
    }

    // Test Oil Fund local data
    try {
        console.log('Testing Oil Fund local data...');
        const response = await fetch('data/oil-fund.json');
        if (response.ok) {
            const data = await response.json();
            if (data && Array.isArray(data)) {
                console.log('✅ Oil Fund: Local data valid');
                passedTests++;
            } else {
                console.log('❌ Oil Fund: Invalid local data structure');
            }
        } else {
            console.log('❌ Oil Fund: Local file not found');
        }
    } catch (error) {
        console.log(`❌ Oil Fund: ${error.message}`);
    }
    totalTests++;

    // Summary
    console.log(`\n📊 Test Results: ${passedTests}/${totalTests} data sources working`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    // Test political periods
    console.log('\n🏛️ Testing Political Periods...');
    const testDates = [
        new Date('2000-01-01'),
        new Date('2005-10-17'),
        new Date('2013-10-16'),
        new Date('2021-10-14'),
        new Date('2025-01-01')
    ];

    testDates.forEach(date => {
        const period = getPoliticalPeriod(date);
        if (period) {
            console.log(`✅ ${date.toISOString().split('T')[0]}: ${period.name}`);
        } else {
            console.log(`❌ ${date.toISOString().split('T')[0]}: No period found`);
        }
    });

    console.log(`\n🔍 Diagnostics complete!`);
}

// Run diagnostics when script is loaded
if (typeof window !== 'undefined') {
    window.runDiagnostics = runDiagnostics;
    console.log('🔍 Diagnostics script loaded. Run runDiagnostics() to test all data sources.');
}
