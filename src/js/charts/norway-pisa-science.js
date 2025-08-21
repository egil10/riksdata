// ============================================================================
// NORWAY PISA SCIENCE CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchPisaScienceData() {
    try {
        const response = await fetch('/data/static/norway_pisa_science.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching pisa science data:', error);
        throw error;
    }
}

export async function renderPisaScienceChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchPisaScienceData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Pisa Science');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for pisa science chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Pisa Science'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Pisa Science', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering pisa science chart:', error);
        throw error;
    }
}
