// Central registry both main.js and charts.js can import
export const chartDataRegistry = new Map();

/** Save normalized data for a chart card id */
export function registerChartData(id, dataArray) {
  chartDataRegistry.set(id, dataArray);
}

/** Read back data (used by copy/download handlers) */
export function getDataById(id) {
  return chartDataRegistry.get(id) || [];
}
