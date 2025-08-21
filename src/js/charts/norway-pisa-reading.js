// ============================================================================
// NORWAY PISA READING CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';

async function fetchPisaReadingData() {
    try {
        const response = await fetch('./data/static/norway_pisa_reading.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching PISA reading data:', error);
        throw error;
    }
}

export async function renderPisaReadingChart(canvasId) {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchPisaReadingData();
        const sortedData = data.data.sort((a, b) => a.year - b.year);
        
        const chartData = {
            labels: sortedData.map(d => d.year),
            datasets: [{
                label: 'PISA Reading Score',
                data: sortedData.map(d => d.pisa_reading_score),
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderColor: 'rgba(201, 203, 207, 0.9)', // Gray
                backgroundColor: 'rgba(201, 203, 207, 0.1)',
                fill: false,
                tension: 0.1
            }]
        };

        const exportData = sortedData.map(d => ({
            year: d.year,
            entity: d.Entity,
            code: d.Code,
            pisa_reading_score: d.pisa_reading_score,
            is_missing: d.is_missing,
            series: 'PISA Reading Score'
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
                            return `Reading Score: ${context.parsed.y.toFixed(1)}`;
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
                        text: 'PISA Reading Score',
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
                    min: 400,
                    max: 600
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
        console.error('Error rendering PISA reading chart:', error);
        throw error;
    }
}
