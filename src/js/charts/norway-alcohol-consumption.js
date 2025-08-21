// ============================================================================
// NORWAY ALCOHOL CONSUMPTION PER CAPITA CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';

async function fetchAlcoholConsumptionData() {
    try {
        const response = await fetch('./data/static/norway_alcohol_consumption_per_capita.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching alcohol consumption data:', error);
        throw error;
    }
}

export async function renderAlcoholConsumptionChart(canvasId) {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchAlcoholConsumptionData();
        const sortedData = data.data.sort((a, b) => a.Year - b.Year);
        
        const chartData = {
            labels: sortedData.map(d => d.Year),
            datasets: [{
                label: 'Alcohol Consumption per Capita (liters of pure alcohol)',
                data: sortedData.map(d => d.value),
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                borderColor: 'rgba(153, 102, 255, 0.9)', // Purple
                backgroundColor: 'rgba(153, 102, 255, 0.1)',
                fill: false,
                tension: 0.1
            }]
        };

        const exportData = sortedData.map(d => ({
            year: d.Year,
            entity: d.Entity,
            code: d.Code,
            value: d.value,
            series: 'Alcohol Consumption per Capita'
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
                            return `Alcohol Consumption: ${context.parsed.y.toFixed(2)} liters per person (15+)`;
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
                        text: 'Liters of Pure Alcohol per Person (15+)',
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
        console.error('Error rendering alcohol consumption chart:', error);
        throw error;
    }
}
