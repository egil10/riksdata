// ============================================================================
// NORWAY VACCINATION COVERAGE CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';

/**
 * Fetch Norway vaccination coverage data from the JSON file
 * @returns {Promise<Object>} The vaccination coverage data
 */
async function fetchVaccinationCoverageData() {
    try {
        const response = await fetch('./data/static/norway_vaccination_coverage.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching vaccination coverage data:', error);
        throw error;
    }
}

/**
 * Render Norway vaccination coverage chart
 * @param {string} canvasId - Canvas element ID
 * @returns {Promise<Chart|null>} Chart.js instance or null
 */
export async function renderVaccinationCoverageChart(canvasId) {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) {
        console.warn(`Canvas with id '${canvasId}' not found`);
        return null;
    }

    try {
        const data = await fetchVaccinationCoverageData();
        
        // Group data by antigen and get the most recent data for each
        const antigenData = {};
        data.data.forEach(item => {
            if (item.value !== null && item.value !== undefined) {
                const antigen = item.antigen;
                if (!antigenData[antigen] || item.Year > antigenData[antigen].Year) {
                    antigenData[antigen] = item;
                }
            }
        });

        // Convert to array and sort by coverage value
        const sortedData = Object.values(antigenData)
            .sort((a, b) => b.value - a.value);

        // Create readable labels for antigens
        const antigenLabels = {
            'coverage__antigen_dtpcv3': 'DTP/DTC',
            'coverage__antigen_hepb3': 'Hepatitis B',
            'coverage__antigen_hib3': 'Hib',
            'coverage__antigen_ipv1': 'Polio',
            'coverage__antigen_mcv1': 'Measles',
            'coverage__antigen_pcv3': 'Pneumococcal',
            'coverage__antigen_pol3': 'Polio (3rd dose)',
            'coverage__antigen_rcv1': 'Rubella',
            'coverage__antigen_rotac': 'Rotavirus'
        };

        const chartData = {
            labels: sortedData.map(d => antigenLabels[d.antigen] || d.antigen),
            datasets: [{
                label: 'Vaccination Coverage (%)',
                data: sortedData.map(d => d.value),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(199, 199, 199, 0.8)',
                    'rgba(83, 102, 255, 0.8)',
                    'rgba(255, 99, 255, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(199, 199, 199, 1)',
                    'rgba(83, 102, 255, 1)',
                    'rgba(255, 99, 255, 1)'
                ],
                borderWidth: 1
            }]
        };

        const exportData = sortedData.map(d => ({
            antigen: antigenLabels[d.antigen] || d.antigen,
            year: d.Year,
            value: d.value,
            series: 'Vaccination Coverage'
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
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    cornerRadius: 6,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            return `${context[0].label}`;
                        },
                        label: function(context) {
                            const dataPoint = sortedData[context.dataIndex];
                            return `Coverage: ${context.parsed.y}% (${dataPoint.Year})`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Vaccine Type',
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
                        maxRotation: 45
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Coverage (%)',
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
                            return value + '%';
                        }
                    },
                    min: 0,
                    max: 100
                }
            }
        };

        const chart = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: options
        });

        return chart;
    } catch (error) {
        console.error('Error rendering vaccination coverage chart:', error);
        throw error;
    }
}
