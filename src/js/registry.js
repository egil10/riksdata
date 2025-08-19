// Central registry both main.js and charts.js can import
export const chartDataRegistry = new Map();

/** Save normalized data for a chart card id */
export function registerChartData(id, dataArray) {
  console.log('[registry] Registering data for chart:', id, 'with', dataArray?.length, 'data points');
  chartDataRegistry.set(id, dataArray);
}

/** Read back data (used by copy/download handlers) */
export function getDataById(id) {
  const data = chartDataRegistry.get(id) || [];
  console.log('[registry] Getting data for chart:', id, 'found', data?.length, 'data points');
  return data;
}
