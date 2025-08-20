// ============================================================================
// STORTINGET WOMEN REPRESENTATION CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';

/**
 * Fetch Stortinget women representation data
 * @returns {Promise<Object>} Parsed JSON data
 */
async function fetchStortingetData() {
  try {
    const response = await fetch('/data/static/stortinget-women-representation.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching Stortinget data:', error);
    throw error;
  }
}

/**
 * Render women count chart (absolute numbers)
 * @param {string} canvasId - Canvas element ID
 * @returns {Promise<Chart>} Chart.js instance
 */
export async function renderWomenCountChart(canvasId) {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) {
    console.warn(`Canvas with id '${canvasId}' not found`);
    return null;
  }

  try {
    const data = await fetchStortingetData();
    
    // Sort data by year (oldest first)
    const sortedData = data.data.sort((a, b) => a.year - b.year);
    
    // Prepare chart data
    const chartData = {
      labels: sortedData.map(d => d.year),
      datasets: [{
        label: 'Number of Women',
        data: sortedData.map(d => d.women_count),
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderColor: 'rgba(220, 20, 60, 0.9)', // Crimson
        backgroundColor: 'rgba(220, 20, 60, 0.1)',
        fill: false,
        tension: 0.1
      }]
    };

    // Prepare data for export
    const exportData = sortedData.map(d => ({
      year: d.year,
      period: d.period,
      women_count: d.women_count,
      total: d.total,
      series: 'Women Count'
    }));
    registerChartData(canvasId, exportData);

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      parsing: false,
      normalized: true,
      resizeDelay: 100,
      plugins: {
        legend: { 
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            title: function(context) {
              const dataIndex = context[0].dataIndex;
              const period = sortedData[dataIndex].period;
              return `${context[0].label} (${period})`;
            },
            label: function(context) {
              const dataIndex = context[0].dataIndex;
              const total = sortedData[dataIndex].total;
              return `${context.dataset.label}: ${context.parsed.y} (of ${total} total)`;
            }
          }
        }
      },
      scales: {
        x: {
          type: 'category',
          display: true,
          title: {
            display: true,
            text: 'Year',
            font: {
              size: 12
            }
          },
          ticks: {
            maxTicksLimit: 10
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Number of Women',
            font: {
              size: 12
            }
          },
          beginAtZero: true,
          ticks: {
            stepSize: 10
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    };

    return new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: options
    });

  } catch (error) {
    console.error('Error rendering women count chart:', error);
    return null;
  }
}

/**
 * Render women percentage chart
 * @param {string} canvasId - Canvas element ID
 * @returns {Promise<Chart>} Chart.js instance
 */
export async function renderWomenPercentageChart(canvasId) {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) {
    console.warn(`Canvas with id '${canvasId}' not found`);
    return null;
  }

  try {
    const data = await fetchStortingetData();
    
    // Sort data by year (oldest first)
    const sortedData = data.data.sort((a, b) => a.year - b.year);
    
    // Prepare chart data
    const chartData = {
      labels: sortedData.map(d => d.year),
      datasets: [{
        label: 'Percentage of Women',
        data: sortedData.map(d => d.women_percentage),
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderColor: 'rgba(75, 0, 130, 0.9)', // Indigo
        backgroundColor: 'rgba(75, 0, 130, 0.1)',
        fill: false,
        tension: 0.1
      }]
    };

    // Prepare data for export
    const exportData = sortedData.map(d => ({
      year: d.year,
      period: d.period,
      women_percentage: d.women_percentage,
      women_count: d.women_count,
      total: d.total,
      series: 'Women Percentage'
    }));
    registerChartData(canvasId, exportData);

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      parsing: false,
      normalized: true,
      resizeDelay: 100,
      plugins: {
        legend: { 
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            title: function(context) {
              const dataIndex = context[0].dataIndex;
              const period = sortedData[dataIndex].period;
              return `${context[0].label} (${period})`;
            },
            label: function(context) {
              const dataIndex = context[0].dataIndex;
              const womenCount = sortedData[dataIndex].women_count;
              const total = sortedData[dataIndex].total;
              return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}% (${womenCount}/${total})`;
            }
          }
        }
      },
      scales: {
        x: {
          type: 'category',
          display: true,
          title: {
            display: true,
            text: 'Year',
            font: {
              size: 12
            }
          },
          ticks: {
            maxTicksLimit: 10
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Percentage (%)',
            font: {
              size: 12
            }
          },
          beginAtZero: true,
          max: 50,
          ticks: {
            stepSize: 5,
            callback: function(value) {
              return value + '%';
            }
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    };

    return new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: options
    });

  } catch (error) {
    console.error('Error rendering women percentage chart:', error);
    return null;
  }
}
