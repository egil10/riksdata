// ============================================================================
// NORWAY PISA MATH CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchPisaMathData() {
    try {
        const response = await fetch('/data/static/norway_pisa_math.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching pisa math data:', error);
        throw error;
    }
}

export async function renderPisaMathChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchPisaMathData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Pisa Math');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for pisa math chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Pisa Math'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Pisa Math', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering pisa math chart:', error);
        throw error;
    }
}
