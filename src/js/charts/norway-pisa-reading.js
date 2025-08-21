// ============================================================================
// NORWAY PISA READING CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchPisaReadingData() {
    try {
        const response = await fetch('/data/static/norway_pisa_reading.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching pisa reading data:', error);
        throw error;
    }
}

export async function renderPisaReadingChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchPisaReadingData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Pisa Reading');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for pisa reading chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Pisa Reading'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Pisa Reading', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering pisa reading chart:', error);
        throw error;
    }
}
