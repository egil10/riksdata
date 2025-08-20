// ============================================================================
// NVE MAGASINSTATISTIKK CHART RENDERING
// ============================================================================

import { fetchAllSeries, fetchMinMaxMedian, buildSeriesForArea, getChartYears } from '../sources/nve-magasins.js';
import { registerChartData } from '../registry.js';

/**
 * Render reservoir fill chart for a specific area
 * @param {string} canvasId - Canvas element ID
 * @param {string} area - Area code (Norge, NO1, etc.)
 * @returns {Promise<Chart>} Chart.js instance
 */
export async function renderMagasinChart(canvasId, area = 'Norge') {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) {
    console.warn(`Canvas with id '${canvasId}' not found`);
    return null;
  }

  try {
    // Fetch data from NVE API
    const [all, stats] = await Promise.all([fetchAllSeries(), fetchMinMaxMedian()]);
    const { yearNow, yearPrev } = getChartYears();

    const { cur, prev, minSeries, maxSeries, medianSeries } =
      buildSeriesForArea(all, stats, area, yearNow, yearPrev);

    // Prepare data for export
    const exportData = [
      ...cur.map(d => ({ date: d.x, value: d.y, series: `${yearNow}`, area })),
      ...prev.map(d => ({ date: d.x, value: d.y, series: `${yearPrev}`, area })),
      ...medianSeries.map(d => ({ date: d.x, value: d.y, series: 'Median (20y)', area }))
    ];
    registerChartData(canvasId, exportData);

    const data = {
      datasets: [
        // Band: min..max (use "fill: +1" trick)
        {
          label: 'Min (20y)',
          data: minSeries,
          borderWidth: 0,
          pointRadius: 0,
          backgroundColor: 'rgba(173, 216, 230, 0.3)', // Light blue
          fill: '+1' // fill to next dataset (max)
        },
        {
          label: 'Max (20y)',
          data: maxSeries,
          borderWidth: 0,
          pointRadius: 0,
          backgroundColor: 'rgba(173, 216, 230, 0.3)', // Light blue
          fill: false
        },
        // Median
        {
          label: 'Median (20y)',
          data: medianSeries,
          borderWidth: 1,
          pointRadius: 0,
          borderDash: [4, 3],
          borderColor: 'rgba(100, 149, 237, 0.8)', // Cornflower blue
          backgroundColor: 'rgba(100, 149, 237, 0.1)'
        },
        // Last year
        {
          label: `${yearPrev}`,
          data: prev,
          borderWidth: 1,
          pointRadius: 0,
          borderDash: [2, 2],
          borderColor: 'rgba(169, 169, 169, 0.6)', // Light gray
          backgroundColor: 'rgba(169, 169, 169, 0.1)'
        },
        // Current year
        {
          label: `${yearNow}`,
          data: cur,
          borderWidth: 2,
          pointRadius: 0,
          borderColor: 'rgba(220, 20, 60, 0.9)', // Crimson
          backgroundColor: 'rgba(220, 20, 60, 0.1)'
        }
      ]
    };

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
              size: 11
            }
          }
        },
        decimation: { enabled: true, algorithm: 'lttb', samples: 400 },
        tooltip: { 
          mode: 'nearest', 
          intersect: false,
          callbacks: {
            title: function(context) {
              const date = new Date(context[0].parsed.x);
              return date.toLocaleDateString('no-NO', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              });
            },
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
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
              week: 'MMM dd'
            }
          }, 
          ticks: { 
            maxRotation: 0,
            font: { size: 10 }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }, 
        y: { 
          title: { 
            display: true, 
            text: 'Fyllingsgrad (%)',
            font: { size: 12 }
          }, 
          suggestedMin: 0, 
          suggestedMax: 100,
          ticks: {
            font: { size: 10 }
          },
          grid: {
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

    // Destroy existing chart if it exists
    const existing = Chart.getChart(ctx.canvas);
    if (existing) existing.destroy();

    return new Chart(ctx, { type: 'line', data, options });

  } catch (error) {
    console.error(`Failed to render NVE magasin chart for ${area}:`, error);
    throw error;
  }
}

/**
 * Get area display name
 * @param {string} area - Area code
 * @returns {string} Display name
 */
export function getAreaDisplayName(area) {
  const areaNames = {
    'Norge': 'Norge',
    'NO1': 'Østlandet (NO1)',
    'NO2': 'Sørlandet (NO2)',
    'NO3': 'Vestlandet (NO3)',
    'NO4': 'Trøndelag (NO4)',
    'NO5': 'Nord-Norge (NO5)'
  };
  return areaNames[area] || area;
}
