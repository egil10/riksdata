// chart-theme.js - Chart theming utilities for Riksdata (Light theme only)

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

// Apply theme to Chart.js defaults
export function applyChartJsTheme(Chart) {
  const t = currentChartTheme();
  
  Chart.defaults.color = t.text;
  Chart.defaults.borderColor = t.grid;
  Chart.defaults.backgroundColor = t.bg;
}
