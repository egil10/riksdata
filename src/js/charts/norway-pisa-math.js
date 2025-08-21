// ============================================================================
// NORWAY PISA MATH CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';

async function fetchPisaMathData() {
    try {
        const response = await fetch('./data/static/norway_pisa_math.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching PISA math data:', error);
        throw error;
    }
}

export async function renderPisaMathChart(canvasId) {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchPisaMathData();
        const sortedData = data.data.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const chartData = {
            labels: sortedData.map(d => d.date),
            datasets: [{
                label: 'PISA Math Score',
                data: sortedData.map(d => d.math),
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderColor: 'rgba(54, 162, 235, 0.9)', // Blue
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                fill: false,
                tension: 0.1
            }]
        };

        // Add confidence intervals if available
        if (sortedData[0].math_lower && sortedData[0].math_upper) {
            chartData.datasets.push({
                label: 'Confidence Interval',
                data: sortedData.map(d => d.math_upper),
                borderWidth: 0,
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                fill: '+1',
                tension: 0.1
            });
            
            chartData.datasets.push({
                label: 'Confidence Interval',
                data: sortedData.map(d => d.math_lower),
                borderWidth: 0,
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                fill: false,
                tension: 0.1
            });
        }

        const exportData = sortedData.map(d => ({
            date: d.date,
            entity: d.Entity,
            code: d.Code,
            math_score: d.math,
            math_lower: d.math_lower,
            math_upper: d.math_upper,
            series: 'PISA Math Score'
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
                            if (context.datasetIndex === 0) {
                                const dataIndex = context.dataIndex;
                                const point = sortedData[dataIndex];
                                if (point.math_lower && point.math_upper) {
                                    return `Math Score: ${context.parsed.y.toFixed(1)} (${point.math_lower.toFixed(1)} - ${point.math_upper.toFixed(1)})`;
                                }
                                return `Math Score: ${context.parsed.y.toFixed(1)}`;
                            }
                            return null;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'year',
                        displayFormats: {
                            year: 'yyyy'
                        }
                    },
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
                        text: 'PISA Math Score',
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
        console.error('Error rendering PISA math chart:', error);
        throw error;
    }
}
