// ============================================================================
// NORWAY DAILY CALORIES CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchDailyCaloriesData() {
    try {
        const response = await fetch('./data/static/norway_daily_calories.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching daily calories data:', error);
        throw error;
    }
}

export async function renderDailyCaloriesChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchDailyCaloriesData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Daily Calories');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for daily calories chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Daily Calories'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Daily Calories', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering daily calories chart:', error);
        throw error;
    }
}
