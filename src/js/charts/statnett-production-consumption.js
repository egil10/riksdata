/**
 * Statnett Production and Consumption Chart
 * 
 * Displays Norwegian electricity production and consumption data from Statnett.
 * Data includes daily values from 2012 onwards with production, consumption, and net values.
 */

import { createChart, applyThemeColors } from '../charts.js';
import { getPoliticalPartyColors } from '../config.js';

export function createStatnettProductionConsumptionChart(canvasId, dataUrl, title) {
    return createChart(canvasId, dataUrl, title, processStatnettData, {
        type: 'line',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#ffffff',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            const date = new Date(context[0].parsed.x);
                            return date.toLocaleDateString('no-NO', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            });
                        },
                        label: function(context) {
                            const value = context.parsed.y;
                            const label = context.dataset.label;
                            return `${label}: ${value.toLocaleString('no-NO')} MWh`;
                        }
                    }
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
                        maxTicksLimit: 12,
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('no-NO') + ' MWh';
                        },
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

function processStatnettData(rawData) {
    if (!Array.isArray(rawData)) {
        console.error('Invalid Statnett data format:', rawData);
        return null;
    }

    const dates = [];
    const production = [];
    const consumption = [];
    const net = [];

    rawData.forEach(item => {
        if (item.Date && item.Production !== undefined && item.Consumption !== undefined) {
            dates.push(new Date(item.Date));
            production.push(item.Production);
            consumption.push(item.Consumption);
            net.push(item.Net || (item.Production - item.Consumption));
        }
    });

    if (dates.length === 0) {
        console.error('No valid data points found in Statnett data');
        return null;
    }

    // Get political party colors for the time period
    const partyColors = getPoliticalPartyColors();
    
    return {
        labels: dates,
        datasets: [
            {
                label: 'Production',
                data: production,
                borderColor: '#2563eb', // Blue for production
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 4
            },
            {
                label: 'Consumption',
                data: consumption,
                borderColor: '#dc2626', // Red for consumption
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 4
            },
            {
                label: 'Net (Production - Consumption)',
                data: net,
                borderColor: '#059669', // Green for net positive
                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 4,
                borderDash: [5, 5] // Dashed line for net
            }
        ]
    };
}

// Export for use in main.js
export default {
    createStatnettProductionConsumptionChart
};
