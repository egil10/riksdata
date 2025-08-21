// ============================================================================
// NORWAY MATERNAL MORTALITY CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';

/**
 * Fetch Norway maternal mortality data from the JSON file
 * @returns {Promise<Object>} The maternal mortality data
 */
async function fetchMaternalMortalityData() {
    try {
        const response = await fetch('./data/static/norway_maternal_mortality.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching maternal mortality data:', error);
        throw error;
    }
}

/**
 * Render Norway maternal mortality chart
 * @param {string} canvasId - Canvas element ID
 * @returns {Promise<Chart|null>} Chart.js instance or null
 */
export async function renderMaternalMortalityChart(canvasId) {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) {
        console.warn(`Canvas with id '${canvasId}' not found`);
        return null;
    }

    try {
        const data = await fetchMaternalMortalityData();
        const sortedData = data.data.sort((a, b) => a.Year - b.Year);
        
        const chartData = {
            labels: sortedData.map(d => d.Year),
            datasets: [{
                label: 'Maternal Mortality Rate (per 100,000 live births)',
                data: sortedData.map(d => d.value),
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                borderColor: 'rgba(255, 99, 132, 0.9)', // Pink/Red
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                fill: false,
                tension: 0.1
            }]
        };

        const exportData = sortedData.map(d => ({
            year: d.Year,
            entity: d.Entity,
            code: d.Code,
            value: d.value,
            series: 'Maternal Mortality Rate'
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
                            return `Maternal Mortality: ${context.parsed.y.toFixed(1)} per 100,000`;
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
                        text: 'Deaths per 100,000 live births',
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
                            return value.toFixed(1);
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
                    hoverBackgroundColor: 'rgba(255, 99, 132, 1)',
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
        console.error('Error rendering maternal mortality chart:', error);
        throw error;
    }
}
