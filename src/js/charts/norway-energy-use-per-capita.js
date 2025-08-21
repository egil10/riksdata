// ============================================================================
// NORWAY ENERGY USE PER CAPITA CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';

async function fetchEnergyUsePerCapitaData() {
    try {
        const response = await fetch('./data/static/norway_energy_use_per_capita.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching energy use per capita data:', error);
        throw error;
    }
}

export async function renderEnergyUsePerCapitaChart(canvasId) {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchEnergyUsePerCapitaData();
        const sortedData = data.data.sort((a, b) => a.Year - b.Year);
        
        const chartData = {
            labels: sortedData.map(d => d.Year),
            datasets: [{
                label: 'Primary Energy Consumption per Capita (kWh/person)',
                data: sortedData.map(d => d.value),
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                borderColor: 'rgba(255, 99, 132, 0.9)', // Red-pink
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
            series: 'Energy Use per Capita'
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
                            return `Energy Use: ${context.parsed.y.toLocaleString()} kWh per person`;
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
                        text: 'Kilowatt-hours per Person',
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
                        callback: function(value) {
                            return value.toLocaleString();
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
        console.error('Error rendering energy use per capita chart:', error);
        throw error;
    }
}
