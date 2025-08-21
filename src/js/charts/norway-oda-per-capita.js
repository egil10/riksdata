// ============================================================================
// NORWAY ODA PER CAPITA CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchOdaPerCapitaData() {
    try {
        const response = await fetch('/data/static/norway_oda_per_capita.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching oda per capita data:', error);
        throw error;
    }
}

export async function renderOdaPerCapitaChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchOdaPerCapitaData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Oda Per Capita');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for oda per capita chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Oda Per Capita'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Oda Per Capita', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering oda per capita chart:', error);
        throw error;
    }
}
