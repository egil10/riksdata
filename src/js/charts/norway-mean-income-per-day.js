// ============================================================================
// NORWAY MEAN INCOME PER DAY CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';

async function fetchMeanIncomePerDayData() {
    try {
        const response = await fetch('./data/static/norway_mean_income_per_day.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching mean income per day data:', error);
        throw error;
    }
}

export async function renderMeanIncomePerDayChart(canvasId) {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchMeanIncomePerDayData();
        const sortedData = data.data.sort((a, b) => a.Year - b.Year);
        
        const chartData = {
            labels: sortedData.map(d => d.Year),
            datasets: [{
                label: 'Mean Income per Day (international-$ 2021 prices)',
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
            series: 'Mean Income per Day'
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
                            return `Mean Income: $${context.parsed.y.toFixed(2)} per day`;
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
                        text: 'International-$ (2021 prices) per day',
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
                    beginAtZero: true
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
        console.error('Error rendering mean income per day chart:', error);
        throw error;
    }
}
