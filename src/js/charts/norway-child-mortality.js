// ============================================================================
// NORWAY CHILD MORTALITY CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchChildMortalityData() {
    try {
        const response = await fetch('/data/static/norway_child_mortality.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching child mortality data:', error);
        throw error;
    }
}

export async function renderChildMortalityChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchChildMortalityData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Child Mortality');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for child mortality chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Child Mortality'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Child Mortality', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering child mortality chart:', error);
        throw error;
    }
}
