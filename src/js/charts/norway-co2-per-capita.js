// ============================================================================
// NORWAY CO2 PER CAPITA CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchCo2PerCapitaData() {
    try {
        const response = await fetch('./data/static/norway_co2_per_capita.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching co2 per capita data:', error);
        throw error;
    }
}

export async function renderCo2PerCapitaChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchCo2PerCapitaData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Co2 Per Capita');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for co2 per capita chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Co2 Per Capita'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Co2 Per Capita', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering co2 per capita chart:', error);
        throw error;
    }
}
