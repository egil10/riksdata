// ============================================================================
// NORWAY HOMICIDE RATE CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';

/**
 * Fetch Norway homicide rate data from the JSON file
 * @returns {Promise<Object>} The homicide rate data
 */
async function fetchHomicideRateData() {
    try {
        const response = await fetch('./data/static/norway_homicide_rate.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching homicide rate data:', error);
        throw error;
    }
}

/**
 * Render Norway homicide rate chart
 * @param {string} canvasId - Canvas element ID
 * @returns {Promise<Chart|null>} Chart.js instance or null
 */
export async function renderHomicideRateChart(canvasId) {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) {
        console.warn(`Canvas with id '${canvasId}' not found`);
        return null;
    }

    try {
        const data = await fetchHomicideRateData();
        const sortedData = data.data.sort((a, b) => a.Year - b.Year);
        
        const chartData = {
            labels: sortedData.map(d => d.Year),
            datasets: [{
                label: 'Homicide Rate (per 100,000 population)',
                data: sortedData.map(d => d.value),
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                borderColor: 'rgba(220, 53, 69, 0.9)', // Red
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                fill: false,
                tension: 0.1
            }]
        };

        const exportData = sortedData.map(d => ({
            year: d.Year,
            entity: d.Entity,
            code: d.Code,
            value: d.value,
            series: 'Homicide Rate'
        }));
        registerChartData(canvasId, exportData);

        const options = {
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
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    cornerRadius: 6,
                    displayColors: false,
                    callbacks: {
                        title: function(context) {
                            return `Year: ${context[0].label}`;
                        },
                        label: function(context) {
                            return `Homicide Rate: ${context.parsed.y.toFixed(2)} per 100,000`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    display: true,
                    title: {
                        display: true,
                        text: 'Year',
                        color: 'rgba(0, 0, 0, 0.7)',
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(0, 0, 0, 0.6)',
                        font: {
                            size: 11
                        },
                        maxTicksLimit: 10
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Rate per 100,000 population',
                        color: 'rgba(0, 0, 0, 0.7)',
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(0, 0, 0, 0.6)',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return value.toFixed(2);
                        }
                    },
                    min: 0
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            elements: {
                point: {
                    hoverBackgroundColor: 'rgba(220, 53, 69, 1)',
                    hoverBorderColor: 'rgba(255, 255, 255, 1)',
                    hoverBorderWidth: 2
                }
            }
        };

        const chart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: options
        });

        return chart;
    } catch (error) {
        console.error('Error rendering homicide rate chart:', error);
        throw error;
    }
}
