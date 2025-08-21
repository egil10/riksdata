// ============================================================================
// NORWAY ALCOHOL CONSUMPTION CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchAlcoholConsumptionData() {
    try {
        const response = await fetch('/data/static/norway_alcohol_consumption_per_capita.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching alcohol consumption data:', error);
        throw error;
    }
}

export async function renderAlcoholConsumptionChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchAlcoholConsumptionData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Alcohol Consumption');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for alcohol consumption chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Alcohol Consumption'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Alcohol Consumption', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering alcohol consumption chart:', error);
        throw error;
    }
}
