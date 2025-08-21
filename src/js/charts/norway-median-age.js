// ============================================================================
// NORWAY MEDIAN AGE CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchMedianAgeData() {
    try {
        const response = await fetch('./data/static/norway_median_age.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching median age data:', error);
        throw error;
    }
}

export async function renderMedianAgeChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchMedianAgeData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Median Age');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for median age chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Median Age'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Median Age', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering median age chart:', error);
        throw error;
    }
}
