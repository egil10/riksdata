// ============================================================================
// NORWAY LIFE EXPECTANCY CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';

async function fetchLifeExpectancyData() {
    try {
        const response = await fetch('./data/static/norway_life_expectancy.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching life expectancy data:', error);
        throw error;
    }
}

export async function renderLifeExpectancyChart(canvasId) {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchLifeExpectancyData();
        const sortedData = data.data.sort((a, b) => a.Year - b.Year);
        
        const chartData = {
            labels: sortedData.map(d => d.Year),
            datasets: [{
                label: 'Life Expectancy (years)',
                data: sortedData.map(d => d.value),
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                borderColor: 'rgba(54, 162, 235, 0.9)', // Blue
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                fill: false,
                tension: 0.1
            }]
        };

        const exportData = sortedData.map(d => ({
            year: d.Year,
            entity: d.Entity,
            code: d.Code,
            value: d.value,
            series: 'Life Expectancy'
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
                    callbacks: {
                        title: function(context) {
                            return `Year: ${context[0].label}`;
                        },
                        label: function(context) {
                            return `Life Expectancy: ${context.parsed.y.toFixed(1)} years`;
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
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(0, 0, 0, 0.7)',
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
                        text: 'Years',
                        color: 'rgba(0, 0, 0, 0.7)',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(0, 0, 0, 0.7)',
                        font: {
                            size: 11
                        }
                    },
                    beginAtZero: false
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        };

        const chart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: options
        });

        return chart;
    } catch (error) {
        console.error('Error rendering life expectancy chart:', error);
        throw error;
    }
}
