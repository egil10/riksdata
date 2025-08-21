// ============================================================================
// NORWAY ENERGY USE PER CAPITA CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchEnergyUsePerCapitaData() {
    try {
        const response = await fetch('./data/static/norway_energy_use_per_capita.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching energy use per capita data:', error);
        throw error;
    }
}

export async function renderEnergyUsePerCapitaChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchEnergyUsePerCapitaData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Energy Use Per Capita');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for energy use per capita chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Energy Use Per Capita'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Energy Use Per Capita', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering energy use per capita chart:', error);
        throw error;
    }
}
