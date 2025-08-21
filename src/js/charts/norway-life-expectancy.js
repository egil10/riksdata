// ============================================================================
// NORWAY LIFE EXPECTANCY CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchLifeExpectancyData() {
    try {
        const response = await fetch('./data/static/norway_life_expectancy.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching life expectancy data:', error);
        throw error;
    }
}

export async function renderLifeExpectancyChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchLifeExpectancyData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Life Expectancy');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for life expectancy chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Life Expectancy'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Life Expectancy', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering life expectancy chart:', error);
        throw error;
    }
}
