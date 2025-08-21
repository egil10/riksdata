// ============================================================================
// NORWAY AVG YEARS SCHOOLING CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchAvgYearsSchoolingData() {
    try {
        const response = await fetch('./data/static/norway_avg_years_schooling.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching avg years schooling data:', error);
        throw error;
    }
}

export async function renderAvgYearsSchoolingChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchAvgYearsSchoolingData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Avg Years Schooling');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for avg years schooling chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Avg Years Schooling'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Avg Years Schooling', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering avg years schooling chart:', error);
        throw error;
    }
}
