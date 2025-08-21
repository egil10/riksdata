// ============================================================================
// NORWAY ODA PER CAPITA CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';

/**
 * Fetch Norway ODA per capita data
 * @returns {Promise<Object>} Parsed JSON data
 */
async function fetchOdaData() {
  try {
    const response = await fetch('/data/static/norway_oda_per_capita.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching ODA data:', error);
    throw error;
  }
}

/**
 * Render Norway ODA per capita chart
 * @param {string} canvasId - Canvas element ID
 * @returns {Promise<Chart>} Chart.js instance
 */
export async function renderOdaPerCapitaChart(canvasId) {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) {
    console.warn(`Canvas with id '${canvasId}' not found`);
    return null;
  }

  try {
    const data = await fetchOdaData();
    
    // Sort data by year (oldest first)
    const sortedData = data.data.sort((a, b) => a.Year - b.Year);
    
    // Prepare chart data
    const chartData = {
      labels: sortedData.map(d => d.Year),
      datasets: [{
        label: 'ODA per Capita (USD)',
        data: sortedData.map(d => d.value),
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderColor: 'rgba(34, 139, 34, 0.9)', // Forest Green
        backgroundColor: 'rgba(34, 139, 34, 0.1)',
        fill: false,
        tension: 0.1
      }]
    };

    // Prepare data for export
    const exportData = sortedData.map(d => ({
      year: d.Year,
      entity: d.Entity,
      code: d.Code,
      value: d.value,
      series: 'ODA per Capita'
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
              return `Year: ${context[0].label}`;
            },
            label: function(context) {
              return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
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
            font: {
              size: 12
            }
          },
          ticks: {
            maxTicksLimit: 10,
            font: {
              size: 10
            }
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'USD per Capita',
            font: {
              size: 12
            }
          },
          ticks: {
            callback: function(value) {
              return '$' + value.toLocaleString();
            },
            font: {
              size: 10
            }
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    };

    // Create chart
    const chart = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: options
    });

    return chart;

  } catch (error) {
    console.error('Error rendering ODA chart:', error);
    throw error;
  }
}
