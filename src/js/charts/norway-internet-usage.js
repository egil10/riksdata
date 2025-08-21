// ============================================================================
// NORWAY INTERNET USAGE CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchInternetUsageData() {
    try {
        const response = await fetch('/data/static/norway_internet_use.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching internet usage data:', error);
        throw error;
    }
}

export async function renderInternetUsageChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchInternetUsageData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Internet Usage');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for internet usage chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Internet Usage'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Internet Usage', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering internet usage chart:', error);
        throw error;
    }
}
