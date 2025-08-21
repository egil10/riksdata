// ============================================================================
// NORWAY RND RESEARCHERS CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchRndResearchersData() {
    try {
        const response = await fetch('./data/static/norway_rnd_researchers.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching rnd researchers data:', error);
        throw error;
    }
}

export async function renderRndResearchersChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchRndResearchersData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Rnd Researchers');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for rnd researchers chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Rnd Researchers'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Rnd Researchers', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering rnd researchers chart:', error);
        throw error;
    }
}
