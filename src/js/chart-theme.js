// chart-theme.js - Chart theming utilities for Riksdata

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function currentChartTheme() {
  return {
    text: cssVar('--text'),
    textMuted: cssVar('--text-muted'),
    grid: cssVar('--grid'),
    bg: cssVar('--card'),
    accent: cssVar('--accent'),
    accent2: cssVar('--accent-2'),
    accent3: cssVar('--accent-3'),
    accent4: cssVar('--accent-4'),
    series: [
      cssVar('--accent'), 
      cssVar('--accent-2'), 
      cssVar('--accent-3'), 
      cssVar('--accent-4')
    ],
  };
}

// Apply theme to Chart.js
export function applyChartJsTheme(Chart) {
  const t = currentChartTheme();
  
  Chart.defaults.color = t.text;
  Chart.defaults.borderColor = t.grid;
  Chart.defaults.backgroundColor = t.bg;
}

// Update existing charts when theme changes
export function updateChartsOnThemeChange() {
  window.addEventListener('themechange', () => {
    const t = currentChartTheme();
    
    // Update all chart instances
    if (window.chartInstances) {
      Object.values(window.chartInstances).forEach((chart) => {
        if (chart && chart.options) {
          // Update scales
          if (chart.options.scales) {
            Object.values(chart.options.scales).forEach(scale => {
              if (scale.grid) {
                scale.grid.color = t.grid;
              }
              if (scale.ticks) {
                scale.ticks.color = t.textMuted;
              }
            });
          }
          
          // Update legend
          if (chart.options.plugins?.legend?.labels) {
            chart.options.plugins.legend.labels.color = t.text;
          }
          
          // Update tooltip
          if (chart.options.plugins?.tooltip) {
            chart.options.plugins.tooltip.backgroundColor = t.bg;
            chart.options.plugins.tooltip.titleColor = t.text;
            chart.options.plugins.tooltip.bodyColor = t.text;
            chart.options.plugins.tooltip.borderColor = t.grid;
          }
          
          // Update datasets colors if they're using theme colors
          if (chart.data && chart.data.datasets) {
            chart.data.datasets.forEach((dataset, index) => {
              // Update line colors
              if (dataset.borderColor && typeof dataset.borderColor === 'string' && 
                  (dataset.borderColor.includes('var(--accent)') || dataset.borderColor.includes('#'))) {
                dataset.borderColor = t.accent;
                dataset.backgroundColor = t.accent;
              }
              
              // Update bar colors
              if (dataset.backgroundColor && Array.isArray(dataset.backgroundColor)) {
                dataset.backgroundColor = dataset.backgroundColor.map(color => {
                  if (color.includes('var(--accent)') || color.includes('#')) {
                    return `${t.accent}cc`; // Add opacity
                  }
                  return color;
                });
              }
              
              if (dataset.borderColor && Array.isArray(dataset.borderColor)) {
                dataset.borderColor = dataset.borderColor.map(color => {
                  if (color.includes('var(--accent)') || color.includes('#')) {
                    return t.accent;
                  }
                  return color;
                });
              }
            });
          }
          
          // Update the chart
          chart.update('none');
        }
      });
    }
  });
}

// Initialize chart theming
document.addEventListener('DOMContentLoaded', () => {
  updateChartsOnThemeChange();
});
