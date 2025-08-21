// ============================================================================
// NORWAY MILITARY SPENDING CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchMilitarySpendingData() {
    try {
        const response = await fetch('./data/static/norway_military_spending.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching military spending data:', error);
        throw error;
    }
}

export async function renderMilitarySpendingChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchMilitarySpendingData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Military Spending');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for military spending chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Military Spending'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Military Spending', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering military spending chart:', error);
        throw error;
    }
}
