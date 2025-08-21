// ============================================================================
// NORWAY WOMEN PARLIAMENT CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchWomenParliamentData() {
    try {
        const response = await fetch('./data/static/norway_women_in_parliament.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching women parliament data:', error);
        throw error;
    }
}

export async function renderWomenParliamentChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchWomenParliamentData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Women Parliament');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for women parliament chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Women Parliament'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Women Parliament', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering women parliament chart:', error);
        throw error;
    }
}
