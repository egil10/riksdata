// ============================================================================
// NORWAY MATERNAL MORTALITY CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchMaternalMortalityData() {
    try {
        const response = await fetch('/data/static/norway_maternal_mortality.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching maternal mortality data:', error);
        throw error;
    }
}

export async function renderMaternalMortalityChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchMaternalMortalityData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Maternal Mortality');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for maternal mortality chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Maternal Mortality'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Maternal Mortality', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering maternal mortality chart:', error);
        throw error;
    }
}
