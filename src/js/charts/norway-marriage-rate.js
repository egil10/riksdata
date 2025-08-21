// ============================================================================
// NORWAY MARRIAGE RATE CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchMarriageRateData() {
    try {
        const response = await fetch('./data/static/norway_marriage_rate.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching marriage rate data:', error);
        throw error;
    }
}

export async function renderMarriageRateChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchMarriageRateData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Marriage Rate');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for marriage rate chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Marriage Rate'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Marriage Rate', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering marriage rate chart:', error);
        throw error;
    }
}
