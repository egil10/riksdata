// ============================================================================
// NORWAY HDI CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchHdiData() {
    try {
        const response = await fetch('./data/static/norway_hdi.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching hdi data:', error);
        throw error;
    }
}

export async function renderHdiChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchHdiData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Hdi');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for hdi chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Hdi'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Hdi', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering hdi chart:', error);
        throw error;
    }
}
