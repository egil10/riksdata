// ============================================================================
// NORWAY EMPLOYMENT AGRICULTURE CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchEmploymentAgricultureData() {
    try {
        const response = await fetch('/data/static/norway_employment_in_agriculture_share.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching employment agriculture data:', error);
        throw error;
    }
}

export async function renderEmploymentAgricultureChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchEmploymentAgricultureData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Employment Agriculture');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for employment agriculture chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Employment Agriculture'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Employment Agriculture', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering employment agriculture chart:', error);
        throw error;
    }
}
