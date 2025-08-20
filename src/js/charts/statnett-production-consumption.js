/**
 * Statnett Production and Consumption Chart
 * 
 * Displays Norwegian electricity production and consumption data from Statnett.
 * Data includes daily values from 2012 onwards with production, consumption, and net values.
 */

import { renderChart } from '../charts.js';
import { getPoliticalPartyColors } from '../config.js';

export async function createStatnettProductionConsumptionChart(canvasId, dataUrl, title) {
    try {
        // Fetch the data
        const response = await fetch(dataUrl, { 
            cache: 'no-store',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to load Statnett data: ${response.status} ${response.statusText}`);
        }
        
        const rawData = await response.json();
        console.log(`Successfully loaded Statnett data:`, rawData);
        
        // Process the data
        const chartData = processStatnettData(rawData);
        if (!chartData) {
            throw new Error('Failed to process Statnett data');
        }
        
        // Get the canvas element
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            throw new Error(`Canvas element not found: ${canvasId}`);
        }
        
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded');
            return null;
        }
        
        // Clear any existing chart
        if (canvas.chart) {
            canvas.chart.destroy();
        }
        
        // Create the chart directly with Chart.js
        canvas.chart = new Chart(canvas, {
            type: 'line',
            data: chartData,
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
                                return context[0].label;
                            },
                            label: function(context) {
                                const value = context.parsed.y;
                                const label = context.dataset.label;
                                return `${label}: ${(value / 1000000).toFixed(1)}M MWh`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'category',
                        labels: dates.map(date => date.getFullYear().toString()),
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxTicksLimit: 15,
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
                                return (value / 1000000).toFixed(1) + 'M MWh';
                            },
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
        
        console.log(`Successfully rendered Statnett chart: ${canvasId}`);
        return canvas.chart;
        
    } catch (error) {
        console.error(`Failed to create Statnett chart ${canvasId}:`, error);
        return null;
    }
}

function processStatnettData(rawData) {
    // Handle both the new JSON format and legacy format
    let dataArray;
    
    if (rawData.data && Array.isArray(rawData.data)) {
        // New format: { data: [...] }
        dataArray = rawData.data;
    } else if (Array.isArray(rawData)) {
        // Legacy format: direct array
        dataArray = rawData;
    } else {
        console.error('Invalid Statnett data format:', rawData);
        return null;
    }

    const dates = [];
    const production = [];
    const consumption = [];
    const net = [];

    dataArray.forEach(item => {
        if (item.year && item.production !== undefined && item.consumption !== undefined) {
            // New format: year-based data
            dates.push(new Date(item.year, 0, 1)); // January 1st of the year
            production.push(item.production);
            consumption.push(item.consumption);
            net.push(item.net || (item.production - item.consumption));
        } else if (item.Date && item.Production !== undefined && item.Consumption !== undefined) {
            // Legacy format: date-based data
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
        labels: dates.map(date => date.getFullYear().toString()),
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
