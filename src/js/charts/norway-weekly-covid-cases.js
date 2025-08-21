// ============================================================================
// NORWAY WEEKLY COVID CASES CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';

async function fetchWeeklyCovidCasesData() {
    try {
        const response = await fetch('./data/static/norway_weekly_covid_cases.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching weekly COVID cases data:', error);
        throw error;
    }
}

export async function renderWeeklyCovidCasesChart(canvasId) {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchWeeklyCovidCasesData();
        const sortedData = data.data.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const chartData = {
            labels: sortedData.map(d => d.date),
            datasets: [{
                label: 'Weekly COVID Cases',
                data: sortedData.map(d => d.value),
                borderWidth: 2,
                pointRadius: 2,
                pointHoverRadius: 4,
                borderColor: 'rgba(255, 99, 132, 0.9)', // Red
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                fill: false,
                tension: 0.1
            }]
        };

        const exportData = sortedData.map(d => ({
            date: d.date,
            entity: d.Entity,
            code: d.Code,
            value: d.value,
            series: 'Weekly COVID Cases'
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
                            return `Date: ${context[0].label}`;
                        },
                        label: function(context) {
                            return `Weekly Cases: ${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'week',
                        displayFormats: {
                            week: 'MMM yyyy'
                        }
                    },
                    display: true,
                    title: {
                        display: true,
                        text: 'Date',
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
                        text: 'Weekly Confirmed Cases',
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
        console.error('Error rendering weekly COVID cases chart:', error);
        throw error;
    }
}
